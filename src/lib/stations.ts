import type { Collection, WithId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export interface RailwayStationDoc {
  stationCode: string;
  stationName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncStationsResult {
  totalFetched: number;
  inserted: number;
  updated: number;
  failed: number;
  totalInDb: number;
}

let isIndexEnsured = false;
let providerStationCache: { stations: RailwayStationDoc[]; expiresAt: number } | null = null;
let pendingProviderStations: Promise<RailwayStationDoc[]> | null = null;
let pendingEmptyDatabaseSync: Promise<SyncStationsResult | null> | null = null;

function normalizeStationQuery(query: string): string {
  return query.replace(/\s*\([A-Z0-9]+\)\s*$/i, "").trim();
}

function rankStationMatches(stations: RailwayStationDoc[], query: string, limit: number): RailwayStationDoc[] {
  const qLower = query.toLowerCase();
  return stations.sort((a, b) => {
    const aCode = a.stationCode.toLowerCase();
    const bCode = b.stationCode.toLowerCase();
    const aName = a.stationName.toLowerCase();
    const bName = b.stationName.toLowerCase();

    if (aCode === qLower && bCode !== qLower) return -1;
    if (bCode === qLower && aCode !== qLower) return 1;
    if (aCode.startsWith(qLower) && !bCode.startsWith(qLower)) return -1;
    if (bCode.startsWith(qLower) && !aCode.startsWith(qLower)) return 1;
    if (aName.startsWith(qLower) && !bName.startsWith(qLower)) return -1;
    if (bName.startsWith(qLower) && !aName.startsWith(qLower)) return 1;
    if (aName.length !== bName.length) return aName.length - bName.length;
    return aName.localeCompare(bName);
  }).slice(0, limit);
}

export async function getStationsCollection(): Promise<Collection<RailwayStationDoc>> {
  const client = await clientPromise;
  const collection = client.db("railagents").collection<RailwayStationDoc>("stations");

  if (!isIndexEnsured) {
    try {
      // 1. Unique index on stationCode
      await collection.createIndex({ stationCode: 1 }, { unique: true });
      // 2. Index on stationName for fast lookups
      await collection.createIndex({ stationName: 1 });
      isIndexEnsured = true;
    } catch (err) {
      console.error("Failed to ensure indices on stations collection:", err);
    }
  }

  return collection;
}

/**
 * Fetch all stations directly from the external railway station provider API
 * using server-side environment variables.
 */
export async function fetchStationsFromExternalProvider(): Promise<{ stationCode: string; stationName: string }[]> {
  const API_URL = process.env.RAILWAY_STATION_API_URL;
  const API_KEY = process.env.RAILWAY_API_KEY;

  if (!API_URL || !API_KEY) {
    throw new Error("Railway station API is not configured (missing RAILWAY_STATION_API_URL or RAILWAY_API_KEY).");
  }

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": API_KEY,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    throw new Error(`Railway station provider returned status: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid station data received from provider (expected array).");
  }

  const validStations: { stationCode: string; stationName: string }[] = [];
  for (const item of data) {
    if (
      typeof item === "object" &&
      item !== null &&
      "stationCode" in item &&
      "stationName" in item &&
      typeof item.stationCode === "string" &&
      typeof item.stationName === "string"
    ) {
      const code = item.stationCode.trim().toUpperCase();
      const name = item.stationName.trim();
      if (code && name) {
        validStations.push({ stationCode: code, stationName: name });
      }
    }
  }

  if (validStations.length === 0) {
    throw new Error("The railway station provider returned no valid stations.");
  }

  return validStations;
}

async function getCachedProviderStations(): Promise<RailwayStationDoc[]> {
  if (providerStationCache && providerStationCache.expiresAt > Date.now()) return providerStationCache.stations;
  if (!pendingProviderStations) {
    pendingProviderStations = fetchStationsFromExternalProvider()
      .then((stations) => {
        providerStationCache = { stations, expiresAt: Date.now() + 30 * 60 * 1000 };
        return stations;
      })
      .finally(() => { pendingProviderStations = null; });
  }
  return pendingProviderStations;
}

/** Search the railway provider when the database is empty, unavailable, or missing a station. */
export async function searchStationsFromProvider(query: string, limit = 10): Promise<RailwayStationDoc[]> {
  const stations = await getCachedProviderStations();
  const cleanQuery = normalizeStationQuery(query);
  if (!cleanQuery) {
    const prominentCodes = ["NDLS", "HWH", "CSTM", "MAS", "PNBE", "SBC", "JP", "BSB", "ADI", "LKO"];
    const prominent = prominentCodes.flatMap((code) => stations.filter((station) => station.stationCode === code));
    const remaining = stations.filter((station) => !prominentCodes.includes(station.stationCode));
    return [...prominent, ...remaining].slice(0, limit);
  }
  const lower = cleanQuery.toLowerCase();
  const matches = stations.filter((station) => station.stationCode.toLowerCase().startsWith(lower) || station.stationName.toLowerCase().includes(lower));
  return rankStationMatches(matches, cleanQuery, limit);
}

/**
 * Bulk upserts stations into the 'stations' collection.
 * Uses stationCode as the unique key to prevent duplicate records.
 */
export async function syncStationsToDatabase(providerStations?: RailwayStationDoc[]): Promise<SyncStationsResult> {
  const rawStations = providerStations ?? await fetchStationsFromExternalProvider();
  const collection = await getStationsCollection();

  if (rawStations.length === 0) {
    const totalInDb = await collection.countDocuments();
    return {
      totalFetched: 0,
      inserted: 0,
      updated: 0,
      failed: 0,
      totalInDb,
    };
  }

  const now = new Date().toISOString();
  const batchSize = 1000;
  let insertedCount = 0;
  let updatedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < rawStations.length; i += batchSize) {
    const batch = rawStations.slice(i, i + batchSize);
    const operations = batch.map((stn) => ({
      updateOne: {
        filter: { stationCode: stn.stationCode },
        update: {
          $set: {
            stationCode: stn.stationCode,
            stationName: stn.stationName,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        upsert: true,
      },
    }));

    try {
      const result = await collection.bulkWrite(operations, { ordered: false });
      insertedCount += result.upsertedCount;
      updatedCount += result.modifiedCount;
    } catch (err: unknown) {
      console.error(`Error during stations bulk write batch ${i}-${i + batch.length}:`, err);
      failedCount += batch.length;
    }
  }

  const totalInDb = await collection.countDocuments();

  return {
    totalFetched: rawStations.length,
    inserted: insertedCount,
    updated: updatedCount,
    failed: failedCount,
    totalInDb,
  };
}

/** Populate an empty collection once per server process, sharing concurrent requests. */
export async function populateStationsIfEmpty(): Promise<SyncStationsResult | null> {
  if (!pendingEmptyDatabaseSync) {
    pendingEmptyDatabaseSync = (async () => {
      if (await getStationsCount() > 0) return null;
      return syncStationsToDatabase(await getCachedProviderStations());
    })().finally(() => { pendingEmptyDatabaseSync = null; });
  }
  return pendingEmptyDatabaseSync;
}

/** Save stations returned by a provider lookup so subsequent searches can use MongoDB. */
export async function saveStationsToDatabase(stations: RailwayStationDoc[]): Promise<void> {
  if (stations.length === 0) return;
  const collection = await getStationsCollection();
  const now = new Date().toISOString();
  await collection.bulkWrite(stations.map((station) => ({
    updateOne: {
      filter: { stationCode: station.stationCode },
      update: {
        $set: { stationName: station.stationName, updatedAt: now },
        $setOnInsert: { stationCode: station.stationCode, createdAt: now },
      },
      upsert: true,
    },
  })), { ordered: false });
}

/**
 * Searches stations in MongoDB by stationCode or stationName.
 * Limits results to max 10 matching results per request.
 */
export async function searchStationsFromDatabase(query: string, limit = 10): Promise<RailwayStationDoc[]> {
  const collection = await getStationsCollection();
  const cleanQuery = normalizeStationQuery(query);

  // If query is empty, return top prominent railway hubs
  if (!cleanQuery) {
    const prominentCodes = ["NDLS", "HWH", "CSTM", "MAS", "PNBE", "SBC", "JP", "BSB", "ADI", "LKO"];
    const defaults = await collection
      .find(
        { stationCode: { $in: prominentCodes } },
        { projection: { _id: 0, stationCode: 1, stationName: 1 } }
      )
      .toArray();

    const sorted: RailwayStationDoc[] = [];
    for (const code of prominentCodes) {
      const match = defaults.find((s) => s.stationCode === code);
      if (match) {
        sorted.push({
          stationCode: match.stationCode,
          stationName: match.stationName,
        });
      }
    }

    if (sorted.length >= limit) {
      return sorted.slice(0, limit);
    }

    const rest = await collection
      .find(
        { stationCode: { $nin: prominentCodes } },
        { projection: { _id: 0, stationCode: 1, stationName: 1 } }
      )
      .limit(limit - sorted.length)
      .toArray();

    return [
      ...sorted,
      ...rest.map((r) => ({ stationCode: r.stationCode, stationName: r.stationName })),
    ];
  }

  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const codePrefixRegex = new RegExp(`^${escaped}`, "i");
  const containsRegex = new RegExp(escaped, "i");

  // Query MongoDB with $or
  const rawCandidates: WithId<RailwayStationDoc>[] = await collection
    .find(
      {
        $or: [
          { stationCode: codePrefixRegex },
          { stationName: containsRegex },
        ],
      },
      { projection: { _id: 0, stationCode: 1, stationName: 1 } }
    )
    .limit(limit * 5)
    .toArray();

  const candidates: RailwayStationDoc[] = rawCandidates.map((c) => ({
    stationCode: c.stationCode,
    stationName: c.stationName,
  }));

  return rankStationMatches(candidates, cleanQuery, limit);
}

/**
 * Return total station count in MongoDB
 */
export async function getStationsCount(): Promise<number> {
  const collection = await getStationsCollection();
  return collection.countDocuments();
}
