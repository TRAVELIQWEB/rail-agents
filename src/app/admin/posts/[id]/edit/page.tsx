// /admin/posts/[id]/edit — edit existing post
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { getAllPosts } from "@/lib/posts";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostForm } from "@/components/admin/PostForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const admin = await requireAdminSession();
  const { id } = await params;
  const posts = await getAllPosts();
  const post = posts.find((item) => item.id === id);
  if (!post) notFound();

  return (
    <AdminShell email={admin.email}>
      <PostForm mode="edit" post={post} availablePosts={posts.map(({ id: postId, title, slug, status, author }) => ({ id: postId, title, slug, status, author }))} />
    </AdminShell>
  );
}

