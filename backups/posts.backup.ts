// Blog post persistence layer
// Dev: reads/writes a local JSON file at data/posts.json
// Prod: reads/writes via Vercel Blob

import { randomUUID } from "crypto";
import type { BlogPost, CreatePostInput, UpdatePostInput } from "@/types/blog";

// ─── local dev file path ───────────────────────────────────────
import path from "path";
import fs from "fs";

const LOCAL_FILE = path.join(process.cwd(), "data", "posts.json");

function readLocalPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return [];
    const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
    return JSON.parse(raw) as BlogPost[];
  } catch {
    return [];
  }
}

function writeLocalPosts(posts: BlogPost[]) {
  const dir = path.dirname(LOCAL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

// ─── Vercel Blob helpers ────────────────────────────────────────
const BLOB_PATHNAME = "railagents/posts.json";

async function readBlobPosts(): Promise<BlogPost[]> {
  const { list, head } = await import("@vercel/blob");
  try {
    const blobs = await list({ prefix: BLOB_PATHNAME });
    const match = blobs.blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!match) return [];
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as BlogPost[];
  } catch {
    return [];
  }
}

async function writeBlobPosts(posts: BlogPost[]) {
  const { put } = await import("@vercel/blob");
  await put(BLOB_PATHNAME, JSON.stringify(posts), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

// ─── Public API ────────────────────────────────────────────────

function isProduction() {
  return (
    process.env.NODE_ENV === "production" &&
    !!process.env.BLOB_READ_WRITE_TOKEN
  );
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (isProduction()) return readBlobPosts();
  return readLocalPosts();
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const all = await getAllPosts();
  const now = new Date();
  return all
    .filter(
      (p) =>
        p.status === "published" ||
        (p.status === "scheduled" &&
          p.scheduledAt &&
          new Date(p.scheduledAt) <= now)
    )
    .sort((a, b) => {
      const aDate = a.publishedAt ?? a.scheduledAt ?? a.createdAt;
      const bDate = b.publishedAt ?? b.scheduledAt ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const all = await getAllPosts();
  return all.find((p) => p.id === id) ?? null;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = await getAllPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function createPost(input: CreatePostInput): Promise<BlogPost> {
  const all = await getAllPosts();

  // Unique slug check
  if (all.some((p) => p.slug === input.slug)) {
    throw new Error(`A post with slug "${input.slug}" already exists.`);
  }

  const now = new Date().toISOString();
  const post: BlogPost = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    publishedAt:
      input.status === "published" ? (input.publishedAt ?? now) : input.publishedAt,
  };

  all.push(post);
  if (isProduction()) await writeBlobPosts(all);
  else writeLocalPosts(all);

  return post;
}

export async function updatePost(
  id: string,
  input: UpdatePostInput
): Promise<BlogPost> {
  const all = await getAllPosts();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Post not found.");

  // Slug uniqueness check (allow same slug for same post)
  if (input.slug && all.some((p) => p.slug === input.slug && p.id !== id)) {
    throw new Error(`A post with slug "${input.slug}" already exists.`);
  }

  const existing = all[idx];
  const now = new Date().toISOString();

  const updated: BlogPost = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now,
    // Set publishedAt when transitioning to published
    publishedAt:
      input.status === "published" && !existing.publishedAt
        ? now
        : (input.publishedAt ?? existing.publishedAt),
  };

  all[idx] = updated;
  if (isProduction()) await writeBlobPosts(all);
  else writeLocalPosts(all);

  return updated;
}

export async function deletePost(id: string): Promise<void> {
  const all = await getAllPosts();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length === all.length) throw new Error("Post not found.");
  if (isProduction()) await writeBlobPosts(filtered);
  else writeLocalPosts(filtered);
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const all = await getAllPosts();
  return all.some((p) => p.slug === slug && p.id !== excludeId);
}

