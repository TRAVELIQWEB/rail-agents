// /admin/dashboard — server component with auth guard
import { requireAdminSession } from "@/lib/session";
import { getAllPosts } from "@/lib/posts";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardClient } from "@/components/admin/DashboardClient";

export default async function DashboardPage() {
  const admin = await requireAdminSession();
  const posts = await getAllPosts();

  const totalPosts = posts.length;
  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduled = posts.filter((p) => p.status === "scheduled").length;
  const recent = [...posts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <AdminShell email={admin.email}>
      <DashboardClient
        stats={{ totalPosts, published, drafts, scheduled }}
        recentPosts={recent}
      />
    </AdminShell>
  );
}

