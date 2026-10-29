import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId, GridFSBucket } from "mongodb";
import { getAdminIronSession, isAdminUiPreviewEnabled } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { isAdminSessionValid } from "@/lib/admin-session-validation";

export const runtime = "nodejs";

const MAX_SIZE_MB = 5;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function matchesImageMagicBytes(bytes: Buffer, mimeType: string): boolean {
  if (bytes.length < 12) return false;

  switch (mimeType) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/gif":
      return (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61
      );
    case "image/webp":
      return (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    default:
      return false;
  }
}

export async function POST(req: Request) {
  try {
    // Verify that the administrator is logged in.
    const cookieStore = await cookies();
    const session = await getAdminIronSession(cookieStore);
    const isAuthorized =
      isAdminUiPreviewEnabled() || (await isAdminSessionValid(session.admin));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Read the uploaded form.
    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid upload form." },
        { status: 400 }
      );
    }

    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please select a non-empty image file." },
        { status: 400 }
      );
    }

    // Validate the image type.
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPEG, PNG, WebP and GIF images are allowed.",
        },
        { status: 415 }
      );
    }

    // Enforce the 5 MB limit.
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Image must be under ${MAX_SIZE_MB}MB.` },
        { status: 413 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Verify file content magic bytes match declared MIME type.
    if (!matchesImageMagicBytes(bytes, file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid or corrupted image file. Content does not match its file type.",
        },
        { status: 415 }
      );
    }

    // Connect to the RailAgents MongoDB database.
    const client = await clientPromise;
    const db = client.db("railagents");

    const bucket = new GridFSBucket(db, {
      bucketName: "blogImages",
    });

    // Generate a unique GridFS file ID.
    const imageId = new ObjectId();

    const filename = `${imageId.toHexString()}.${EXTENSION_BY_TYPE[file.type]
      }`;

    // Store the image and its metadata in MongoDB GridFS.
    await new Promise<void>((resolve, reject) => {
      const upload = bucket.openUploadStream(filename, {
        id: imageId,
        metadata: {
          originalName: file.name,
          contentType: file.type,
          uploadedBy: session.admin?.email ?? "preview@railagents.local",
          uploadedAt: new Date(),
        },
      });

      upload.once("error", reject);
      upload.once("finish", resolve);
      upload.end(bytes);
    });

    // Return the URL that the editor can save in the blog post.
    return NextResponse.json({
      url: `/api/images/${imageId.toHexString()}`,
    });
  } catch (error) {
    console.error("GridFS image upload failed:", error);

    return NextResponse.json(
      { error: "Image upload failed. Please try again." },
      { status: 500 }
    );
  }
}
