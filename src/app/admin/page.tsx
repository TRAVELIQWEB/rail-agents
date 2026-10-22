import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminIronSession } from "@/lib/auth";

export default async function AdminRootPage() {
  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);

  if (session.admin?.isLoggedIn) {
    redirect("/admin/dashboard");
  } else {
    redirect("/");
  }
}
