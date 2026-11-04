import type { Collection, WithId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export interface RailwayTrainDoc {
  trainNumber: string;
  trainName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncTrainsResult {
  totalFetched: number;
  inserted: number;
  updated: number;
  failed: number;
  totalInDb: number;
}

export interface TrainChartStation {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  day: number;
  distance: string;
  chartTimeLocal: string | null;
  chartOneDayOffset: number | null;
  chartTwoTimeLocal: string | null;
  chartTwoDayOffset: number | null;
  chartRemoteStation: string | null;
  firstChartDateTime: string | null;
  secondChartDateTime: string | null;
}

export interface TrainChartingResponse {
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  originStation: string;
  destinationStation: string;
  knownChartCount: number;
  stations: TrainChartStation[];
}

const DEFAULT_TRAIN_LIST_URL =
  "https://dev-api-rail.977-24-24-365.co.in/rail/integrations/train-list";
const DEFAULT_CHARTING_BASE_URL =
  "https://dev-api-rail.977-24-24-365.co.in/rail/integrations/charting";

let isTrainIndexEnsured = false;
let autoSyncPromise: Promise<void> | null = null;
let fallbackTrainsCache: RailwayTrainDoc[] | null = null;

export async function getTrainsCollection(): Promise<Collection<RailwayTrainDoc>> {
  const client = await clientPromise;
  const collection = client.db("railagents").collection<RailwayTrainDoc>("trains");

  if (!isTrainIndexEnsured) {
    try {
      await collection.createIndex({ trainNumber: 1 }, { unique: true });
      await collection.createIndex({ trainName: 1 });
      isTrainIndexEnsured = true;
    } catch (err) {
      console.error("Failed to ensure indices on trains collection:", err);
    }
  }

  return collection;
}

/**
 * Fetch all trains directly from the external railway provider API
 * using server-side environment variables.
 */
export async function fetchTrainsFromExternalProvider(): Promise<
  { trainNumber: string; trainName: string }[]
> {
  const API_URL = process.env.RAILWAY_TRAIN_LIST_API_URL || DEFAULT_TRAIN_LIST_URL;
  const API_KEY = process.env.RAILWAY_API_KEY;

  if (!API_KEY) {
    throw new Error("Railway API is not configured (missing RAILWAY_API_KEY).");
  }

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": API_KEY,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Railway train-list provider returned status: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid train list data received from provider (expected array).");
  }

  const validTrains: { trainNumber: string; trainName: string }[] = [];
  for (const item of data) {
    if (
      typeof item === "object" &&
      item !== null &&
      "trainNumber" in item &&
      "trainName" in item &&
      typeof item.trainNumber === "string" &&
      typeof item.trainName === "string"
    ) {
      const num = item.trainNumber.trim();
      const name = item.trainName.trim();
      if (num && name) {
        validTrains.push({ trainNumber: num, trainName: name });
      }
    }
  }

  fallbackTrainsCache = validTrains;
  return validTrains;
}

/**
 * Bulk upserts trains into the 'trains' collection in MongoDB.
 * Uses trainNumber as the unique key to prevent duplicate records.
 */
export async function syncTrainsToDatabase(): Promise<SyncTrainsResult> {
  const rawTrains = await fetchTrainsFromExternalProvider();
  const collection = await getTrainsCollection();

  if (rawTrains.length === 0) {
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

  for (let i = 0; i < rawTrains.length; i += batchSize) {
    const batch = rawTrains.slice(i, i + batchSize);
    const operations = batch.map((trn) => ({
      updateOne: {
        filter: { trainNumber: trn.trainNumber },
        update: {
          $set: {
            trainNumber: trn.trainNumber,
            trainName: trn.trainName,
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
      console.error(`Error during trains bulk write batch ${i}-${i + batch.length}:`, err);
      failedCount += batch.length;
    }
  }

  const totalInDb = await collection.countDocuments();

  return {
    totalFetched: rawTrains.length,
    inserted: insertedCount,
    updated: updatedCount,
    failed: failedCount,
    totalInDb,
  };
}

function rankTrains(
  candidates: RailwayTrainDoc[],
  cleanQuery: string,
  limit: number
): RailwayTrainDoc[] {
  const qLower = cleanQuery.toLowerCase();

  candidates.sort((a, b) => {
    const aNum = a.trainNumber.toLowerCase();
    const bNum = b.trainNumber.toLowerCase();
    const aName = a.trainName.toLowerCase();
    const bName = b.trainName.toLowerCase();

    // 1. Exact trainNumber match
    if (aNum === qLower && bNum !== qLower) return -1;
    if (bNum === qLower && aNum !== qLower) return 1;

    // 2. Starts with trainNumber
    if (aNum.startsWith(qLower) && !bNum.startsWith(qLower)) return -1;
    if (bNum.startsWith(qLower) && !aNum.startsWith(qLower)) return 1;

    // 3. Train name starts with query
    const aNameStarts = aName.startsWith(qLower);
    const bNameStarts = bName.startsWith(qLower);
    if (aNameStarts && !bNameStarts) return -1;
    if (bNameStarts && !aNameStarts) return 1;

    // 4. Shorter name is generally more direct
    if (aName.length !== bName.length) {
      return aName.length - bName.length;
    }

    return aNum.localeCompare(bNum);
  });

  return candidates.slice(0, limit);
}

const PROMINENT_TRAIN_NUMBERS = [
  "12952",
  "12951",
  "12301",
  "12302",
  "12002",
  "22436",
  "12627",
  "12802",
  "12424",
  "12259",
];

/**
 * Searches trains in MongoDB by trainNumber or trainName.
 * Automatically populates MongoDB if the collection is empty, and falls back
 * to provider memory cache if MongoDB is unavailable.
 */
export async function searchTrainsFromDatabase(
  query: string,
  limit = 10
): Promise<{ trains: RailwayTrainDoc[]; totalInDb: number; source: "mongodb" | "provider-cache" }> {
  // Clean query if user selected formatted string like "12952 - MMCT TEJAS RAJ" or "MMCT TEJAS RAJ (12952)"
  const cleanQuery = query
    .replace(/^\d{4,5}\s*[-–]\s*/, "")
    .replace(/\s*\(\d{4,5}\)\s*$/, "")
    .trim();
  const rawDigitsMatch = query.trim().match(/^(\d{1,5})/);
  const effectiveQuery = rawDigitsMatch ? rawDigitsMatch[1] : cleanQuery;

  try {
    const collection = await getTrainsCollection();
    let totalInDb = await collection.countDocuments();

    // Auto-sync once if collection is empty
    if (totalInDb === 0) {
      if (!autoSyncPromise) {
        autoSyncPromise = syncTrainsToDatabase()
          .then(() => undefined)
          .catch((err) => {
            console.error("Auto-sync of train list to MongoDB failed:", err);
          })
          .finally(() => {
            autoSyncPromise = null;
          });
      }
      await autoSyncPromise;
      totalInDb = await collection.countDocuments();
    }

    if (totalInDb > 0) {
      if (!effectiveQuery) {
        const defaults = await collection
          .find(
            { trainNumber: { $in: PROMINENT_TRAIN_NUMBERS } },
            { projection: { _id: 0, trainNumber: 1, trainName: 1 } }
          )
          .toArray();

        const sorted: RailwayTrainDoc[] = [];
        for (const num of PROMINENT_TRAIN_NUMBERS) {
          const match = defaults.find((t) => t.trainNumber === num);
          if (match) {
            sorted.push({
              trainNumber: match.trainNumber,
              trainName: match.trainName,
            });
          }
        }

        if (sorted.length >= limit) {
          return { trains: sorted.slice(0, limit), totalInDb, source: "mongodb" };
        }

        const rest = await collection
          .find(
            { trainNumber: { $nin: PROMINENT_TRAIN_NUMBERS } },
            { projection: { _id: 0, trainNumber: 1, trainName: 1 } }
          )
          .limit(limit - sorted.length)
          .toArray();

        return {
          trains: [
            ...sorted,
            ...rest.map((r) => ({ trainNumber: r.trainNumber, trainName: r.trainName })),
          ],
          totalInDb,
          source: "mongodb",
        };
      }

      const escaped = effectiveQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const numPrefixRegex = new RegExp(`^${escaped}`, "i");
      const containsRegex = new RegExp(escaped, "i");

      const rawCandidates: WithId<RailwayTrainDoc>[] = await collection
        .find(
          {
            $or: [{ trainNumber: numPrefixRegex }, { trainName: containsRegex }],
          },
          { projection: { _id: 0, trainNumber: 1, trainName: 1 } }
        )
        .limit(limit * 6)
        .toArray();

      const candidates: RailwayTrainDoc[] = rawCandidates.map((c) => ({
        trainNumber: c.trainNumber,
        trainName: c.trainName,
      }));

      return {
        trains: rankTrains(candidates, effectiveQuery, limit),
        totalInDb,
        source: "mongodb",
      };
    }
  } catch (dbErr) {
    console.warn("MongoDB train search unavailable, falling back to provider cache:", dbErr);
  }

  // Fallback to in-memory cache from external provider
  const allTrains = fallbackTrainsCache ?? (await fetchTrainsFromExternalProvider());
  if (!effectiveQuery) {
    const defaults: RailwayTrainDoc[] = [];
    for (const num of PROMINENT_TRAIN_NUMBERS) {
      const found = allTrains.find((t) => t.trainNumber === num);
      if (found) defaults.push(found);
    }
    return {
      trains: defaults.slice(0, limit),
      totalInDb: allTrains.length,
      source: "provider-cache",
    };
  }

  const qLower = effectiveQuery.toLowerCase();
  const filtered = allTrains.filter(
    (t) =>
      t.trainNumber.toLowerCase().startsWith(qLower) ||
      t.trainName.toLowerCase().includes(qLower)
  );

  return {
    trains: rankTrains(filtered.slice(0, limit * 6), effectiveQuery, limit),
    totalInDb: allTrains.length,
    source: "provider-cache",
  };
}

/**
 * Fetch station-wise charting preparation timing for a specific train and date
 * from the external provider API.
 */
export async function fetchTrainChartingFromExternalProvider(
  trainNumber: string,
  date: string
): Promise<TrainChartingResponse> {
  const BASE_URL = (process.env.RAILWAY_CHARTING_API_URL || DEFAULT_CHARTING_BASE_URL).replace(
    /\/+$/,
    ""
  );
  const API_KEY = process.env.RAILWAY_API_KEY;

  if (!API_KEY) {
    throw new Error("Railway API is not configured (missing RAILWAY_API_KEY).");
  }

  const cleanTrainNo = trainNumber.trim();
  const cleanDate = date.trim();

  const url = `${BASE_URL}/${encodeURIComponent(cleanTrainNo)}?date=${encodeURIComponent(cleanDate)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": API_KEY,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    let errDetail = "";
    try {
      const errBody = await response.json();
      if (errBody && typeof errBody === "object" && "message" in errBody) {
        errDetail = String(errBody.message);
      }
    } catch {
      // ignore json parse error
    }

    if (response.status === 404 || response.status === 502) {
      throw new Error(
        errDetail ||
          `Chart preparation data is not available for Train ${cleanTrainNo} on ${cleanDate}. Please verify the train number and date.`
      );
    }
    throw new Error(
      errDetail || `Charting provider returned status ${response.status} for train ${cleanTrainNo}.`
    );
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("trainNumber" in data) ||
    !("stations" in data) ||
    !Array.isArray((data as TrainChartingResponse).stations)
  ) {
    throw new Error("Invalid charting data format received from external provider.");
  }

  const raw = data as Record<string, unknown>;
  const rawStations = raw.stations as Array<Record<string, unknown>>;

  const stations: TrainChartStation[] = rawStations.map((s) => ({
    stationCode: String(s.stationCode ?? "").trim().toUpperCase(),
    stationName: String(s.stationName ?? "").trim(),
    arrivalTime: String(s.arrivalTime ?? "").trim(),
    departureTime: String(s.departureTime ?? "").trim(),
    day: typeof s.day === "number" ? s.day : Number(s.day) || 1,
    distance: String(s.distance ?? "0.0").trim(),
    chartTimeLocal: typeof s.chartTimeLocal === "string" && s.chartTimeLocal.trim() ? s.chartTimeLocal.trim() : null,
    chartOneDayOffset: typeof s.chartOneDayOffset === "number" ? s.chartOneDayOffset : null,
    chartTwoTimeLocal: typeof s.chartTwoTimeLocal === "string" && s.chartTwoTimeLocal.trim() ? s.chartTwoTimeLocal.trim() : null,
    chartTwoDayOffset: typeof s.chartTwoDayOffset === "number" ? s.chartTwoDayOffset : null,
    chartRemoteStation:
      typeof s.chartRemoteStation === "string" && s.chartRemoteStation.trim()
        ? s.chartRemoteStation.trim().toUpperCase()
        : null,
    firstChartDateTime:
      typeof s.firstChartDateTime === "string" && s.firstChartDateTime.trim()
        ? s.firstChartDateTime.trim()
        : null,
    secondChartDateTime:
      typeof s.secondChartDateTime === "string" && s.secondChartDateTime.trim()
        ? s.secondChartDateTime.trim()
        : null,
  }));

  return {
    trainNumber: String(raw.trainNumber ?? cleanTrainNo).trim(),
    trainName: String(raw.trainName ?? "").trim(),
    journeyDate: String(raw.journeyDate ?? cleanDate).trim(),
    originStation: String(raw.originStation ?? "").trim().toUpperCase(),
    destinationStation: String(raw.destinationStation ?? "").trim().toUpperCase(),
    knownChartCount:
      typeof raw.knownChartCount === "number" ? raw.knownChartCount : stations.length,
    stations,
  };
}

