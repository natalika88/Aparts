import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/next-auth";

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  return session;
}

export async function requirePricingAccess() {
  const session = await requireAdminSession();
  const role = session.user.role;
  if (role !== "SUPERADMIN" && role !== "PRICE_ADMIN") {
    redirect("/admin/content");
  }
  return session;
}

export async function requireContentAccess() {
  const session = await requireAdminSession();
  const role = session.user.role;
  if (role !== "SUPERADMIN" && role !== "CONTENT_ADMIN") {
    redirect("/admin/pricing");
  }
  return session;
}

export function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    SUPERADMIN: "Суперадмин",
    PRICE_ADMIN: "Цены и бронирования",
    CONTENT_ADMIN: "Контент",
  };
  return map[role];
}
