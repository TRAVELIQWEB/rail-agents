import "server-only";

import { createHmac } from "node:crypto";
import type { Collection } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type SnapshotKind = "pnr" | "live" | "charting";

interface RailwaySnapshot {
  key: string;
  data: unknown;
  fetchedAt: Date;
  expiresAt: Date;
}

const freshnessMs: Record<SnapshotKind, number> = {
  pnr: 5_000,
  live: 5_000,
  charting: 60_000,
};

let indexPromise: Promise<unknown> | null = null;

function getSnapshotKey(kind: SnapshotKind, identifier: string): string {
  if (kind !== "pnr") return `${kind}:${identifier}`;
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("PNR snapshot storage requires SESSION_SECRET.");
  return `pnr:${createHmac("sha256", secret).update(identifier).digest("hex")}`;
}

async function getSnapshotCollection(): Promise<Collection<RailwaySnapshot>> {
  const client = await clientPromise;
  const collection = client.db("railagents").collection<RailwaySnapshot>("railway_snapshots");
  if (!indexPromise) {
    indexPromise = Promise.all([
      collection.createIndex({ key: 1 }, { unique: true }),
      collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ])
      .catch((error) => {
        indexPromise = null;
        throw error;
      });
  }
  await indexPromise;
  return collection;
}

/** Only return provider data while its short freshness window is still open. */
export async function readRailwaySnapshot(kind: SnapshotKind, identifier: string): Promise<unknown | null> {
  const collection = await getSnapshotCollection();
  const snapshot = await collection.findOne(
    { key: getSnapshotKey(kind, identifier), expiresAt: { $gt: new Date() } },
    { projection: { _id: 0, data: 1 } },
  );
  return snapshot?.data ?? null;
}

export async function saveRailwaySnapshot(kind: SnapshotKind, identifier: string, data: unknown): Promise<void> {
  const collection = await getSnapshotCollection();
  const fetchedAt = new Date();
  await collection.updateOne(
    { key: getSnapshotKey(kind, identifier) },
    {
      $set: {
        data,
        fetchedAt,
        expiresAt: new Date(fetchedAt.getTime() + freshnessMs[kind]),
      },
      $setOnInsert: { key: getSnapshotKey(kind, identifier) },
    },
    { upsert: true },
  );
}
