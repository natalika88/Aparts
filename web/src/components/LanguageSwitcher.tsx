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
      className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--text)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:bg-[var(--surface)] hover:shadow-sm"
    >
      {next}
    </button>
  );
}
