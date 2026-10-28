
// Server-side session auth helper — use in API routes & server components
import { cookies } from "next/headers";
import { getAdminIronSession, isAdminUiPreviewEnabled } from "@/lib/auth";
import { isAdminSessionValid } from "@/lib/admin-session-validation";
import { redirect } from "next/navigation";

export async function requireAdminSession() {
  if (isAdminUiPreviewEnabled()) {
    return { isLoggedIn: true, email: "preview@railagents.local" };
  }

  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  const admin = session.admin;

  if (!(await isAdminSessionValid(admin))) {
    redirect("/admin/login");
  }

  return admin!;
}

export async function getAdminSession() {
  if (isAdminUiPreviewEnabled()) {
    return { isLoggedIn: true, email: "preview@railagents.local" };
  }

  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);

  if (!(await isAdminSessionValid(session.admin))) {
    return null;
  }

  return session.admin!;
}
