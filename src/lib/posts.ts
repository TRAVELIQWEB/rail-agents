import { randomUUID } from "crypto";
import type { BlogPost, CreatePostInput, UpdatePostInput } from "@/types/blog";
import clientPromise from "@/lib/mongodb";
import type { Collection } from "mongodb";

let indexPromise: Promise<void> | undefined;

async function getPostsCollection(): Promise<Collection<BlogPost>> {
  const client = await clientPromise;
  return client.db("railagents").collection<BlogPost>("blogs");
}

// Reads/builds never initialize indexes. Explicit creates/updates require slug
// uniqueness; an existing full unique index avoids needing index-write privileges.
async function getWritablePostsCollection(): Promise<Collection<BlogPost>> {
  const collection = await getPostsCollection();
  if (!indexPromise) {
    indexPromise = (async () => {
      const indexes = await collection.listIndexes().toArray().catch((error: unknown) => {
        if (error && typeof error === "object" && "code" in error && error.code === 26) return [];
        throw error;
      });
      const hasUniqueSlug = indexes.some((index) => index.unique === true &&
        Object.keys(index.key).length === 1 && [1, -1].includes(index.key.slug) &&
        !index.sparse && !index.partialFilterExpression);
      if (!hasUniqueSlug) await collection.createIndex({ slug: 1 }, { unique: true });
    })().catch((error: unknown) => {
      indexPromise = undefined;
      throw error;
    });
  }
  await indexPromise;
  return collection;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const collection = await getPostsCollection();
  return collection.find({}, { projection: { _id: 0 } }).toArray();
}

export function isPostPubliclyVisible(post: BlogPost, now = new Date()): boolean {
  return (
    post.status === "published" ||
    (post.status === "scheduled" &&
      Boolean(post.scheduledAt) &&
      new Date(post.scheduledAt!) <= now)
  );
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const all = await getAllPosts();
  const now = new Date();

  return all
    .filter((post) => isPostPubliclyVisible(post, now))
    .sort((a, b) => {
      const aDate = a.publishedAt ?? a.scheduledAt ?? a.createdAt;
      const bDate = b.publishedAt ?? b.scheduledAt ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const collection = await getPostsCollection();
  return collection.findOne({ id }, { projection: { _id: 0 } });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const collection = await getPostsCollection();
  return collection.findOne({ slug }, { projection: { _id: 0 } });
}

export async function createPost(input: CreatePostInput): Promise<BlogPost> {
  const collection = await getWritablePostsCollection();

  if (await collection.findOne({ slug: input.slug })) {
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

  await collection.insertOne(post);
  return post;
}

export async function updatePost(
  id: string,
  input: UpdatePostInput
): Promise<BlogPost> {
  const collection = await getWritablePostsCollection();
  const existing = await collection.findOne({ id });

  if (!existing) {
    throw new Error("Post not found.");
  }

  if (
    input.slug &&
    (await collection.findOne({ slug: input.slug, id: { $ne: id } }))
  ) {
    throw new Error(`A post with slug "${input.slug}" already exists.`);
  }

  const now = new Date().toISOString();

  const updated: BlogPost = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now,
    publishedAt:
      input.publishedAt !== undefined
        ? input.publishedAt
        : input.status === "published" && !existing.publishedAt
        ? now
        : existing.publishedAt,
  };

  await collection.replaceOne({ id }, updated);
  return updated;
}

export async function deletePost(id: string): Promise<void> {
  const collection = await getPostsCollection();
  const result = await collection.deleteOne({ id });

  if (result.deletedCount === 0) {
    throw new Error("Post not found.");
  }
}

export async function slugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const collection = await getPostsCollection();
  const filter = excludeId ? { slug, id: { $ne: excludeId } } : { slug };
  return (await collection.findOne(filter)) !== null;
}
