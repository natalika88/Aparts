"use client";

import { usePathname, useRouter } from "@/i18n/routing";

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const next = currentLocale === "ru" ? "en" : "ru";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--text)] hover:bg-[var(--surface)]"
    >
      {next}
    </button>
  );
}
