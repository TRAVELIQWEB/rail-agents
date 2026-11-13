import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual result component and its formatter without a provider request.
const source = readFileSync(new URL("../src/app/pnr-status/page.tsx", import.meta.url), "utf8");
const whatsappUtility = { exports: {} };
vm.runInNewContext(ts.transpileModule(
  readFileSync(new URL("../src/lib/whatsapp.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText, whatsappUtility);
function harness(prediction = null) {
  let stateIndex = 0;
  const states = [];
  const jsx = (type, props) => ({ type, props });
  const sandbox = {
    exports: {}, Intl, Date, URLSearchParams, AbortSignal,
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (name === "react") return {
        useState(initial) {
          const index = stateIndex++;
          if (!(index in states)) states[index] = index === 1 && prediction ? prediction : initial;
          return [states[index], (value) => { states[index] = value; }];
        },
        useRef: () => ({ current: { showModal() {}, close() {}, focus() {} } }),
        useEffect() {},
      };
      if (name.includes("pnr-waitlist")) return { isWaitingListStatus: (s) => /WL/i.test(s) };
      if (name.includes("pnr-journey")) return { pnrJourneyNotice: () => null };
      if (name === "@/components/WhatsAppSettingsProvider") return { useWhatsAppSettings: () => ({ enabled: true }) };
      if (name === "@/lib/whatsapp") return whatsappUtility.exports;
      return {};
    },
    navigator: { clipboard: { writeText: async (value) => { sandbox.copied = value; } } },
  };
  vm.runInNewContext(ts.transpileModule(source + "\nexport { PnrResult, SharePnrDetails };", {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText, sandbox);
  return { sandbox, render: (name, props) => { stateIndex = 0; return sandbox.exports[name](props); } };
}
function find(node, predicate) {
  if (!node || typeof node !== "object") return undefined;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = find(child, predicate);
    if (found) return found;
  }
}
function message(data, prediction) {
  const h = harness(prediction);
  const tree = h.render("PnrResult", { response: { data }, pnr: "0000000000" });
  return find(tree, (n) => typeof n.props?.createMessage === "function").props.createMessage();
}

test("one confirmed passenger preserves allocation, quota, fare and optional omissions", () => {
  const text = message({ trainNumber: "12345", passengers: [{ bookingStatus: { status: "CNF", coach: "B1", berth: 7, quota: "GN" }, currentStatus: "CNF / B1 / 7" }], totalFare: 1250, chartPrepared: true, name: "PRIVATE", mobile: "PRIVATE" });
  assert.match(text, /PASSENGER STATUS \(1\)/);
  assert.match(text, /CNF\/B1\/7\/GN/);
  assert.match(text, /\| Confirmed/);
  assert.match(text, /Total Fare: ₹1,250/);
  assert.match(text, /Chart: Chart prepared\./);
  assert.doesNotMatch(text, /Transaction ID:|Remarks:|PRIVATE/);
});

test("all six passengers share existing RAC, waitlist and prediction labels", () => {
  const passengers = Array.from({ length: 6 }, (_, i) => ({ bookingStatus: "GNWL / 20", currentStatus: i === 0 ? "RAC / S1 / 10" : "GNWL / 5" }));
  const text = message({ passengers, chartPrepared: false, transactionId: "example-id" }, { data: { prediction: { chancePercent: 75 } } });
  assert.match(text, /PASSENGER STATUS \(6\)/);
  assert.match(text, /6\. GNWL\/20 → GNWL\/5/);
  assert.equal((text.match(/\| 75%/g) ?? []).length, 5);
  assert.match(text, /RAC – Travel Allowed/);
  assert.match(text, /Transaction ID: example-id/);
  assert.match(text, /Chart not prepared yet/);
  assert.doesNotMatch(message({ passengers, chartPrepared: false }), /\d+%/);
});

test("edited text is copied exactly and fully encoded for WhatsApp; failures are announced", async () => {
  const h = harness();
  const props = { createMessage: () => "Initial message" };
  let tree = h.render("SharePnrDetails", props);
  find(tree, (n) => n.type === "button").props.onClick();
  tree = h.render("SharePnrDetails", props);
  assert.equal(find(tree, (n) => n.type === "textarea").props.value, "Initial message");
  const edited = "Edited & complete\n₹1250 + 75% 🚆";
  find(tree, (n) => n.type === "textarea").props.onChange({ target: { value: edited } });
  tree = h.render("SharePnrDetails", props);
  const link = find(tree, (n) => n.type === "a");
  assert.equal(new URL(link.props.href).searchParams.get("text"), edited);
  assert.equal(link.props.target, "_blank");
  await find(tree, (n) => n.props?.children === "Copy Message").props.onClick();
  assert.equal(h.sandbox.copied, edited);
  tree = h.render("SharePnrDetails", props);
  assert.equal(find(tree, (n) => n.props?.role === "status").props.children, "Message copied.");
  h.sandbox.navigator.clipboard.writeText = async () => { throw new Error("denied"); };
  await find(tree, (n) => n.props?.children === "Copy Message").props.onClick();
  tree = h.render("SharePnrDetails", props);
  assert.match(find(tree, (n) => n.props?.role === "status").props.children, /Could not copy/);
  const dialog = find(tree, (n) => n.type === "dialog");
  assert.equal(dialog.props["aria-labelledby"], "pnr-share-title");
});

test("compact spacing preserves cancelled and waiting passenger records and optional details", () => {
  const text = message({
    trainNumber: "12345", trainName: "EXAMPLE EXPRESS", journeyClass: "3A",
    passengers: [
      { bookingStatus: "CNF / B1 / 7", currentStatus: "CAN" },
      { bookingStatus: "GNWL / 20", currentStatus: "GNWL / 5" },
    ],
    chartPrepared: true, remarks: "Example remark", trainStatus: "Scheduled",
  });
  assert.match(text, /1\. CNF\/B1\/7 → CAN \| Cancelled/);
  assert.match(text, /2\. GNWL\/20 → GNWL\/5 \| Prediction Unavailable/);
  assert.match(text, /Class: 3A/);
  assert.match(text, /Remarks: Example remark/);
  assert.match(text, /Train Status: Scheduled/);
  assert.equal((text.match(/\n\n/g) ?? []).length, 3);
});
