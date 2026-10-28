
// GET /api/admin/session — check if admin is logged in
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminIronSession, isAdminUiPreviewEnabled } from "@/lib/auth";
import { isAdminSessionValid } from "@/lib/admin-session-validation";

export async function GET() {
  if (isAdminUiPreviewEnabled()) {
    return NextResponse.json({
      isLoggedIn: true,
      email: "preview@railagents.local",
    });
  }

  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);

  if (!(await isAdminSessionValid(session.admin))) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }

  return NextResponse.json({
    isLoggedIn: true,
    email: session.admin!.email,
  });
}
