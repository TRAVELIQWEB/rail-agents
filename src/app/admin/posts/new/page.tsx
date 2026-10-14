// /admin/posts/new — create new post
import { requireAdminSession } from "@/lib/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostForm } from "@/components/admin/PostForm";
import { getAllPosts } from "@/lib/posts";

export default async function NewPostPage() {
  const admin = await requireAdminSession();
  const posts = await getAllPosts();
  return (
    <AdminShell email={admin.email}>
      <PostForm mode="create" availablePosts={posts.map(({ id, title, slug, status, author }) => ({ id, title, slug, status, author }))} />
    </AdminShell>
  );
}

