
import { MongoClient } from "mongodb";
import fs from "node:fs";

const uri = "mongodb://127.0.0.1:27017";
const posts = JSON.parse(fs.readFileSync("data/posts.json", "utf8"));
const client = new MongoClient(uri);

try {
    await client.connect();

    const collection = client.db("railagents").collection("blogs");
    const count = await collection.countDocuments();

    if (count !== 0) {
        throw new Error(
            `Import stopped safely: blogs collection already has ${count} documents.`
        );
    }

    if (!Array.isArray(posts) || posts.length === 0) {
        throw new Error("No blog posts found in data/posts.json.");
    }

    const result = await collection.insertMany(posts);

    console.log(`Successfully imported ${result.insertedCount} blog posts.`);
    console.log("Existing post IDs, titles, and slugs were preserved.");
} catch (error) {
    console.error("Import failed:", error.message);
    process.exitCode = 1;
} finally {
    await client.close();
}
