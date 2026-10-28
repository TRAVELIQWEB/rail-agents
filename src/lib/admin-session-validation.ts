import "server-only";

import type { AdminSession } from "@/lib/auth";

export async function isAdminSessionValid(
    admin: AdminSession | undefined
): Promise<boolean> {
    if (
        !admin?.isLoggedIn ||
        typeof admin.email !== "string"
    ) {
        return false;
    }

    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!configuredEmail) {
        return false;
    }

    return admin.email.trim().toLowerCase() === configuredEmail;
}
