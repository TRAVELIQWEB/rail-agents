import "server-only";

import type { ClientSession, Db, MongoClient } from "mongodb";
import { GlobalVariableKey, type GlobalVariableDocument } from "@/models/global-variable.schema";
import { globalVariableRegistry, validateGlobalVariableInput } from "@/lib/global-variable-registry";

interface LegacySettings {
  _id: string;
  whatsapp?: { number?: unknown; message?: unknown; enabled?: unknown };
}
interface MigrationEntry {
  key: GlobalVariableKey;
  action: "insert" | "unchanged" | "conflict";
  reason?: string;
}
export interface WhatsAppMigrationReport {
  dryRun: boolean;
  ready: boolean;
  entries: MigrationEntry[];
  blockers: string[];
  mode?: "transaction" | "standalone";
  verified?: boolean;
  sourceEnabled?: boolean;
}

async function plan(db: Db, session?: ClientSession) {
  const report: WhatsAppMigrationReport = { dryRun: true, ready: false, entries: [], blockers: [] };
  const desired: GlobalVariableDocument[] = [];
  const legacy = await db.collection<LegacySettings>("site_settings").findOne({ _id: "global" }, { session });
  const source = legacy?.whatsapp;
  if (!source || typeof source.number !== "string" || typeof source.message !== "string" || typeof source.enabled !== "boolean") {
    report.blockers.push("The legacy WhatsApp configuration is missing or incomplete. Resolve it explicitly before migration.");
    return { report, desired };
  }
  report.sourceEnabled = source.enabled;
  const now = new Date();
  for (const [key, value] of [
    [GlobalVariableKey.WHATSAPP_NUMBER, source.number],
    [GlobalVariableKey.WHATSAPP_MESSAGE, source.message],
  ] as const) {
    const desc = globalVariableRegistry[key].description;
    try {
      validateGlobalVariableInput(key, value, desc, source.enabled);
      if (key === GlobalVariableKey.WHATSAPP_NUMBER && source.enabled && value === "") throw new Error("Enabled WhatsApp requires a valid number.");
    } catch {
      report.blockers.push(`${key}: legacy value fails registry validation. No records will be inserted.`);
    }
    desired.push({ key, value, desc, status: source.enabled, createdAt: now, updatedAt: now });
  }
  // Check uniqueness across the collection before attempting the unique index.
  const existing = await db.collection<GlobalVariableDocument>("global_variables").find({}, { session }).toArray();
  if (new Set(existing.map((item) => item.key)).size !== existing.length) {
    report.blockers.push("Duplicate Global Variable keys block safe unique-index initialization.");
  }
  for (const target of desired) {
    const matches = existing.filter((item) => item.key === target.key);
    if (matches.length > 1) {
      report.entries.push({ key: target.key, action: "conflict", reason: "Duplicate existing records require explicit resolution." });
    } else if (!matches.length) {
      report.entries.push({ key: target.key, action: "insert" });
    } else if (matches[0].value === target.value && matches[0].status === target.status) {
      report.entries.push({ key: target.key, action: "unchanged" });
    } else {
      report.entries.push({ key: target.key, action: "conflict", reason: "Existing configured value or status differs; it will not be overwritten." });
    }
  }
  if (report.entries.some((entry) => entry.action === "conflict")) report.blockers.push("Resolve all Global Variables conflicts explicitly, then rerun dry-run. There is no overwrite/force mode.");
  report.ready = report.blockers.length === 0;
  return { report, desired };
}

// Explicitly invoked only by the migration CLI/tests. Dry-run performs reads only:
// no index creation, sessions, upserts, cache updates or legacy writes.
export async function migrateWhatsAppSettings(client: MongoClient, options: { dryRun: boolean }): Promise<WhatsAppMigrationReport> {
  if (typeof options?.dryRun !== "boolean") throw new Error("An explicit dryRun option is required.");
  const db = client.db("railagents");
  const hello = await db.command({ hello: 1 });
  const mode = hello.logicalSessionTimeoutMinutes != null &&
    ((typeof hello.setName === "string" && hello.maxWireVersion >= 7) || (hello.msg === "isdbgrid" && hello.maxWireVersion >= 8))
    ? "transaction" : "standalone";
  const initial = await plan(db);
  initial.report.dryRun = options.dryRun;
  initial.report.mode = mode;
  if (initial.report.ready && initial.report.entries.every((entry) => entry.action === "unchanged")) initial.report.verified = true;
  if (options.dryRun || !initial.report.ready || !initial.report.entries.some((entry) => entry.action === "insert")) return initial.report;

  const collection = db.collection<GlobalVariableDocument>("global_variables");
  await collection.createIndex({ key: 1 }, { unique: true });
  function assertUnchangedSource(current: Awaited<ReturnType<typeof plan>>) {
    if (!current.report.ready || current.desired.some((item, index) =>
      item.value !== initial.desired[index]?.value || item.status !== initial.desired[index]?.status)) {
      throw new Error("Source changed or target conflict detected. Stop and inspect dry-run; existing records must not be overwritten.");
    }
  }
  if (mode === "standalone") {
    // Insert message first: a missing number keeps public CTAs hidden if interrupted.
    // Never roll back by deleting records: a later administrator may have edited them.
    for (const key of [GlobalVariableKey.WHATSAPP_MESSAGE, GlobalVariableKey.WHATSAPP_NUMBER]) {
      const current = await plan(db);
      assertUnchangedSource(current);
      if (current.report.entries.find((entry) => entry.key === key)?.action === "insert") {
        await collection.insertOne(initial.desired.find((item) => item.key === key)!);
      }
      const verified = await plan(db);
      assertUnchangedSource(verified);
      if (verified.report.entries.find((entry) => entry.key === key)?.action !== "unchanged") {
        throw new Error("Per-record verification failed. Stop and inspect dry-run before resuming.");
      }
    }
    const verified = await plan(db);
    assertUnchangedSource(verified);
    if (!verified.report.entries.every((entry) => entry.action === "unchanged")) throw new Error("Final verification failed.");
    initial.report.verified = true;
    return initial.report;
  }
  const session = client.startSession();
  try {
    return await session.withTransaction(async () => {
      // Recheck inside the transaction so a concurrent admin edit is never overwritten.
      const current = await plan(db, session);
      current.report.dryRun = false;
      current.report.mode = mode;
      if (!current.report.ready) return current.report;
      assertUnchangedSource(current);
      for (const entry of current.report.entries) {
        if (entry.action === "insert") {
          const document = current.desired.find((item) => item.key === entry.key)!;
          await collection.insertOne(document, { session });
        }
      }
      const verified = await plan(db, session);
      assertUnchangedSource(verified);
      if (!verified.report.entries.every((entry) => entry.action === "unchanged")) throw new Error("Transaction verification failed.");
      current.report.verified = true;
      return current.report;
    }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
  } finally {
    await session.endSession();
  }
}
