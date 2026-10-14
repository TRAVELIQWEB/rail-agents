// Run: node scripts/hash-password.mjs <your-password>
// This outputs the bcrypt hash to add as ADMIN_PASSWORD_HASH in .env.local

import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <your-password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\n✅ Password hash generated. Add this to .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);

