import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { NextResponse } from "next/server.js";

function load(relative, mocks = {}) {
  const sandbox = {
    exports: {}, URL, Date, Error,
    console: { error() {} },
    require(name) {
      if (name === "server-only") return {};
      if (!(name in mocks)) throw new Error(`Unexpected dependency: ${name}`);
      return mocks[name];
    },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
  }).outputText, sandbox);
  return sandbox.exports;
}

const schema = load("../src/models/global-variable.schema.ts");
const sameOrigin = load("../src/lib/same-origin.ts");
const registry = load("../src/lib/global-variable-registry.ts", { "@/models/global-variable.schema": schema });
const { GlobalVariableKey: Key } = schema;
const dbFailure = new Error("Private database error mongodb://user:password@database/global_variables");

function harness(records = []) {
  const state = { authorized: true, authFailure: false, failRead: false, failWrite: false, failIndex: false, records: [...records], indexes: 0, reads: 0, writes: 0 };
  const collection = {
    async createIndex() {
      state.indexes++;
      if (state.failIndex) throw dbFailure;
    },
    find(filter = {}) {
      state.reads++;
      const cursor = { sort: () => cursor, async toArray() {
        if (state.failRead) throw dbFailure;
        return state.records.filter((record) => !filter.key || filter.key.$in.includes(record.key));
      } }; return cursor;
    },
    async updateOne(filter, update) {
      if (state.failWrite) throw dbFailure;
      const record = state.records.find((item) => item.key === filter.key);
      if (record) Object.assign(record, update.$set);
    },
    async findOneAndUpdate(filter, update, options) {
      state.writes++;
      if (state.failWrite) throw dbFailure;
      assert.equal(options.upsert, true);
      assert.equal(options.returnDocument, "after");
      let record = state.records.find((record) => record.key === filter.key);
      if (!record) {
        record = { _id: "test-id", key: filter.key, ...update.$setOnInsert };
        state.records.push(record);
      }
      Object.assign(record, update.$set);
      return record;
    },
  };
  const helpers = load("../src/lib/global-variables.ts", {
    "@/models/global-variable.schema": schema,
    "@/lib/global-variable-registry": registry,
    "next/cache": { revalidateTag() {} },
    "@/lib/mongodb": Promise.resolve({ startSession: () => ({ withTransaction: async (callback) => { const snapshot = structuredClone(state.records); try { return await callback(); } catch (error) { state.records = snapshot; throw error; } }, endSession: async () => {} }), db(name) {
      assert.equal(name, "railagents");
      return { command: async () => ({ setName: "test", logicalSessionTimeoutMinutes: 30, maxWireVersion: 28 }), collection(name) { assert.equal(name, "global_variables"); return collection; } };
    } }),
  });
  const api = load("../src/app/api/admin/global-variables/route.ts", {
    "@/lib/same-origin": sameOrigin,
    "next/server": { NextResponse },
    "@/lib/session": { async getAdminSession() {
      if (state.authFailure) throw new Error("Private authentication error");
      return state.authorized ? { email: "test@example.test" } : null;
    } },
    "@/lib/global-variable-registry": registry,
    "@/lib/global-variables": helpers,
    "@/models/global-variable.schema": schema,
  });
  const request = (body, origin = "https://example.test", raw = false) => new Request("https://example.test/api/admin/global-variables", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(origin === null ? {} : { origin }) },
    body: raw ? body : JSON.stringify(body),
  });
  const put = (body, origin, raw) => api.PUT(request(body, origin, raw));
  return { api, state, put };
}

const payload = (update = {}) => ({ key: Key.WHATSAPP_MESSAGE, value: "Test message", desc: "Test description", status: true, ...update });
function assertNoStore(response) {
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
}
function assertNoDatabaseWork(state) {
  assert.equal(state.indexes, 0);
  assert.equal(state.reads, 0);
  assert.equal(state.writes, 0);
}

test("GET/PUT reject unauthenticated requests before database access", async () => {
  const { api, state, put } = harness();
  state.authorized = false;
  for (const response of [await api.GET(), await put(payload()), await put("{", null, true)]) {
    assert.equal(response.status, 401);
    assertNoStore(response);
    assert.equal((await response.json()).error, "Unauthorized");
  }
  assertNoDatabaseWork(state);
});

test("GET returns every predefined key as unconfigured without inserting records", async () => {
  const { api, state } = harness();
  const response = await api.GET();
  assert.equal(response.status, 200);
  assertNoStore(response);
  const data = await response.json();
  assert.equal(data.success, true);
  assert.deepEqual(data.variables.map((item) => item.key).sort(), Object.values(Key).sort());
  for (const item of data.variables) {
    const definition = registry.globalVariableRegistry[item.key];
    assert.equal(item.label, definition.label);
    assert.equal(item.description, definition.description);
    assert.equal(item.inputType, definition.inputType);
    assert.equal(item.validation.allowEmpty, true);
    assert.equal(item.validation.maxLength, definition.validation.maxLength);
    assert.equal(item.validation.message, definition.validation.message ?? null);
    assert.equal("isValid" in item.validation, false);
    assert.equal(item.value, null);
    assert.equal(item.status, null);
    assert.equal(item.configured, false);
    assert.equal(item.createdAt, null);
    assert.equal(item.updatedAt, null);
  }
  assert.equal(state.reads, 1);
  assert.equal(state.writes, 0);
  assert.equal(state.records.length, 0);
});

test("GET merges existing active/inactive values without masking empty strings or leaking fields", async () => {
  const records = [
    { key: Key.CONTACT_EMAIL, value: "test@example.test", desc: "Custom description", status: true, createdAt: new Date(0), updatedAt: new Date(1), secret: "private", _id: "private-id" },
    { key: Key.WHATSAPP_MESSAGE, value: "", desc: "", status: false, createdAt: new Date(0), updatedAt: new Date(1) },
    { key: "UNREGISTERED", value: "must not be returned" },
  ];
  const { api, state } = harness(records);
  const data = await (await api.GET()).json();
  const email = data.variables.find((item) => item.key === Key.CONTACT_EMAIL);
  assert.equal(email.value, "test@example.test");
  assert.equal(email.desc, "Custom description");
  assert.equal(email.configured, true);
  assert.equal(email.status, true);
  assert.equal(email.createdAt, new Date(0).toISOString());
  const inactive = data.variables.find((item) => item.key === Key.WHATSAPP_MESSAGE);
  assert.equal(inactive.value, "");
  assert.equal(inactive.desc, "");
  assert.equal(inactive.status, false);
  assert.equal(inactive.configured, true);
  assert.equal(data.variables.length, Object.values(Key).length);
  assert.doesNotMatch(JSON.stringify(data), /private|UNREGISTERED/);
  assert.equal(state.writes, 0);
});

test("PUT rejects missing, malformed, cross-host, cross-port and cross-scheme origins", async () => {
  const { state, put } = harness();
  for (const origin of [null, "null", "invalid-url", "https://other.test", "http://example.test", "https://example.test:444"]) {
    const response = await put(payload(), origin);
    assert.equal(response.status, 403);
    assertNoStore(response);
  }
  assertNoDatabaseWork(state);
});

test("PUT rejects malformed JSON, non-object payloads and missing fields", async () => {
  const { state, put } = harness();
  const malformed = await put("{", undefined, true);
  assert.equal(malformed.status, 400);
  assertNoStore(malformed);
  for (const body of [null, [], 1, "text", true, {}]) {
    assert.equal((await put(body)).status, 400);
  }
  for (const field of ["key", "value", "desc", "status"]) {
    const body = payload();
    delete body[field];
    assert.equal((await put(body)).status, 400);
  }
  assertNoDatabaseWork(state);
});

test("PUT rejects unknown/prototype keys, injection objects and invalid value types", async () => {
  const { state, put } = harness();
  for (const key of ["UNKNOWN", "constructor", "__proto__", "whatsapp_number", null, { $ne: null }]) {
    assert.equal((await put(payload({ key }))).status, 400);
  }
  for (const update of [{ value: null }, { value: 123 }, { value: { $set: "injection" } }, { desc: null }, { desc: {} }, { status: "false" }, { status: 0 }]) {
    assert.equal((await put(payload(update))).status, 400);
  }
  assertNoDatabaseWork(state);
});

test("PUT applies registry validation to all predefined keys", async () => {
  const { state, put } = harness();
  for (const [key, value] of [
    [Key.WHATSAPP_NUMBER, "+12345678"], [Key.WHATSAPP_NUMBER, "012345678"],
    [Key.WHATSAPP_MESSAGE, "x".repeat(1001)], [Key.CONTACT_PHONE, "invalid"],
    [Key.CONTACT_EMAIL, "not-an-email"], [Key.OFFICE_ADDRESS, "x".repeat(2001)],
    [Key.INSTAGRAM_URL, "https://other.test"], [Key.INSTAGRAM_URL, "javascript:alert(1)"],
    [Key.YOUTUBE_URL, "https://youtube.com.evil.test/channel"], [Key.FACEBOOK_URL, "http://facebook.com/page"],
  ]) {
    const response = await put(payload({ key, value }));
    assert.equal(response.status, 400);
    assertNoStore(response);
    assert.ok((await response.json()).error);
  }
  assert.equal((await put(payload({ desc: "x".repeat(1001) }))).status, 400);
  assertNoDatabaseWork(state);
});

test("PUT rejects arbitrary database fields and timestamp overrides", async () => {
  const { state, put } = harness();
  for (const field of ["_id", "createdAt", "updatedAt", "$set", "collection"]) {
    assert.equal((await put(payload({ [field]: "untrusted" }))).status, 400);
  }
  assertNoDatabaseWork(state);
});

test("PUT uses the real helper to preserve createdAt, update updatedAt and retain inactive records", async () => {
  const { state, api, put } = harness([{ key: Key.WHATSAPP_MESSAGE, value: "Old", desc: "Old", status: true, createdAt: new Date(0), updatedAt: new Date(0) }]);
  const response = await put(payload({ value: "  Changed\nनमस्ते  ", status: false }));
  assert.equal(response.status, 200);
  assertNoStore(response);
  const data = await response.json();
  assert.equal(data.success, true);
  assert.equal(data.variable.value, "  Changed\nनमस्ते  ");
  assert.equal(data.variable.desc, "Test description");
  assert.equal(data.variable.status, false);
  assert.equal(data.variable.configured, true);
  assert.equal(data.variable.createdAt, new Date(0).toISOString());
  assert.ok(new Date(data.variable.updatedAt).getTime() > 0);
  assert.equal(state.records.length, 1);
  const readBack = await (await api.GET()).json();
  assert.equal(readBack.variables.find((item) => item.key === Key.WHATSAPP_MESSAGE).status, false);
});

test("PUT accepts empty strings and creates only the requested key", async () => {
  const { api, state, put } = harness();
  const response = await put(payload({ key: Key.CONTACT_EMAIL, value: "", desc: "", status: false }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.variable.createdAt, data.variable.updatedAt);
  assert.equal(data.variable.value, "");
  assert.equal(data.variable.desc, "");
  assert.equal(state.records.length, 1);
  assert.equal(state.records[0].key, Key.CONTACT_EMAIL);
  const readBack = await (await api.GET()).json();
  assert.equal(readBack.variables.filter((item) => item.configured).length, 1);
});

test("database/index failures return safe no-store errors without exposing diagnostics", async () => {
  for (const flag of ["failRead", "failWrite", "failIndex"]) {
    const { api, state, put } = harness();
    state[flag] = true;
    const response = flag === "failRead" ? await api.GET() : await put(payload());
    assert.equal(response.status, 500);
    assertNoStore(response);
    const data = await response.json();
    assert.doesNotMatch(JSON.stringify(data), /mongodb|password|Private|database/);
    assert.equal(state.records.length, 0);
    if (flag === "failIndex") assert.equal(state.writes, 0);
  }
});

test("session infrastructure failures are handled safely without database access", async () => {
  const { api, state, put } = harness();
  state.authFailure = true;
  for (const response of [await api.GET(), await put(payload())]) {
    assert.equal(response.status, 500);
    assertNoStore(response);
    assert.doesNotMatch(JSON.stringify(await response.json()), /Private/);
  }
  assertNoDatabaseWork(state);
});
