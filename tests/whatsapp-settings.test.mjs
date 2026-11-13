import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(relative, mocks) {
  const source = readFileSync(new URL(relative, import.meta.url), "utf8");
  const sandbox = {
    exports: {}, URL, Date,
    console: { error() {} },
    require(name) {
      if (!(name in mocks)) throw new Error(`Unexpected dependency: ${name}`);
      return mocks[name];
    },
  };
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, sandbox);
  return sandbox.exports;
}

function harness() {
  const sameOrigin = load("../src/lib/same-origin.ts", { "server-only": {} });
  const state = {
    authorized: true,
    settings: { number: "12345678", message: "Test message", enabled: true },
    events: [], failWrite: false, failRead: false,
  };
  const api = load("../src/app/api/admin/whatsapp/route.ts", {
    "@/lib/same-origin": sameOrigin,
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200, headers: options?.headers }) } },
    "next/cache": { revalidateTag: (...args) => state.events.push(["invalidate", ...args]) },
    "@/lib/session": { getAdminSession: async () => state.authorized ? { email: "test" } : null },
    "@/lib/whatsapp-settings": { getWhatsAppSettingsForAdmin: async () => {
      if (state.failRead) throw new Error("Read failed");
      return state.settings;
    } },
    "@/lib/global-variables": { saveWhatsAppSettings: async (settings) => {
      if (state.failWrite) throw new Error("Write failed");
      state.settings = settings; state.events.push(["write"]);
      state.events.push(["invalidate", "whatsapp-settings", { expire: 0 }]);
    } },
  });
  const put = (body = state.settings, origin = "https://example.test", raw = false) => api.PUT(new Request("https://example.test/api/admin/whatsapp", {
    method: "PUT", headers: origin === null ? {} : { origin },
    body: raw ? body : JSON.stringify(body),
  }));
  return { api, state, put };
}

test("WhatsApp GET and PUT require an admin before reading or writing", async () => {
  const { api, state, put } = harness();
  state.authorized = false;
  assert.equal((await api.GET()).status, 401);
  assert.equal((await put()).status, 401);
  assert.equal(state.events.length, 0);
});

test("WhatsApp GET returns current settings with no-store headers", async () => {
  const { api, state } = harness();
  const response = await api.GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers["Cache-Control"], "no-store");
  assert.equal(response.body.whatsapp, state.settings);
});

test("WhatsApp PUT rejects missing, malformed, cross-host and cross-scheme origins", async () => {
  const { state, put } = harness();
  for (const origin of [null, "null", "bad URL", "https://other.test", "http://example.test", "https://example.test:444"]) {
    assert.equal((await put(state.settings, origin)).status, 403);
  }
  assert.equal(state.events.length, 0);
});

test("WhatsApp PUT rejects malformed JSON and non-object bodies without writes", async () => {
  const { state, put } = harness();
  assert.equal((await put("{", undefined, true)).status, 400);
  for (const body of [null, [], "text", 1, true]) assert.equal((await put(body)).status, 400);
  assert.equal(state.events.length, 0);
});

test("WhatsApp PUT validates number, message length and enabled type", async () => {
  const { state, put } = harness();
  for (const number of ["", "012345678", "+12345678", "1234567", "1".repeat(16), "1234 5678", 12345678]) {
    assert.equal((await put({ ...state.settings, number })).status, 400);
  }
  for (const update of [{ message: "x".repeat(1001) }, { message: null }, { enabled: "true" }, { enabled: null }]) {
    assert.equal((await put({ ...state.settings, ...update })).status, 400);
  }
  assert.equal(state.events.length, 0);
});

test("WhatsApp saves only settings fields and invalidates the cache after persistence", async () => {
  const { state, put } = harness();
  const response = await put({ ...state.settings, enabled: false, message: "", unrelated: "ignore" });
  assert.equal(response.status, 200);
  assert.equal(state.settings.enabled, false);
  assert.equal(state.settings.message, "");
  assert.equal("unrelated" in state.settings, false);
  assert.equal(JSON.stringify(state.events), JSON.stringify([["write"], ["invalidate", "whatsapp-settings", { expire: 0 }]]));
  const reader = readFileSync(new URL("../src/lib/whatsapp-settings.ts", import.meta.url), "utf8");
  assert.match(reader, /tags: \[WHATSAPP_SETTINGS_CACHE_TAG\]/);
});

test("WhatsApp database failures return errors without invalidating unsaved data", async () => {
  const { state, api, put } = harness();
  state.failWrite = true;
  assert.equal((await put()).status, 500);
  assert.equal(state.events.length, 0);
  state.failRead = true;
  assert.equal((await api.GET()).status, 500);
});

test("WhatsApp links use supplied settings, preserve encoding and respect disabled state", () => {
  const utility = load("../src/lib/whatsapp.ts", {});
  const text = "Question & details?\nनमस्ते 🚂";
  assert.equal(new URL(utility.getWhatsAppUrl(text, "test-recipient")).searchParams.get("text"), text);
  assert.equal(new URL(utility.getWhatsAppUrl(text)).pathname, "/");
  const settings = { number: "test-recipient", message: text, enabled: true };
  const provider = load("../src/components/WhatsAppSettingsProvider.tsx", {
    react: { createContext: () => ({}), useContext: () => settings },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }) },
    "@/lib/whatsapp": utility,
  });
  const link = provider.WhatsAppLink({ children: "Chat", className: "existing", contextMessage: "Guide title" });
  assert.equal(link.props.className, "existing");
  assert.equal(new URL(link.props.href).searchParams.get("text"), `${text}\n\nGuide title`);
  settings.enabled = false;
  assert.equal(provider.WhatsAppLink({ children: "Chat" }), null);
});
