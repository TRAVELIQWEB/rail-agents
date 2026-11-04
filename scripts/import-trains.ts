import { loadEnvConfig } from "@next/env";
import path from "path";

// Load Next.js environment variables from .env.local
loadEnvConfig(path.resolve(process.cwd()));

async function runImport() {
  console.log("Starting Railway Train List MongoDB Import...");
  const { syncTrainsToDatabase } = await import("../src/lib/trains");

  const startTime = Date.now();
  try {
    const stats = await syncTrainsToDatabase();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("=== TRAIN LIST IMPORT COMPLETE ===");
    console.log(`Duration: ${duration}s`);
    console.log(`Total Fetched from Provider: ${stats.totalFetched}`);
    console.log(`Inserted: ${stats.inserted}`);
    console.log(`Updated / Unchanged: ${stats.updated}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Total in Database: ${stats.totalInDb}`);
    process.exit(0);
  } catch (error) {
    console.error("TRAIN LIST IMPORT FAILED:", error);
    process.exit(1);
  }
}

runImport();

