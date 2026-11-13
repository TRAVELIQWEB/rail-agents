import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const apply = args.includes("--apply");
const confirmedDevelopment = args.includes("--confirm-local-development");
const fixtureIndex = args.indexOf("--fixture");
const fixturePath = fixtureIndex < 0 ? null : args[fixtureIndex + 1];
const allowed = new Set(["--dry-run", "--apply", "--confirm-local-development", "--fixture", ...(fixturePath ? [fixturePath] : [])]);
if (dryRun === apply || args.some((arg) => !allowed.has(arg)) || (fixtureIndex >= 0 && (!fixturePath || !dryRun))) {
  console.error("Usage: node scripts/migrate-whatsapp-settings.mjs --dry-run [--fixture path.json]\nLive writes require --apply --confirm-local-development, after environment confirmation, conflict review and approval.");
  process.exit(1);
}

// Compile existing TS modules for this trusted standalone CLI, without changing
// app module loading or importing Next.js server-only guards into a Node process.
const modules = new Map();
function loadTs(filename) {
  filename = path.resolve(filename);
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  const nativeRequire = createRequire(filename);
  compiledModule.require = (specifier) => {
    if (specifier === "server-only") return {};
    const target = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2)) : specifier.startsWith(".") ? path.resolve(path.dirname(filename), specifier) : null;
    if (target && fs.existsSync(target + ".ts")) return loadTs(target + ".ts");
    return nativeRequire(specifier);
  };
  modules.set(filename, compiledModule);
  compiledModule._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
  }).outputText, filename);
  return compiledModule.exports;
}

let client;
try {
  if (fixturePath) {
    const fixture = JSON.parse(fs.readFileSync(path.resolve(fixturePath), "utf8"));
    client = { db: () => ({ command: async () => ({ maxWireVersion: 28 }), collection: (name) => name === "site_settings"
      ? { findOne: async () => fixture.legacy ?? null }
      : { find: () => ({ toArray: async () => fixture.variables ?? [] }) } }) };
  } else {
    const { default: nextEnv } = await import("@next/env");
    const environment = nextEnv.loadEnvConfig(root);
    if (!process.env.MONGODB_URI?.trim()) throw new Error("Explicit MONGODB_URI configuration is required for migration.");
    const uri = process.env.MONGODB_URI;
    const hosts = uri.slice(uri.indexOf("://") + 3).split("/")[0].split("@").pop().split(",");
    const localConnection = hosts.every((host) => /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host));
    console.log(JSON.stringify({ database: "railagents", environmentFiles: environment.loadedEnvFiles.map((file) => file.path), nodeEnv: process.env.NODE_ENV ?? "unset", connectionLocation: localConnection ? "loopback" : "remote", environment: confirmedDevelopment ? "explicitly confirmed local/development" : "unconfirmed" }));
    if (apply && (!confirmedDevelopment || process.env.NODE_ENV === "production")) {
      throw new Error("Apply requires explicit local/development environment confirmation and is prohibited with NODE_ENV=production.");
    }
    // Reuse the application's connection module; never construct another MongoClient.
    client = await loadTs(path.join(root, "src/lib/mongodb.ts")).default;
  }
  const { migrateWhatsAppSettings } = loadTs(path.join(root, "src/lib/migrations/whatsapp-global-variables.ts"));
  const report = await migrateWhatsAppSettings(client, { dryRun });
  console.log(JSON.stringify(report, null, 2)); // Key/actions only; never contact values or credentials.
  if (!report.ready) process.exitCode = 2;
} catch {
  console.error("Migration stopped. Check environment confirmation, connection and index constraints. Rerun dry-run to inspect any partial progress; never overwrite conflicts. Legacy records are never modified.");
  process.exitCode = 1;
} finally {
  if (!fixturePath && client) await client.close();
}
