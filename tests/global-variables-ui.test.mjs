import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const variable = { key: "REGISTRY_PROVIDED_KEY", label: "Registry label", description: "Registry description", inputType: "email", validation: { allowEmpty: true, maxLength: 254, message: null }, value: null, desc: "Description", status: null, configured: false };
function harness() {
  const states = [];
  const refs = [];
  let stateIndex = 0;
  let refIndex = 0;
  const effects = [];
  const calls = [];
  const redirects = [];
  const saved = [];
  const events = new Map();
  const state = { response: { success: true, variables: [variable] }, status: 200, confirmed: false, closed: 0 };
  const jsx = (type, props) => ({ type, props });
  const sandbox = {
    exports: {}, AbortController,
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { status: state.status, ok: state.status < 400, json: async () => state.response };
    },
    window: { confirm: () => state.confirmed, addEventListener: (name, callback) => events.set(name, callback), removeEventListener: (name) => events.delete(name) },
    document: { body: { style: { overflow: "" } } },
    require(name) {
      if (name === "react") return {
        useState(initial) {
          const i = stateIndex++;
          if (!(i in states)) states[i] = initial;
          return [states[i], (value) => { states[i] = typeof value === "function" ? value(states[i]) : value; }];
        },
        useRef() {
          const i = refIndex++;
          if (!(i in refs)) refs[i] = { current: { showModal() {}, close() {}, focus() {}, validity: { valid: true }, querySelector: () => null } };
          return refs[i];
        },
        useEffect(callback) { effects.push(callback); },
      };
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (name === "next/navigation") return { useRouter: () => ({ replace: (url) => redirects.push(url) }) };
      if (name === "lucide-react") return new Proxy({}, { get: (_, key) => key });
      throw new Error(`Unexpected client dependency: ${name}`);
    },
  };
  const source = readFileSync(new URL("../src/components/admin/GlobalVariablesManager.tsx", import.meta.url), "utf8");
  vm.runInNewContext(ts.transpileModule(source + "\nexport { VariableEditor };", {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2017 },
  }).outputText, sandbox);
  const props = { variable, returnFocus: null, onClose: () => state.closed++, onSaved: (item) => saved.push(item), onUnauthorized: () => redirects.push("unauthorized") };
  return { state, calls, redirects, saved, effects, events, props,
    render(name = "GlobalVariablesManager", overrides = {}) {
      stateIndex = 0; refIndex = 0; effects.length = 0;
      return sandbox.exports[name]({ ...props, ...overrides });
    },
  };
}
function find(node, predicate) {
  if (!node || typeof node !== "object") return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const match = find(child, predicate);
    if (match) return match;
  }
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

test("manager loads API metadata without writes and renders backend-defined edit actions", async () => {
  const h = harness();
  assert.ok(find(h.render(), (node) => node.props?.["aria-label"] === "Loading global variables"));
  h.effects[0](); await flush();
  const tree = h.render();
  assert.ok(find(tree, (node) => node.props?.["aria-label"] === "Edit Registry label"));
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].url, "/api/admin/global-variables");
  assert.equal(h.calls[0].options.cache, "no-store");
  assert.equal(h.calls[0].options.method, undefined);
});

test("manager handles unauthorized, empty and failed GET responses", async () => {
  const unauthorized = harness(); unauthorized.state.status = 401;
  unauthorized.render(); unauthorized.effects[0](); await flush();
  assert.deepEqual(unauthorized.redirects, ["/admin/login"]);
  const empty = harness(); empty.state.response = { success: true, variables: [] };
  empty.render(); empty.effects[0](); await flush();
  assert.ok(find(empty.render(), (node) => node.props?.children === "No global variables available"));
  const failed = harness(); failed.state.status = 500; failed.state.response = { error: "Read failed" };
  failed.render(); failed.effects[0](); await flush();
  assert.ok(find(failed.render(), (node) => node.props?.role === "alert"));
  assert.ok(find(failed.render(), (node) => node.type === "button"));
});

test("editor uses metadata input types and never saves by opening or canceling", () => {
  for (const inputType of ["text", "tel", "phone", "email", "url", "textarea", "boolean"]) {
    const h = harness();
    const tree = h.render("VariableEditor", { variable: { ...variable, inputType } });
    const control = find(tree, (node) => node.props?.id === "variable-value");
    assert.equal(control.type, inputType === "textarea" ? "textarea" : "input");
    if (inputType !== "textarea") assert.equal(control.props.type, inputType === "phone" ? "tel" : inputType === "boolean" ? "checkbox" : inputType);
    assert.equal(find(tree, (node) => node.props?.id === "variable-key").props.readOnly, true);
    find(tree, (node) => node.props?.children === "Cancel").props.onClick();
    assert.equal(h.state.closed, 1);
    assert.equal(h.calls.length, 0);
  }
});

test("registry-controlled visibility is disabled in the editor without hardcoded variable keys", () => {
  const h = harness();
  const tree = h.render("VariableEditor", { variable: { ...variable, statusControlledBy: "CANONICAL_REGISTRY_KEY" } });
  const control = find(tree, (node) => node.type === "input" && node.props?.role === "switch");
  assert.equal(control.props.disabled, true);
  assert.ok(find(tree, (node) => node.props?.children === "Visibility follows CANONICAL_REGISTRY_KEY."));
});

test("saving refreshes related rows returned by the API", async () => {
  const h = harness();
  h.state.response.variables = [variable, { ...variable, key: "SECOND_KEY", label: "Second", configured: true, status: true }];
  h.render(); h.effects[0](); await flush();
  find(h.render(), (node) => node.props?.["aria-label"] === "Edit Registry label").props.onClick({ currentTarget: {} });
  const editor = find(h.render(), (node) => typeof node.type === "function" && node.type.name === "VariableEditor");
  editor.props.onSaved({ ...variable, configured: true }, [{ ...variable, configured: true }, { ...variable, key: "SECOND_KEY", label: "Second", configured: true, status: false }]);
  const status = find(h.render(), (node) => typeof node.type === "function" && node.type.name === "Status" && node.props.variable.key === "SECOND_KEY");
  assert.equal(status.props.variable.status, false);
});

test("dirty cancel and Escape require confirmation, and reload protection is installed", () => {
  const h = harness();
  let tree = h.render("VariableEditor");
  find(tree, (node) => node.props?.id === "variable-value").props.onChange({ target: { value: "changed@example.test" } });
  tree = h.render("VariableEditor");
  h.effects[1]();
  assert.ok(h.events.has("beforeunload"));
  find(tree, (node) => node.props?.children === "Cancel").props.onClick();
  assert.equal(h.state.closed, 0);
  find(tree, (node) => node.type === "dialog").props.onCancel({ preventDefault() {} });
  assert.equal(h.state.closed, 0);
  h.state.confirmed = true;
  find(tree, (node) => node.props?.children === "Cancel").props.onClick();
  assert.equal(h.state.closed, 1);
  assert.equal(h.calls.length, 0);
});

test("editor rejects oversized input inline before making PUT requests", async () => {
  const h = harness();
  let tree = h.render("VariableEditor");
  find(tree, (node) => node.props?.id === "variable-value").props.onChange({ target: { value: "x".repeat(255) } });
  tree = h.render("VariableEditor");
  await find(tree, (node) => node.type === "form").props.onSubmit({ preventDefault() {} });
  assert.equal(find(h.render("VariableEditor"), (node) => node.props?.id === "variable-value-error").props.children, "Use 254 characters or fewer.");
  assert.equal(h.calls.length, 0);
});

test("editor sends only editable fields and returns authoritative saved data", async () => {
  const h = harness();
  h.state.response = { success: true, variable: { ...variable, configured: true, value: "", status: false } };
  const tree = h.render("VariableEditor");
  await find(tree, (node) => node.type === "form").props.onSubmit({ preventDefault() {} });
  assert.equal(h.calls[0].options.method, "PUT");
  assert.deepEqual(JSON.parse(h.calls[0].options.body), { key: variable.key, value: "", desc: "Description", status: false });
  assert.equal(h.saved.length, 1);
  assert.equal(h.saved[0].configured, true);
});

test("editor retains changes on validation/server failures and redirects on expired authorization", async () => {
  for (const status of [400, 500, 401]) {
    const h = harness(); h.state.status = status; h.state.response = { error: "Save failed" };
    let tree = h.render("VariableEditor");
    find(tree, (node) => node.props?.id === "variable-value").props.onChange({ target: { value: "changed@example.test" } });
    tree = h.render("VariableEditor");
    await find(tree, (node) => node.type === "form").props.onSubmit({ preventDefault() {} });
    tree = h.render("VariableEditor");
    assert.equal(find(tree, (node) => node.props?.id === "variable-value").props.value, "changed@example.test");
    if (status === 401) assert.deepEqual(h.redirects, ["unauthorized"]);
    else assert.ok(find(tree, (node) => node.props?.children === "Save failed"));
    assert.equal(h.saved.length, 0);
  }
});
