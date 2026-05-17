import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS: Record<string, string> = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликован",
  HIDDEN: "Скрыт",
};

export default async function ContentPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: [{ group: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { group: { select: { name: true } } },
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--surface)]/50 text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Код</th>
            <th className="px-4 py-3 font-medium">Название</th>
            <th className="px-4 py-3 font-medium">Группа</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {properties.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-mono text-xs">{p.internalCode}</td>
              <td className="px-4 py-3 font-medium">{p.publicName}</td>
              <td className="px-4 py-3 text-[var(--muted)]">{p.group.name}</td>
              <td className="px-4 py-3">{STATUS[p.status] ?? p.status}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/content/properties/${p.id}`} className="text-[var(--accent)] underline">
                  Редактировать
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
