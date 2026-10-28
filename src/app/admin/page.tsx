
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminIronSession, isAdminUiPreviewEnabled } from "@/lib/auth";
import { isAdminSessionValid } from "@/lib/admin-session-validation";

export default async function AdminRootPage() {
  if (isAdminUiPreviewEnabled()) {
    redirect("/admin/dashboard");
  }

  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);

  if (await isAdminSessionValid(session.admin)) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}
