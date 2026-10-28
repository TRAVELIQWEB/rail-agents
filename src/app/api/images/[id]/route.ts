
import { NextResponse } from "next/server";
import { ObjectId, GridFSBucket } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    _req: Request,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

        if (!/^[a-f\d]{24}$/i.test(id)) {
            return NextResponse.json(
                { error: "Invalid image ID." },
                { status: 400 }
            );
        }

        const imageId = new ObjectId(id);

        const client = await clientPromise;
        const db = client.db("railagents");

        const bucket = new GridFSBucket(db, {
            bucketName: "blogImages",
        });

        const image = await db
            .collection("blogImages.files")
            .findOne({ _id: imageId });

        if (!image) {
            return NextResponse.json(
                { error: "Image not found." },
                { status: 404 }
            );
        }

        const contentType = image.metadata?.contentType;

        if (
            typeof contentType !== "string" ||
            !ALLOWED_TYPES.has(contentType)
        ) {
            return NextResponse.json(
                { error: "Unsupported image type." },
                { status: 415 }
            );
        }

        const chunks: Buffer[] = [];
        const download = bucket.openDownloadStream(imageId);

        for await (const chunk of download) {
            chunks.push(Buffer.from(chunk));
        }

        const buffer = Buffer.concat(chunks);

        return new Response(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Length": String(buffer.length),
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        console.error("GridFS image retrieval failed:", error);

        return NextResponse.json(
            { error: "Unable to retrieve image." },
            { status: 500 }
        );
    }
}
