import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePropertyContent } from "../../actions";

export default async function ContentPropertyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { group: true },
  });
  if (!property) notFound();

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/content/properties" className="text-sm text-[var(--muted)] underline">
        ← Апартаменты
      </Link>
      <p className="text-sm text-[var(--muted)]">
        {property.internalCode} · {property.group.name} — здесь только контент, без цен и календаря
      </p>
      <form
        action={updatePropertyContent.bind(null, id)}
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-6"
      >
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Публичное название</span>
          <input name="publicName" defaultValue={property.publicName} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Название (EN)</span>
          <input name="publicNameEn" defaultValue={property.publicNameEn ?? ""} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Краткое описание</span>
          <textarea name="shortDescription" defaultValue={property.shortDescription} required rows={2} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Полное описание</span>
          <textarea name="fullDescription" defaultValue={property.fullDescription} required rows={8} className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Преимущества (по строке)</span>
          <textarea name="advantages" defaultValue={property.advantages ?? ""} rows={5} className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Правила</span>
          <textarea name="rules" defaultValue={property.rules ?? ""} rows={4} className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Статус</span>
          <select name="status" defaultValue={property.status} className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="DRAFT">Черновик</option>
            <option value="PUBLISHED">Опубликован</option>
            <option value="HIDDEN">Скрыт</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={property.isFeatured} className="h-4 w-4" />
          <span>Избранное на главной</span>
        </label>
        <button type="submit" className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm text-white">
          Сохранить
        </button>
      </form>
    </div>
  );
}
