
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WhatsAppSettingsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  redirect("/admin/global-variables");
}
