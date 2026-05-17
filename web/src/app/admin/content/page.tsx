import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ContentDashboardPage() {
  const [groups, draftCount, publishedCount] = await Promise.all([
    prisma.propertyGroup.count(),
    prisma.property.count({ where: { status: "DRAFT" } }),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <p className="text-sm text-[var(--muted)]">Адреса / группы</p>
        <p className="mt-2 text-3xl font-[family-name:var(--font-display)]">{groups}</p>
        <Link href="/admin/content/groups" className="mt-3 inline-block text-sm text-[var(--accent)] underline">
          Редактировать →
        </Link>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <p className="text-sm text-[var(--muted)]">Опубликовано</p>
        <p className="mt-2 text-3xl font-[family-name:var(--font-display)]">{publishedCount}</p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <p className="text-sm text-[var(--muted)]">Черновики</p>
        <p className="mt-2 text-3xl font-[family-name:var(--font-display)]">{draftCount}</p>
        <Link href="/admin/content/properties" className="mt-3 inline-block text-sm text-[var(--accent)] underline">
          Апартаменты →
        </Link>
      </div>
    </div>
  );
}
