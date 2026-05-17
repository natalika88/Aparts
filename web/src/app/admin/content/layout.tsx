import { AdminShell } from "@/components/admin/AdminShell";
import { requireContentAccess } from "@/lib/auth/session";

const nav = [
  { href: "/admin/content", label: "Обзор" },
  { href: "/admin/content/groups", label: "Адреса" },
  { href: "/admin/content/properties", label: "Апартаменты" },
];

export default async function ContentAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireContentAccess();

  return (
    <AdminShell
      variant="content"
      role={session.user.role}
      userName={session.user.name ?? session.user.email ?? ""}
      title="Контент и публикация"
      nav={nav}
    >
      {children}
    </AdminShell>
  );
}
