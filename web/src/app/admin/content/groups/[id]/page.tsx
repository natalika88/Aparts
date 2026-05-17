import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePropertyGroup } from "../../actions";

export default async function ContentGroupEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await prisma.propertyGroup.findUnique({ where: { id } });
  if (!group) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/admin/content/groups" className="text-sm text-[var(--muted)] underline">
        ← Адреса
      </Link>
      <form action={updatePropertyGroup.bind(null, id)} className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h1 className="font-[family-name:var(--font-display)] text-xl">{group.name}</h1>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Название</span>
          <input name="name" defaultValue={group.name} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Краткое описание</span>
          <textarea
            name="shortDescription"
            defaultValue={group.shortDescription}
            required
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Полное описание</span>
          <textarea
            name="fullDescription"
            defaultValue={group.fullDescription ?? ""}
            rows={6}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm text-white">
          Сохранить
        </button>
      </form>
    </div>
  );
}
