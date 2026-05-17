import type { UserRole } from "@/types/next-auth";

export function canAccessPricing(role: UserRole): boolean {
  return role === "SUPERADMIN" || role === "PRICE_ADMIN";
}

export function canAccessContent(role: UserRole): boolean {
  return role === "SUPERADMIN" || role === "CONTENT_ADMIN";
}

export function defaultAdminHome(role: UserRole): string {
  if (role === "CONTENT_ADMIN") return "/admin/content";
  if (role === "PRICE_ADMIN") return "/admin/pricing";
  return "/admin/pricing";
}
