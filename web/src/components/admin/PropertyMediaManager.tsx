"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  deletePropertyMedia,
  movePropertyMedia,
  setPropertyCover,
  uploadPropertyPhotos,
} from "@/app/admin/content/media-actions";

export type MediaItem = {
  id: string;
  filePath: string | null;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
};

export function PropertyMediaManager({
  propertyId,
  items,
  propertyName,
}: {
  propertyId: string;
  items: MediaItem[];
  propertyName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      setMessage(null);
      try {
        await action();
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Ошибка");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--text)]">Фотографии</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">JPEG, PNG, WebP или GIF до 8 МБ</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (!files?.length) return;
              const fd = new FormData();
              for (const f of files) fd.append("files", f);
              run(async () => {
                const res = await uploadPropertyPhotos(propertyId, fd);
                setMessage(`Загружено: ${res.uploaded}`);
              });
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm text-white disabled:opacity-50"
          >
            Загрузить фото
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 text-sm text-[var(--accent)]">{message}</p> : null}

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Пока нет фото — загрузите первое изображение.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]/30"
            >
              <div className="relative aspect-[4/3] bg-[var(--surface)]">
                {item.filePath ? (
                  <Image
                    src={item.filePath}
                    alt={item.altText ?? propertyName}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                ) : null}
                {item.isCover ? (
                  <span className="absolute left-2 top-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-white">
                    Обложка
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 p-3 text-xs">
                {!item.isCover ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setPropertyCover(propertyId, item.id))}
                    className="rounded-lg border px-2 py-1"
                  >
                    На обложку
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={pending || index === 0}
                  onClick={() => run(() => movePropertyMedia(propertyId, item.id, "up"))}
                  className="rounded-lg border px-2 py-1"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={pending || index === items.length - 1}
                  onClick={() => run(() => movePropertyMedia(propertyId, item.id, "down"))}
                  className="rounded-lg border px-2 py-1"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Удалить фото?")) return;
                    run(() => deletePropertyMedia(propertyId, item.id));
                  }}
                  className="rounded-lg border border-red-200 px-2 py-1 text-red-700"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
