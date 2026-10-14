// /admin/posts — server component listing all posts
import { requireAdminSession } from "@/lib/session";
import { getAllPosts } from "@/lib/posts";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostsTableClient } from "@/components/admin/PostsTableClient";

export default async function PostsPage() {
  const admin = await requireAdminSession();
  const posts = await getAllPosts();
  const sorted = [...posts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <AdminShell email={admin.email}>
      <PostsTableClient posts={sorted} />
    </AdminShell>
  );
}

