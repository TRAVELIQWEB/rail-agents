
import { MongoClient } from "mongodb";

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("SUCCESS: Connected to local MongoDB!");

    const db = client.db("railagents");
    console.log("Database:", db.databaseName);
    console.log("Collections:", await db.listCollections().toArray());
} catch (error) {
    console.error("CONNECTION FAILED:", error.message);
} finally {
    await client.close();
}
