import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(relative, mocks = {}) {
  const sandbox = {
    exports: {}, URL, Date,
    require(name) {
      if (name === "server-only") return {};
      if (!(name in mocks)) throw new Error(`Unexpected import: ${name}`);
      return mocks[name];
    },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
  }).outputText, sandbox);
  return sandbox.exports;
}

const schema = load("../src/models/global-variable.schema.ts");
const registry = load("../src/lib/global-variable-registry.ts", { "@/models/global-variable.schema": schema });
const { GlobalVariableKey: Key } = schema;

function harness(initial = []) {
  const state = { records: [...initial], indexes: 0, queries: [], writes: [], failIndex: false, tags: [] };
  function match(record, filter) {
    return (filter.status === undefined || record.status === filter.status) &&
      (filter.key === undefined || (typeof filter.key === "string" ? record.key === filter.key : filter.key.$in.includes(record.key)));
  }
  const collection = {
    async createIndex(keys, options) {
      state.indexes++;
      assert.equal(JSON.stringify(keys), '{"key":1}');
      assert.equal(options.unique, true);
      if (state.failIndex) throw new Error("Index conflict");
      if (new Set(state.records.map((record) => record.key)).size !== state.records.length) throw new Error("Duplicate keys");
    },
    async findOne(filter) {
      state.queries.push(filter);
      return state.records.find((record) => match(record, filter)) ?? null;
    },
    find(filter, options) {
      state.queries.push({ filter, options });
      let records = state.records.filter((record) => match(record, filter));
      const cursor = {
        sort(order) {
          assert.equal(order.key, 1);
          records = [...records].sort((a, b) => a.key.localeCompare(b.key));
          return cursor;
        },
        async toArray() { return records; },
      };
      return cursor;
    },
    async updateOne(filter, update) {
      const record = state.records.find((item) => item.key === filter.key);
      if (record) Object.assign(record, update.$set);
    },
    async findOneAndUpdate(filter, update, options) {
      state.writes.push({ filter, update, options });
      assert.equal(options.upsert, true);
      assert.equal(options.returnDocument, "after");
      assert.equal(options.includeResultMetadata, false);
      let record = state.records.find((record) => record.key === filter.key);
      if (!record) {
        record = { _id: `test-${state.records.length}`, key: filter.key, ...update.$setOnInsert };
        state.records.push(record);
      }
      Object.assign(record, update.$set);
      return { ...record };
    },
  };
  const helpers = load("../src/lib/global-variables.ts", {
    "@/models/global-variable.schema": schema,
    "@/lib/global-variable-registry": registry,
    "next/cache": { revalidateTag(tag, options) { state.tags.push({ tag, options }); } },
    "@/lib/mongodb": Promise.resolve({ startSession: () => ({ withTransaction: async (callback) => { const snapshot = structuredClone(state.records); try { return await callback(); } catch (error) { state.records = snapshot; throw error; } }, endSession: async () => {} }), db(name) {
      assert.equal(name, "railagents");
      return { command: async () => ({ setName: "test", logicalSessionTimeoutMinutes: 30, maxWireVersion: 28 }), collection(name) { assert.equal(name, "global_variables"); return collection; } };
    } }),
  });
  return { state, ...helpers };
}

const record = (key, value, status = true) => ({ key, value, status, desc: "Description", createdAt: new Date(0), updatedAt: new Date(0) });

test("registry covers exactly eight predefined keys and allows empty strings", async () => {
  assert.equal(Object.values(Key).length, 8);
  assert.deepEqual(Object.keys(registry.globalVariableRegistry).sort(), Object.values(Key).sort());
  const h = harness();
  for (const key of Object.values(Key)) {
    const definition = registry.globalVariableRegistry[key];
    assert.ok(definition.label && definition.description && definition.inputType);
    assert.equal(definition.validation.allowEmpty, true);
    await h.upsertGlobalVariable(key, "", "", true);
    assert.equal(await h.getGlobalVariable(key), "");
  }
});

test("missing and inactive values return null without inserting default records", async () => {
  const h = harness([record(Key.CONTACT_EMAIL, "test@example.test", false)]);
  assert.equal(await h.getGlobalVariable(Key.WHATSAPP_NUMBER), null);
  assert.equal(await h.getGlobalVariable(Key.CONTACT_EMAIL), null);
  assert.equal(h.state.records.length, 1);
  assert.equal(h.state.writes.length, 0);
  const empty = harness();
  assert.equal((await empty.getGlobalVariableRecords()).length, 0);
  assert.equal(empty.state.records.length, 0);
});

test("batch fetch uses one query, deduplicates keys and includes null for missing/inactive values", async () => {
  const h = harness([record(Key.CONTACT_EMAIL, "test@example.test"), record(Key.WHATSAPP_NUMBER, "12345678", false)]);
  const values = await h.getGlobalVariables([Key.CONTACT_EMAIL, Key.WHATSAPP_NUMBER, Key.OFFICE_ADDRESS, Key.CONTACT_EMAIL]);
  assert.equal(values.CONTACT_EMAIL, "test@example.test");
  assert.equal(values.WHATSAPP_NUMBER, null);
  assert.equal(values.OFFICE_ADDRESS, null);
  assert.equal(h.state.queries.length, 1);
  assert.equal(h.state.queries[0].filter.key.$in.length, 3);
  assert.equal(h.state.queries[0].filter.status, undefined);
  const empty = harness();
  assert.equal(Object.keys(await empty.getGlobalVariables([])).length, 0);
  assert.equal(empty.state.indexes, 0);
  assert.equal(empty.state.queries.length, 0);
});

test("unknown and prototype keys are rejected before database work by all keyed helpers", async () => {
  const h = harness();
  for (const key of ["UNKNOWN", "constructor", "__proto__", "toString", "whatsapp_number", null, 1]) {
    await assert.rejects(h.getGlobalVariable(key), /Unknown global variable key/);
    await assert.rejects(h.getGlobalVariables([Key.CONTACT_PHONE, key]), /Unknown global variable key/);
    await assert.rejects(h.upsertGlobalVariable(key, "", "", true), /Unknown global variable key/);
  }
  assert.equal(h.state.indexes, 0);
  assert.equal(h.state.writes.length, 0);
});

test("validation rejects invalid types and per-key formats before persistence", async () => {
  const h = harness();
  const invalid = [
    [Key.WHATSAPP_NUMBER, "+12345678"], [Key.WHATSAPP_NUMBER, "012345678"],
    [Key.WHATSAPP_NUMBER, "123 45678"], [Key.CONTACT_PHONE, "phone"],
    [Key.CONTACT_EMAIL, "bad-email"], [Key.CONTACT_EMAIL, "x@y.test\n"],
    [Key.INSTAGRAM_URL, "javascript:alert(1)"], [Key.INSTAGRAM_URL, "https://instagram.com.evil.test/profile"],
    [Key.INSTAGRAM_URL, "http://instagram.com/profile"], [Key.INSTAGRAM_URL, "https://user:pass@instagram.com/profile"],
    [Key.WHATSAPP_MESSAGE, "x".repeat(1001)], [Key.OFFICE_ADDRESS, "x".repeat(2001)],
    [Key.WHATSAPP_MESSAGE, null], [Key.CONTACT_PHONE, 12345678],
  ];
  for (const [key, value] of invalid) await assert.rejects(h.upsertGlobalVariable(key, value, "", true));
  await assert.rejects(h.upsertGlobalVariable(Key.WHATSAPP_MESSAGE, "text", null, true));
  await assert.rejects(h.upsertGlobalVariable(Key.WHATSAPP_MESSAGE, "text", "x".repeat(1001), true));
  await assert.rejects(h.upsertGlobalVariable(Key.WHATSAPP_MESSAGE, "text", "", "false"));
  assert.equal(h.state.indexes, 0);
  assert.equal(h.state.writes.length, 0);
});

test("upsert retains createdAt, updates one existing record, and preserves inactive values", async () => {
  const h = harness([record(Key.OFFICE_ADDRESS, "Original")]);
  const saved = await h.upsertGlobalVariable(Key.OFFICE_ADDRESS, "  Saved\nनमस्ते  ", "Updated description", false);
  assert.equal(saved.createdAt.getTime(), 0);
  assert.ok(saved.updatedAt.getTime() > 0);
  assert.equal(saved.value, "  Saved\nनमस्ते  ");
  assert.equal(saved.desc, "Updated description");
  assert.equal(saved.status, false);
  assert.equal(h.state.records.length, 1);
  assert.equal(await h.getGlobalVariable(Key.OFFICE_ADDRESS), null);
  const records = await h.getGlobalVariableRecords();
  assert.equal(records[0].value, saved.value);
  assert.equal(records[0].status, false);
  await h.upsertGlobalVariable(Key.OFFICE_ADDRESS, "Reactivated", "", true);
  assert.equal(await h.getGlobalVariable(Key.OFFICE_ADDRESS), "Reactivated");
  assert.equal(h.state.records.length, 1);
});

test("valid contact formats save, new timestamps match, and management reads sort existing records", async () => {
  const h = harness();
  for (const [key, value] of [
    [Key.WHATSAPP_NUMBER, "12345678"], [Key.CONTACT_PHONE, "+12345678"],
    [Key.CONTACT_EMAIL, "test@example.test"], [Key.INSTAGRAM_URL, "https://www.instagram.com/test/"],
  ]) {
    const saved = await h.upsertGlobalVariable(key, value, "", true);
    assert.equal(saved.createdAt.getTime(), saved.updatedAt.getTime());
    assert.equal(await h.getGlobalVariable(key), value);
  }
  const records = await h.getGlobalVariableRecords();
  const keys = records.map((item) => item.key);
  assert.deepEqual(keys, [...keys].sort());
  assert.equal(records.length, 4);
});

test("reads are side-effect free and concurrent writes share one unique-index initialization", async () => {
  const h = harness();
  assert.equal(h.state.indexes, 0);
  await Promise.all([h.getGlobalVariable(Key.CONTACT_EMAIL), h.getGlobalVariableRecords(), h.getGlobalVariables([Key.CONTACT_PHONE])]);
  assert.equal(h.state.indexes, 0);
  assert.equal(h.state.writes.length, 0);
  await Promise.all([h.upsertGlobalVariable(Key.CONTACT_EMAIL, "test@example.test", "", true), h.upsertGlobalVariable(Key.OFFICE_ADDRESS, "Test address", "", true)]);
  assert.equal(h.state.indexes, 1);
});

test("index failures prevent writes, are retryable, and never remove conflicting records", async () => {
  const h = harness();
  h.state.failIndex = true;
  await assert.rejects(h.upsertGlobalVariable(Key.WHATSAPP_MESSAGE, "Test", "", true), /Index conflict/);
  assert.equal(h.state.writes.length, 0);
  h.state.failIndex = false;
  await h.upsertGlobalVariable(Key.WHATSAPP_MESSAGE, "Test", "", true);
  assert.equal(h.state.indexes, 2);
  const duplicate = harness([record(Key.CONTACT_EMAIL, "first@example.test"), record(Key.CONTACT_EMAIL, "second@example.test")]);
  await assert.rejects(duplicate.upsertGlobalVariable(Key.CONTACT_EMAIL, "test@example.test", "", true), /Duplicate keys/);
  assert.equal(duplicate.state.records.length, 2);
  assert.equal(duplicate.state.writes.length, 0);
});

test("backend helpers and registry are explicitly server-only", () => {
  for (const file of ["../src/lib/global-variables.ts", "../src/lib/global-variable-registry.ts"]) {
    assert.match(readFileSync(new URL(file, import.meta.url), "utf8"), /^import "server-only";/);
  }
});

test("saving each social key expires only the social cache after persistence", async () => {
  const h = harness();
  for (const [key, domain] of [[Key.YOUTUBE_URL, "youtube.com"], [Key.FACEBOOK_URL, "facebook.com"], [Key.INSTAGRAM_URL, "instagram.com"]]) {
    await h.upsertGlobalVariable(key, `https://${domain}/example`, "", true);
    await h.upsertGlobalVariable(key, `https://${domain}/example`, "", false);
    assert.equal(await h.getGlobalVariable(key), null);
  }
  assert.equal(h.state.tags.length, 6);
  assert.ok(h.state.tags.every(entry => entry.tag === "social-links" && entry.options.expire === 0));
  const failed = harness(); failed.state.failIndex = true;
  await assert.rejects(failed.upsertGlobalVariable(Key.YOUTUBE_URL, "https://youtube.com/example", "", true));
  assert.equal(failed.state.tags.length, 0);
});
