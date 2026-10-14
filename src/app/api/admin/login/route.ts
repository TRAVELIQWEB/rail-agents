// POST /api/admin/login
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminIronSession } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit by IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const limit = checkRateLimit(ip);

  if (!limit.allowed) {
    const waitMin = Math.ceil((limit.resetAt - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${waitMin} minute${waitMin !== 1 ? "s" : ""}.` },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    console.error("ADMIN_EMAIL or ADMIN_PASSWORD_HASH env vars not set.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const emailMatch = email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
  const passwordMatch = await bcrypt.compare(password, adminHash);

  if (!emailMatch || !passwordMatch) {
    return NextResponse.json(
      { error: "Invalid email or password.", remaining: limit.remaining - 1 },
      { status: 401 }
    );
  }

  // Successful login — reset rate limit and create session
  resetRateLimit(ip);
  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  session.admin = { isLoggedIn: true, email: adminEmail };
  await session.save();

  return NextResponse.json({ ok: true });
}

