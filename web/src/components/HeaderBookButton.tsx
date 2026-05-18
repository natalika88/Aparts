"use client";

import { Link, usePathname } from "@/i18n/routing";

/** Куда ведёт кнопка «Бронирование» в шапке. */
function bookHref(pathname: string): string {
  if (pathname === "/" || pathname === "") {
    return "/#booking-search";
  }
  if (pathname.startsWith("/apartments/") && pathname !== "/apartments") {
    return `${pathname}#booking`;
  }
  return "/#booking-search";
}

export function HeaderBookButton({ label }: { label: string }) {
  const pathname = usePathname();

  return (
    <Link
      href={bookHref(pathname)}
      className="btn-premium shrink-0 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium tracking-wide text-[var(--background)] font-[family-name:var(--font-display)] sm:px-5 sm:py-2.5 sm:text-sm"
    >
      {label}
    </Link>
  );
}
