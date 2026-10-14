// POST /api/admin/logout
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminIronSession } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  session.destroy();
  return NextResponse.json({ ok: true });
}

