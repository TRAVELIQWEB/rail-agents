import { requireAdminSession } from "@/lib/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlobalVariablesManager } from "@/components/admin/GlobalVariablesManager";

export const dynamic = "force-dynamic";

export default async function GlobalVariablesPage() {
  const admin = await requireAdminSession();
  return (
    <AdminShell email={admin.email}>
      <GlobalVariablesManager />
    </AdminShell>
  );
}
