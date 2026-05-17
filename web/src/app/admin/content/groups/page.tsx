import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ContentGroupsPage() {
  const groups = await prisma.propertyGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { properties: true } } },
  });

  return (
    <ul className="space-y-3">
      {groups.map((g) => (
        <li key={g.id} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white p-5">
          <div>
            <p className="font-medium text-[var(--text)]">{g.name}</p>
            <p className="text-sm text-[var(--muted)]">{g.fullAddress}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{g._count.properties} апартаментов</p>
          </div>
          <Link href={`/admin/content/groups/${g.id}`} className="text-sm text-[var(--accent)] underline">
            Редактировать
          </Link>
        </li>
      ))}
    </ul>
  );
}
