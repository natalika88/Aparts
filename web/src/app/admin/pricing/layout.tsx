import { AdminShell } from "@/components/admin/AdminShell";
import { requirePricingAccess } from "@/lib/auth/session";

const nav = [
  { href: "/admin/pricing", label: "Обзор" },
  { href: "/admin/pricing/bookings", label: "Заявки" },
  { href: "/admin/pricing/properties", label: "Объекты и календарь" },
];

export default async function PricingAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePricingAccess();

  return (
    <AdminShell
      variant="pricing"
      role={session.user.role}
      userName={session.user.name ?? session.user.email ?? ""}
      title="Цены и бронирования"
      nav={nav}
    >
      {children}
    </AdminShell>
  );
}
