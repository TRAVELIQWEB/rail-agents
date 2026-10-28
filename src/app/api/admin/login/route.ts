
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminIronSession } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : "unknown";

  const limit = checkRateLimit(ip);

  if (!limit.allowed) {
    const waitMin = Math.max(
      1,
      Math.ceil((limit.resetAt - Date.now()) / 60000)
    );

    return NextResponse.json(
      {
        error: `Too many login attempts. Try again in ${waitMin} minute${waitMin !== 1 ? "s" : ""}.`,
      },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { email, password } = body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  let adminEmail: string | null = null;
  let isAuthenticated = false;
  let sessionVersion = 0;

  try {
    const client = await clientPromise;
    const db = client.db("railagents");

    const admin = await db.collection("login").findOne<{
      email: string;
      passwordHash: string;
      role: string;
      sessionVersion?: number;
    }>({
      email: normalizedEmail,
      role: "admin",
    });

    if (
      admin &&
      typeof admin.passwordHash === "string" &&
      admin.passwordHash.length > 0
    ) {
      isAuthenticated = await bcrypt.compare(
        password,
        admin.passwordHash
      );

      if (isAuthenticated) {
        adminEmail = admin.email;
        sessionVersion = admin.sessionVersion ?? 0;
      }
    }
  } catch (error) {
    console.error("Admin login database verification failed:", error);

    return NextResponse.json(
      {
        error: "Unable to verify login right now. Please try again.",
      },
      { status: 500 }
    );
  }

  if (!isAuthenticated || !adminEmail) {
    return NextResponse.json(
      {
        error: "Invalid email or password.",
        remaining: limit.remaining - 1,
      },
      { status: 401 }
    );
  }

  resetRateLimit(ip);

  const session = await getAdminIronSession(cookieStore);

  session.admin = {
    isLoggedIn: true,
    email: adminEmail,
    sessionVersion,
  };

  await session.save();

  const response = NextResponse.json({ ok: true });

  // Make the private-entry cookie one-time-use after successful login.
  response.cookies.set("railagents_admin_entry", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
