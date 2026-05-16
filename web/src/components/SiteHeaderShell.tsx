"use client";

import { useEffect, useState, type ReactNode } from "react";

export function SiteHeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-header sticky top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled
          ? "border-[var(--border)] bg-[var(--surface)]/88 shadow-[0_8px_32px_-12px_rgba(47,45,43,0.12)] backdrop-blur-xl"
          : "border-transparent bg-[var(--surface)]/40 backdrop-blur-md"
      } border-b`}
    >
      {children}
    </header>
  );
}
