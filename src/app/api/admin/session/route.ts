// GET /api/admin/session — check if admin is logged in
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminIronSession } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  if (!session.admin?.isLoggedIn) {
    return NextResponse.json({ isLoggedIn: false }, { status: 401 });
  }
  return NextResponse.json({ isLoggedIn: true, email: session.admin.email });
}

