import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { NextResponse } from "next/server.js";

function load(relative, mocks = {}) {
  const sandbox = { exports: {}, URL, Date, Error, console: { error() {} }, require(name) {
    if (name === "server-only") return {};
    if (!(name in mocks)) throw new Error(`Unexpected dependency: ${name}`);
    return mocks[name];
  } };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, sandbox);
  return sandbox.exports;
}
const schema = load("../src/models/global-variable.schema.ts");
const sameOrigin = load("../src/lib/same-origin.ts");
const registry = load("../src/lib/global-variable-registry.ts", { "@/models/global-variable.schema": schema });
const { GlobalVariableKey: K } = schema;
const NUMBER = K.WHATSAPP_NUMBER, MESSAGE = K.WHATSAPP_MESSAGE;
const legacy = (enabled = true) => ({ _id: "global", whatsapp: { number: "12345678", message: "Private legacy message", enabled } });
const record = (key, value, status = true) => ({ _id: key, key, value, desc: "Existing description", status, createdAt: new Date(0), updatedAt: new Date(0) });

function harness(records = [], source = legacy()) {
  const state = { records: structuredClone(records), legacy: structuredClone(source), events: [], indexes: 0, sessions: 0, reads: [], authorized: true, failKey: null, failReads: false, failTransactions: false, onTransaction: null, standalone: false, onInsert: null };
  const clearCache = [];
  const cache = {
    unstable_cache(fn, keys, options) {
      assert.equal(keys[0], "whatsapp-global-variables-v1");
      assert.equal(options.revalidate, 60);
      assert.equal(options.tags[0], "whatsapp-settings");
      let promise;
      clearCache.push(() => { promise = undefined; });
      return () => promise ??= fn();
    },
    revalidateTag(tag, options) {
      assert.equal(tag, "whatsapp-settings");
      assert.equal(options.expire, 0);
      state.events.push("invalidate");
      for (const clear of clearCache) clear();
    },
  };
  const collection = {
    async createIndex() {
      state.indexes++;
      if (new Set(state.records.map((r) => r.key)).size !== state.records.length) throw new Error("Duplicate keys");
      return "key_1";
    },
    find(filter = {}) {
      state.reads.push("global_variables");
      const cursor = { sort: () => cursor, async toArray() {
        if (state.failReads) throw new Error("Database unavailable");
        return state.records.filter((r) => !filter.key || filter.key.$in.includes(r.key));
      } }; return cursor;
    },
    async findOneAndUpdate(filter, update) {
      if (filter.key === state.failKey) throw new Error("Simulated write failure");
      let item = state.records.find((r) => r.key === filter.key);
      if (!item) { item = { key: filter.key, ...update.$setOnInsert }; state.records.push(item); }
      Object.assign(item, update.$set); state.events.push(`write:${filter.key}`);
      return item;
    },
    async updateOne(filter, update) {
      if (filter.key === state.failKey) throw new Error("Simulated write failure");
      const item = state.records.find((r) => r.key === filter.key);
      if (item) Object.assign(item, update.$set);
      state.events.push(`sync:${filter.key}`);
    },
    async insertOne(item) {
      if (item.key === state.failKey) throw new Error("Simulated write failure");
      if (state.records.some((r) => r.key === item.key)) throw new Error("Duplicate key");
      state.records.push(item); state.events.push(`insert:${item.key}`);
      state.onInsert?.(item);
    },
  };
  const client = {
    db(name) { assert.equal(name, "railagents"); return { command: async () => state.standalone ? { maxWireVersion: 28 } : { setName: "test", logicalSessionTimeoutMinutes: 30, maxWireVersion: 28 }, collection(name) {
      if (name === "global_variables") return collection;
      assert.equal(name, "site_settings");
      return { async findOne() { state.reads.push("site_settings"); return state.legacy; } };
    } }; },
    startSession() {
      state.sessions++;
      return { async withTransaction(callback) {
        if (state.failTransactions) throw new Error("Transactions unavailable");
        state.onTransaction?.(); state.onTransaction = null;
        const snapshot = structuredClone(state.records);
        try { const result = await callback(); state.events.push("commit"); return result; }
        catch (error) { state.records = snapshot; state.events.push("rollback"); throw error; }
      }, async endSession() { state.events.push("endSession"); } };
    },
  };
  const dependencies = { "@/models/global-variable.schema": schema, "@/lib/global-variable-registry": registry };
  const helpers = load("../src/lib/global-variables.ts", { ...dependencies, "@/lib/mongodb": Promise.resolve(client), "next/cache": cache });
  const settings = load("../src/lib/whatsapp-settings.ts", { ...dependencies, "./global-variables": helpers, "next/cache": cache, react: { cache: (fn) => fn } });
  const migration = load("../src/lib/migrations/whatsapp-global-variables.ts", dependencies);
  const auth = { getAdminSession: async () => state.authorized ? { email: "test" } : null };
  const whatsappApi = load("../src/app/api/admin/whatsapp/route.ts", { "@/lib/same-origin": sameOrigin, "next/server": { NextResponse }, "@/lib/session": auth, "@/lib/whatsapp-settings": settings, "@/lib/global-variables": helpers });
  const globalApi = load("../src/app/api/admin/global-variables/route.ts", { ...dependencies, "@/lib/same-origin": sameOrigin, "next/server": { NextResponse }, "@/lib/session": auth, "@/lib/global-variables": helpers });
  const put = (api, body) => api.PUT(new Request("https://example.test/api/admin/settings", { method: "PUT", headers: { origin: "https://example.test", "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  return { state, client, helpers, settings, migration, whatsappApi, globalApi, put };
}

test("migration dry-run plans both mappings and performs no writes, index initialization or sessions", async () => {
  for (const enabled of [true, false]) {
    const h = harness([], legacy(enabled));
    const report = await h.migration.migrateWhatsAppSettings(h.client, { dryRun: true });
    assert.equal(report.ready, true); assert.equal(report.dryRun, true);
    assert.equal(report.sourceEnabled, enabled);
    assert.equal(report.entries.length, 2);
    assert.ok(report.entries.every((item) => item.action === "insert"));
    assert.equal(h.state.indexes, 0); assert.equal(h.state.sessions, 0); assert.equal(h.state.events.length, 0);
    assert.equal(h.state.records.length, 0);
    assert.deepEqual(h.state.legacy, legacy(enabled));
    assert.doesNotMatch(JSON.stringify(report), /12345678|Private legacy message/);
  }
});

test("mock apply preserves enabled/disabled state, creates only missing keys and is idempotent", async () => {
  for (const enabled of [true, false]) {
    const h = harness([], legacy(enabled));
    assert.equal((await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false })).ready, true);
    assert.equal(h.state.records.length, 2);
    assert.equal(h.state.records.find((r) => r.key === NUMBER).value, "12345678");
    assert.equal(h.state.records.find((r) => r.key === MESSAGE).value, "Private legacy message");
    assert.ok(h.state.records.every((r) => r.status === enabled && r.createdAt instanceof Date && r.updatedAt instanceof Date));
    const before = JSON.stringify(h.state.records), events = h.state.events.length;
    const repeat = await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false });
    assert.ok(repeat.entries.every((item) => item.action === "unchanged"));
    assert.equal(JSON.stringify(h.state.records), before); assert.equal(h.state.events.length, events);
    assert.deepEqual(h.state.legacy, legacy(enabled));
  }
});

test("existing matching records retain descriptions/timestamps and only the missing counterpart is inserted", async () => {
  const existing = record(NUMBER, "12345678");
  const h = harness([existing]);
  const result = await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false });
  assert.equal(result.ready, true);
  assert.deepEqual(h.state.records.find((r) => r.key === NUMBER), existing);
  assert.equal(h.state.records.length, 2);
});

test("migration refuses conflicting values/status, empty configured values and duplicate keys without partial inserts", async () => {
  for (const existing of [record(NUMBER, "87654321"), record(NUMBER, "12345678", false), record(NUMBER, ""), record(MESSAGE, "Different message")]) {
    const h = harness([existing]);
    const report = await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false });
    assert.equal(report.ready, false); assert.ok(report.entries.some((r) => r.action === "conflict"));
    assert.equal(h.state.events.length, 0); assert.equal(h.state.indexes, 0);
    assert.deepEqual(h.state.records, [existing]);
  }
  const h = harness([record(NUMBER, "12345678"), record(NUMBER, "12345678")]);
  assert.equal((await h.migration.migrateWhatsAppSettings(h.client, { dryRun: true })).ready, false);
});

test("migration rejects missing/incomplete/invalid source and rechecks conflicts inside the transaction", async () => {
  for (const source of [null, { _id: "global" }, { _id: "global", whatsapp: { number: "12345678" } }, legacy("true"), { ...legacy(), whatsapp: { ...legacy().whatsapp, number: "+12345678" } }]) {
    const h = harness([], source);
    assert.equal((await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false })).ready, false);
    assert.equal(h.state.events.length, 0);
  }
  const h = harness();
  h.state.onTransaction = () => h.state.records.push(record(NUMBER, "87654321"));
  assert.equal((await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false })).ready, false);
  assert.equal(h.state.records.length, 1);
  assert.equal(h.state.records[0].value, "87654321");
});

test("migration transaction failure rolls back the pair and never touches legacy data", async () => {
  const h = harness(); h.state.failKey = MESSAGE;
  await assert.rejects(h.migration.migrateWhatsAppSettings(h.client, { dryRun: false }));
  assert.equal(h.state.records.length, 0);
  assert.deepEqual(h.state.legacy, legacy());
});

test("public reads use only global_variables and hide incomplete/invalid configuration without side effects", async () => {
  for (const records of [[], [record(NUMBER, "12345678")], [record(MESSAGE, "Message")], [record(NUMBER, ""), record(MESSAGE, "Message")], [record(NUMBER, "+12345678"), record(MESSAGE, "Message")], [record(NUMBER, "12345678"), record(NUMBER, "87654321"), record(MESSAGE, "Message")]]) {
    const h = harness(records);
    const settings = await h.settings.getWhatsAppSettings();
    assert.equal(settings.enabled, false); assert.equal(settings.number, "");
    assert.equal(h.state.indexes, 0); assert.equal(h.state.sessions, 0);
    assert.ok(!h.state.reads.includes("site_settings"));
  }
  const h = harness(); h.state.failReads = true;
  assert.equal((await h.settings.getWhatsAppSettings()).enabled, false);
  await assert.rejects(h.settings.getWhatsAppSettingsForAdmin());
  const blankMessage = harness([record(NUMBER, "12345678"), record(MESSAGE, "", false)]);
  assert.equal((await blankMessage.settings.getWhatsAppSettings()).enabled, true);
  assert.equal(await blankMessage.helpers.getGlobalVariable(MESSAGE), "");
});

test("number status is canonical even if old message status disagrees; message edits cannot toggle visibility", async () => {
  const h = harness([record(NUMBER, "12345678", false), record(MESSAGE, "Message", true)]);
  assert.equal((await h.settings.getWhatsAppSettings()).enabled, false);
  assert.equal(await h.helpers.getGlobalVariable(MESSAGE), null);
  const result = await h.put(h.globalApi, { key: MESSAGE, value: "Edited", desc: "Description", status: true });
  assert.equal(result.status, 200);
  const body = await result.json();
  assert.equal(body.variable.status, false); assert.equal(body.variable.statusControlledBy, NUMBER);
  assert.ok(h.state.records.every((r) => r.status === false));
});

test("WhatsApp admin save updates both global records atomically, preserves createdAt/desc and expires public cache", async () => {
  const h = harness([record(NUMBER, "12345678"), record(MESSAGE, "Before")]);
  assert.equal((await h.settings.getWhatsAppSettings()).message, "Before");
  const result = await h.put(h.whatsappApi, { number: "123456789", message: "After & नमस्ते", enabled: false });
  assert.equal(result.status, 200);
  assert.ok(h.state.records.every((r) => !r.status && r.createdAt.getTime() === 0 && r.desc === "Existing description"));
  assert.ok(h.state.events.indexOf("invalidate") > h.state.events.indexOf("commit"));
  const publicSettings = await h.settings.getWhatsAppSettings();
  assert.equal(publicSettings.number, "123456789"); assert.equal(publicSettings.message, "After & नमस्ते"); assert.equal(publicSettings.enabled, false);
  assert.equal((await (await h.whatsappApi.GET()).json()).whatsapp.message, "After & नमस्ते");
  assert.ok(!h.state.reads.includes("site_settings"));
});

test("Global Variables edits update WhatsApp admin, synchronize status, refresh related rows and expire cached links", async () => {
  const h = harness([record(NUMBER, "12345678"), record(MESSAGE, "Before")]);
  await h.settings.getWhatsAppSettings();
  assert.equal((await h.put(h.globalApi, { key: NUMBER, value: "123456789", desc: "Number", status: false })).status, 200);
  assert.equal((await h.settings.getWhatsAppSettings()).enabled, false);
  const result = await h.put(h.globalApi, { key: NUMBER, value: "123456789", desc: "Number", status: true });
  const body = await result.json();
  assert.equal(body.variables.find((r) => r.key === MESSAGE).status, true);
  assert.equal((await h.settings.getWhatsAppSettings()).enabled, true);
  await h.put(h.globalApi, { key: MESSAGE, value: "Question & details?\n🚂", desc: "Message", status: false });
  const admin = (await (await h.whatsappApi.GET()).json()).whatsapp;
  assert.equal(admin.message, "Question & details?\n🚂"); assert.equal(admin.enabled, true);
  const settings = await h.settings.getWhatsAppSettings();
  const { getWhatsAppUrl } = load("../src/lib/whatsapp.ts");
  const url = new URL(getWhatsAppUrl(settings.message, settings.number));
  assert.equal(url.pathname, "/123456789"); assert.equal(url.searchParams.get("text"), admin.message);
});

test("single-key configuration never inserts a missing counterpart and failed saves never expose a partial pair", async () => {
  const h = harness();
  await h.helpers.upsertGlobalVariable(MESSAGE, "Message", "", true);
  assert.equal(h.state.records.length, 1); assert.equal(h.state.records[0].status, false);
  assert.equal((await h.settings.getWhatsAppSettings()).enabled, false);
  const failed = harness([record(NUMBER, "12345678"), record(MESSAGE, "Before")]);
  const original = structuredClone(failed.state.records);
  failed.state.failKey = MESSAGE;
  assert.equal((await failed.put(failed.whatsappApi, { number: "87654321", message: "After", enabled: false })).status, 500);
  assert.deepEqual(failed.state.records, original);
  assert.ok(!failed.state.events.includes("invalidate"));
  failed.state.failKey = null; failed.state.failTransactions = true;
  await assert.rejects(failed.helpers.upsertGlobalVariable(NUMBER, "87654321", "", false));
  assert.deepEqual(failed.state.records, original);
});

test("migration CLI dry-run uses a fixture without opening MongoDB, redacts values, and rejects unsafe invocations", () => {
  const dir = mkdtempSync(join(tmpdir(), "railagents-migration-test-"));
  const file = join(dir, "fixture.json");
  writeFileSync(file, JSON.stringify({ legacy: legacy(), variables: [] }));
  const run = (...args) => spawnSync(process.execPath, ["scripts/migrate-whatsapp-settings.mjs", ...args], { encoding: "utf8", timeout: 15000 });
  const dry = run("--dry-run", "--fixture", file);
  assert.equal(dry.status, 0, dry.stderr);
  const report = JSON.parse(dry.stdout);
  assert.equal(report.ready, true); assert.equal(report.dryRun, true);
  assert.doesNotMatch(dry.stdout, /12345678|Private legacy message/);
  assert.equal(run().status, 1);
  assert.equal(run("--apply", "--fixture", file).status, 1);
  assert.equal(run("--dry-run", "--force").status, 1);
});

test("standalone migration verifies each record, preserves source, and reruns without writes", async () => {
  for (const enabled of [true, false]) {
    const h = harness([], legacy(enabled)); h.state.standalone = true;
    const dry = await h.migration.migrateWhatsAppSettings(h.client, { dryRun: true });
    assert.equal(dry.mode, "standalone"); assert.equal(h.state.events.length, 0);
    const result = await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false });
    assert.equal(result.verified, true); assert.equal(h.state.sessions, 0);
    assert.deepEqual(h.state.events, [`insert:${MESSAGE}`, `insert:${NUMBER}`]);
    assert.ok(h.state.records.every(r => r.status === enabled));
    const before = structuredClone(h.state.records);
    const repeat = await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false });
    assert.ok(repeat.entries.every(e => e.action === "unchanged"));
    assert.equal(JSON.stringify(h.state.records), JSON.stringify(before)); assert.deepEqual(h.state.legacy, legacy(enabled));
  }
});

test("standalone interruption leaves verified message, hides incomplete CTAs, and resumes without overwriting", async () => {
  const h = harness(); h.state.standalone = true; h.state.failKey = NUMBER;
  await assert.rejects(h.migration.migrateWhatsAppSettings(h.client, { dryRun: false }));
  assert.equal(h.state.records.length, 1); assert.equal(h.state.records[0].key, MESSAGE);
  assert.equal((await h.settings.getWhatsAppSettings()).enabled, false);
  const preserved = structuredClone(h.state.records[0]);
  h.state.failKey = null;
  const dry = await h.migration.migrateWhatsAppSettings(h.client, { dryRun: true });
  assert.equal(dry.ready, true);
  assert.equal(dry.entries.find(e => e.key === MESSAGE).action, "unchanged");
  assert.equal((await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false })).verified, true);
  assert.equal(JSON.stringify(h.state.records.find(r => r.key === MESSAGE)), JSON.stringify(preserved));
});

test("standalone verification stops on source changes, target tampering and unrelated duplicate keys", async () => {
  for (const mutate of [h => { h.state.legacy.whatsapp.enabled = false; }, h => { h.state.records[0].value = "Concurrent edit"; }]) {
    const h = harness(); h.state.standalone = true; h.state.onInsert = () => mutate(h);
    await assert.rejects(h.migration.migrateWhatsAppSettings(h.client, { dryRun: false }));
    assert.equal(h.state.records.length, 1); assert.equal(h.state.records[0].key, MESSAGE);
  }
  const h = harness([record(K.CONTACT_EMAIL, "a@example.test"), record(K.CONTACT_EMAIL, "b@example.test")]);
  h.state.standalone = true;
  assert.equal((await h.migration.migrateWhatsAppSettings(h.client, { dryRun: false })).ready, false);
  assert.equal(h.state.indexes, 0); assert.equal(h.state.events.length, 0);
});

test("standalone Global Variables edits preserve canonical visibility and invalidate even after partial failure", async () => {
  const h = harness([record(NUMBER, "12345678"), record(MESSAGE, "Before")]); h.state.standalone = true;
  await h.settings.getWhatsAppSettings();
  assert.equal((await h.put(h.globalApi, { key: NUMBER, value: "123456789", desc: "", status: false })).status, 200);
  assert.equal((await h.settings.getWhatsAppSettings()).enabled, false);
  assert.equal((await h.put(h.globalApi, { key: MESSAGE, value: "After", desc: "", status: true })).status, 200);
  assert.equal((await h.settings.getWhatsAppSettings()).message, "After");
  assert.ok(h.state.records.every(r => r.status === false));
  assert.ok(!h.state.events.includes(`sync:${NUMBER}`), "Message edits must never overwrite canonical number status");
  h.state.failKey = NUMBER;
  const response = await h.put(h.whatsappApi, { number: "87654321", message: "Partial", enabled: true });
  assert.equal(response.status, 500);
  assert.equal((await h.settings.getWhatsAppSettings()).enabled, false);
  assert.equal(h.state.events.at(-1), "invalidate");
  assert.equal(h.state.sessions, 0);
});

test("retired WhatsApp page redirects only after authentication and sidebar contains only centralized settings", async () => {
  for (const authorized of [true, false]) {
    const page = load("../src/app/admin/whatsapp/page.tsx", {
      "next/navigation": { redirect: path => { throw new Error(path); } },
      "@/lib/session": { getAdminSession: async () => authorized ? { email: "test" } : null },
    });
    await assert.rejects(page.default(), { message: authorized ? "/admin/global-variables" : "/admin/login" });
  }
  const shell = readFileSync(new URL("../src/components/admin/AdminShell.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(shell, /\/admin\/whatsapp/);
  assert.match(shell, /\/admin\/global-variables/);
});
