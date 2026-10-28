
import "server-only";

import clientPromise from "@/lib/mongodb";
import type { AdminSession } from "@/lib/auth";

export async function isAdminSessionValid(
    admin: AdminSession | undefined
): Promise<boolean> {
    if (
        !admin?.isLoggedIn ||
        typeof admin.email !== "string" ||
        !Number.isInteger(admin.sessionVersion)
    ) {
        return false;
    }

    try {
        const client = await clientPromise;
        const db = client.db("railagents");

        const record = await db.collection("login").findOne<{
            email: string;
            role: string;
            sessionVersion?: number;
        }>({
            email: admin.email.trim().toLowerCase(),
            role: "admin",
        });

        if (!record) {
            return false;
        }

        return (record.sessionVersion ?? 0) === admin.sessionVersion;
    } catch (error) {
        console.error("Admin session validation failed:", error);
        return false;
    }
}
