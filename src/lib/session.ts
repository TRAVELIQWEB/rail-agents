// Server-side session auth helper — use in API routes & server components
import { cookies } from "next/headers";
import { getAdminIronSession, isAdminUiPreviewEnabled } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdminSession() {
  if (isAdminUiPreviewEnabled()) {
    return { isLoggedIn: true, email: "preview@railagents.local" };
  }

  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  if (!session.admin?.isLoggedIn) {
    redirect("/admin/login");
  }
  return session.admin;
}

export async function getAdminSession() {
  if (isAdminUiPreviewEnabled()) {
    return { isLoggedIn: true, email: "preview@railagents.local" };
  }

  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  return session.admin ?? null;
}

