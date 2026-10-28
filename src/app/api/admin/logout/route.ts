
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminIronSession } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  const adminEmail = session.admin?.email;

  if (session.admin?.isLoggedIn && adminEmail) {
    const client = await clientPromise;
    const db = client.db("railagents");

    await db.collection("login").updateOne(
      { email: adminEmail.trim().toLowerCase(), role: "admin" },
      { $inc: { sessionVersion: 1 } }
    );
  }

  session.destroy();

  const response = NextResponse.json({ ok: true });

  response.cookies.set("railagents_admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("railagents_admin_entry", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
