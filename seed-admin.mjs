
import nextEnv from "@next/env";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
    throw new Error(
        "ADMIN_EMAIL or ADMIN_PASSWORD is missing from the environment."
    );
}

const uri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/railagents";

const client = new MongoClient(uri);

try {
    await client.connect();

    const db = client.db("railagents");
    const loginCollection = db.collection("login");

    const existing = await loginCollection.findOne({ email });

    if (!existing) {
        throw new Error(
            `No admin record found for ${email}. No changes were made.`
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await loginCollection.updateOne(
        { email },
        {
            $set: {
                passwordHash,
                role: "admin",
                updatedAt: new Date(),
            },
        }
    );

    if (result.matchedCount !== 1) {
        throw new Error("Admin record was not updated.");
    }

    console.log("Admin password reset successfully.");
    console.log("Email:", email);
    console.log("Password stored as a bcrypt hash, not plain text.");
} finally {
    await client.close();
}
