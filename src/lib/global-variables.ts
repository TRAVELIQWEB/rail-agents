import "server-only";

import { revalidateTag } from "next/cache";
import type { ClientSession, Collection, WithId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { assertGlobalVariableKey, globalVariableRegistry, validateGlobalVariableInput } from "@/lib/global-variable-registry";
import { GlobalVariableKey, type GlobalVariableDocument } from "@/models/global-variable.schema";
import type { WhatsAppSettings } from "@/lib/whatsapp";

export const WHATSAPP_SETTINGS_CACHE_TAG = "whatsapp-settings";
export const SOCIAL_LINKS_CACHE_TAG = "social-links";
const NUMBER = GlobalVariableKey.WHATSAPP_NUMBER;
const MESSAGE = GlobalVariableKey.WHATSAPP_MESSAGE;
let indexPromise: Promise<string> | undefined;

async function getCollection(): Promise<Collection<GlobalVariableDocument>> {
  const client = await clientPromise;
  return client.db("railagents").collection<GlobalVariableDocument>("global_variables");
}

// Reads/builds never create indexes or records. Only an explicitly requested save
// initializes uniqueness; failed initialization never repairs or deletes data.
async function getWritableCollection() {
  const collection = await getCollection();
  if (!indexPromise) {
    indexPromise = collection.createIndex({ key: 1 }, { unique: true }).catch((error: unknown) => {
      indexPromise = undefined;
      throw error;
    });
  }
  await indexPromise;
  return collection;
}

export async function getGlobalVariable(key: GlobalVariableKey): Promise<string | null> {
  assertGlobalVariableKey(key);
  return (await getGlobalVariables([key]))[key];
}

export async function getGlobalVariables<K extends GlobalVariableKey>(keys: readonly K[]): Promise<Record<K, string | null>> {
  for (const key of keys) assertGlobalVariableKey(key);
  const values = Object.fromEntries(keys.map((key) => [key, null])) as Record<K, string | null>;
  if (!keys.length) return values;
  const queriedKeys = new Set<GlobalVariableKey>(keys);
  for (const key of keys) {
    const controller = globalVariableRegistry[key].statusControlledBy;
    if (controller) queriedKeys.add(controller);
  }
  const records = await getGlobalVariableRecords([...queriedKeys]);
  const byKey = new Map(records.map((record) => [record.key, record]));
  for (const key of keys) {
    const record = byKey.get(key);
    const controller = globalVariableRegistry[key].statusControlledBy;
    const active = controller ? byKey.get(controller)?.status === true : record?.status === true;
    values[key] = active && record ? record.value : null;
  }
  return values;
}

export async function getGlobalVariableRecords(keys?: readonly GlobalVariableKey[]): Promise<WithId<GlobalVariableDocument>[]> {
  if (keys) for (const key of keys) assertGlobalVariableKey(key);
  if (keys && !keys.length) return [];
  const collection = await getCollection();
  return collection.find(keys ? { key: { $in: [...new Set(keys)] } } : {}).sort({ key: 1 }).toArray();
}

async function saveRecord(collection: Collection<GlobalVariableDocument>, key: GlobalVariableKey, value: string, desc: string, status: boolean, session?: ClientSession) {
  const now = new Date();
  const record = await collection.findOneAndUpdate(
    { key },
    { $set: { value, desc, status, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: "after", includeResultMetadata: false, ...(session ? { session } : {}) },
  );
  if (!record) throw new Error("Global variable was not saved.");
  return record;
}

// Use transactions where available. On standalone MongoDB the number status is
// authoritative, so the message's stored status never controls public visibility.
// Missing counterparts are never implicitly configured by a single-key edit.
async function saveWhatsAppPair(change: { key: GlobalVariableKey; value: string; desc: string; status: boolean } | WhatsAppSettings) {
  const collection = await getWritableCollection();
  const client = await clientPromise;
  const persist = async (session?: ClientSession) => {
      const records = await collection.find({ key: { $in: [NUMBER, MESSAGE] } }, { session }).toArray();
      const byKey = new Map(records.map((item) => [item.key, item]));
      const fullSettings = "number" in change;
      const enabled = fullSettings ? change.enabled : change.key === NUMBER ? change.status : byKey.get(NUMBER)?.status === true;
      let saved: WithId<GlobalVariableDocument> | undefined;
      for (const key of [MESSAGE, NUMBER]) {
        const previous = byKey.get(key);
        if (fullSettings || change.key === key) {
          saved = await saveRecord(
            collection, key,
            fullSettings ? (key === NUMBER ? change.number : change.message) : change.value,
            fullSettings ? (previous?.desc ?? globalVariableRegistry[key].description) : change.desc,
            enabled, session,
          );
          byKey.set(key, saved);
        } else if (previous && key === MESSAGE) {
          await collection.updateOne({ key }, { $set: { status: enabled, updatedAt: new Date() } }, { session });
        }
      }
      return fullSettings ? saved : byKey.get(change.key);
  };
  const hello = await client.db("railagents").command({ hello: 1 });
  const transactions = hello.logicalSessionTimeoutMinutes != null &&
    ((typeof hello.setName === "string" && hello.maxWireVersion >= 7) || (hello.msg === "isdbgrid" && hello.maxWireVersion >= 8));
  if (!transactions) {
    // A failed standalone save may have persisted one record. Invalidate even
    // on failure so retries/admin reloads see current data rather than stale CTAs.
    try {
      const record = await persist();
      if (!record) throw new Error("WhatsApp settings were not saved.");
      return record;
    } finally {
      revalidateTag(WHATSAPP_SETTINGS_CACHE_TAG, { expire: 0 });
    }
  }
  const session = client.startSession();
  try {
    const record = await session.withTransaction(() => persist(session), { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
    if (!record) throw new Error("WhatsApp settings were not saved.");
    revalidateTag(WHATSAPP_SETTINGS_CACHE_TAG, { expire: 0 });
    return record;
  } finally {
    await session.endSession();
  }
}

export async function upsertGlobalVariable(key: GlobalVariableKey, value: string, desc: string, status: boolean): Promise<WithId<GlobalVariableDocument>> {
  validateGlobalVariableInput(key, value, desc, status);
  if (key === NUMBER || key === MESSAGE) return saveWhatsAppPair({ key, value, desc, status });
  const record = await saveRecord(await getWritableCollection(), key, value, desc, status);
  if ([GlobalVariableKey.YOUTUBE_URL, GlobalVariableKey.FACEBOOK_URL, GlobalVariableKey.INSTAGRAM_URL].includes(key)) {
    revalidateTag(SOCIAL_LINKS_CACHE_TAG, { expire: 0 });
  }
  return record;
}

export async function saveWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  if (typeof settings.number !== "string" || !/^[1-9]\d{7,14}$/.test(settings.number)) throw new Error("Invalid WhatsApp number.");
  validateGlobalVariableInput(NUMBER, settings.number, "", settings.enabled);
  validateGlobalVariableInput(MESSAGE, settings.message, "", settings.enabled);
  await saveWhatsAppPair(settings);
}
