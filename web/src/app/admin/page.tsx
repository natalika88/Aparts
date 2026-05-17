import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { defaultAdminHome } from "@/lib/auth/roles";

export default async function AdminIndexPage() {
  const session = await auth();
  if (!session?.user?.role) redirect("/admin/login");
  redirect(defaultAdminHome(session.user.role));
}
