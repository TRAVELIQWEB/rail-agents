// POST /api/upload — upload an image to Vercel Blob (admin only)
// Returns { url } on success
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminIronSession } from "@/lib/auth";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  if (!session.admin?.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF images are allowed." }, { status: 415 });
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Image must be under ${MAX_SIZE_MB}MB.` }, { status: 413 });
  }

  // In production with Blob configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `railagents/blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  }

  // Dev fallback: save to /public/uploads/
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}

