"use client";

import { Link } from "@/i18n/routing";

export function HeaderBookButton({ label }: { label: string }) {
  return (
    <Link
      href="/apartments"
      className="btn-premium shrink-0 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium tracking-wide text-[var(--background)] font-[family-name:var(--font-display)] sm:px-5 sm:py-2.5 sm:text-sm"
    >
      {label}
    </Link>
  );
}
