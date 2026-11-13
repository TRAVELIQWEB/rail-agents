import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { randomUUID } from "node:crypto";
import test from "node:test";
import ts from "typescript";

function harness(indexes = [], records = []) {
  const state = { indexes, records: structuredClone(records), indexReads: 0, indexWrites: 0, writes: 0, failIndex: false, listError: null };
  const matches = (record, filter) => (!filter.slug || record.slug === filter.slug) &&
    (!filter.id || (typeof filter.id === "string" ? record.id === filter.id : record.id !== filter.id.$ne));
  const collection = {
    listIndexes() { state.indexReads++; return { async toArray() { if (state.listError) throw state.listError; return state.indexes; } }; },
    async createIndex() { state.indexWrites++; if (state.failIndex) throw new Error("Index initialization failed"); if (new Set(state.records.map(r => r.slug)).size !== state.records.length) throw new Error("Duplicate slugs"); state.indexes.push({ key: { slug: 1 }, unique: true }); },
    find() { return { async toArray() { return structuredClone(state.records); } }; },
    async findOne(filter) { return state.records.find(r => matches(r, filter)) ?? null; },
    async insertOne(record) { state.writes++; state.records.push(record); },
    async replaceOne(filter, record) { state.writes++; state.records[state.records.findIndex(r => matches(r, filter))] = record; },
    async deleteOne(filter) { state.writes++; const before = state.records.length; state.records = state.records.filter(r => !matches(r, filter)); return { deletedCount: before - state.records.length }; },
  };
  const sandbox = { exports: {}, Date, require(name) {
    if (name === "crypto") return { randomUUID };
    if (name === "@/lib/mongodb") return Promise.resolve({ db(name) { assert.equal(name, "railagents"); return { collection(name) { assert.equal(name, "blogs"); return collection; } }; } });
    throw new Error(`Unexpected dependency: ${name}`);
  } };
  vm.runInNewContext(ts.transpileModule(readFileSync("src/lib/posts.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2017 } }).outputText, sandbox);
  return { state, ...sandbox.exports };
}
const existing = { id: "existing", slug: "existing-post", title: "Existing", status: "published", createdAt: "2020-01-01T00:00:00.000Z" };
const unique = () => [{ key: { slug: 1 }, unique: true }];

test("all blog read paths work without index permissions or database writes", async () => {
  const h = harness([], [existing]); h.state.failIndex = true; h.state.listError = new Error("Read-only credentials");
  assert.equal((await h.getAllPosts()).length, 1);
  assert.equal((await h.getPublishedPosts()).length, 1);
  assert.equal((await h.getPostById(existing.id)).slug, existing.slug);
  assert.equal((await h.getPostBySlug(existing.slug)).id, existing.id);
  assert.equal(await h.slugExists(existing.slug), true);
  assert.equal(h.state.indexReads, 0); assert.equal(h.state.indexWrites, 0); assert.equal(h.state.writes, 0);
});

test("existing full unique index permits admin writes without index creation privileges", async () => {
  const h = harness(unique(), [existing]); h.state.failIndex = true;
  await h.createPost({ title: "New", slug: "new-post", status: "draft" });
  const changed = await h.updatePost(existing.id, { title: "Edited" });
  assert.equal(changed.createdAt, existing.createdAt);
  assert.equal(h.state.indexReads, 1); assert.equal(h.state.indexWrites, 0); assert.equal(h.state.writes, 2);
  await assert.rejects(h.createPost({ slug: existing.slug }), /already exists/);
  assert.equal(h.state.writes, 2);
});

test("concurrent creates initialize a missing unique index once, only on explicit writes", async () => {
  const h = harness();
  await Promise.all([h.createPost({ slug: "first", status: "draft" }), h.createPost({ slug: "second", status: "draft" })]);
  assert.equal(h.state.indexReads, 1); assert.equal(h.state.indexWrites, 1); assert.equal(h.state.writes, 2);
});

test("index errors block creates and updates, preserve records and allow a safe retry", async () => {
  const h = harness([], [existing]); h.state.failIndex = true;
  await assert.rejects(h.createPost({ slug: "new" }), /Index initialization failed/);
  await assert.rejects(h.updatePost(existing.id, { title: "Rejected" }), /Index initialization failed/);
  assert.equal(h.state.writes, 0); assert.deepEqual(h.state.records, [existing]);
  h.state.failIndex = false;
  await h.updatePost(existing.id, { title: "Saved" });
  assert.equal(h.state.records[0].title, "Saved"); assert.equal(h.state.writes, 1);
});

test("partial/sparse/compound indexes do not replace full unique-slug protection; duplicate data is never repaired automatically", async () => {
  for (const index of [{ key: { slug: 1 }, unique: false }, { key: { slug: 1 }, unique: true, sparse: true }, { key: { slug: 1 }, unique: true, partialFilterExpression: { status: "published" } }, { key: { slug: 1, status: 1 }, unique: true }]) {
    const h = harness([index]); await h.createPost({ slug: "new" }); assert.equal(h.state.indexWrites, 1);
  }
  const h = harness([], [existing, { ...existing, id: "duplicate" }]);
  await assert.rejects(h.createPost({ slug: "new" }), /Duplicate slugs/);
  assert.equal(h.state.writes, 0); assert.equal(h.state.records.length, 2);
});

test("index-list authorization errors fail closed, while a missing collection can initialize on create", async () => {
  const h = harness(); h.state.listError = Object.assign(new Error("Forbidden"), { code: 13 });
  await assert.rejects(h.createPost({ slug: "new" }), /Forbidden/);
  assert.equal(h.state.indexWrites, 0); assert.equal(h.state.writes, 0);
  const fresh = harness(); fresh.state.listError = { code: 26 };
  await fresh.createPost({ slug: "new" }); assert.equal(fresh.state.indexWrites, 1); assert.equal(fresh.state.writes, 1);
});
