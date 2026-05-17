import Link from "next/link";
import { signOut } from "@/auth";
import { canAccessContent, canAccessPricing } from "@/lib/auth/roles";
import { roleLabel } from "@/lib/auth/session";
import type { UserRole } from "@/types/next-auth";

type NavItem = { href: string; label: string };

export function AdminShell({
  variant,
  role,
  userName,
  title,
  nav,
  children,
}: {
  variant: "pricing" | "content";
  role: UserRole;
  userName: string;
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const isPricing = variant === "pricing";

  return (
    <div className={`min-h-screen ${isPricing ? "bg-slate-50" : "bg-[var(--background)]"}`}>
      <header
        className={
          isPricing
            ? "border-b border-slate-200 bg-slate-900 text-white"
            : "border-b border-[var(--border)] bg-white"
        }
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p
              className={`text-xs uppercase tracking-widest ${isPricing ? "text-slate-400" : "text-[var(--muted)]"}`}
            >
              {isPricing ? "Операции" : "Редакция"} · Пушкин сон
            </p>
            <h1
              className={`font-[family-name:var(--font-display)] text-xl ${isPricing ? "text-white" : "text-[var(--text)]"}`}
            >
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={isPricing ? "text-slate-300" : "text-[var(--muted)]"}>
              {userName} · {roleLabel(role)}
            </span>
            {canAccessPricing(role) ? (
              <Link
                href="/admin/pricing"
                className={
                  isPricing
                    ? "rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20"
                    : "text-[var(--accent)] underline-offset-4 hover:underline"
                }
              >
                Цены
              </Link>
            ) : null}
            {canAccessContent(role) ? (
              <Link
                href="/admin/content"
                className={
                  !isPricing
                    ? "rounded-lg bg-[var(--surface)] px-3 py-1.5"
                    : "text-slate-300 underline-offset-4 hover:underline"
                }
              >
                Контент
              </Link>
            ) : null}
            <Link href="/" className={isPricing ? "text-slate-300 hover:text-white" : "text-[var(--muted)]"}>
              Сайт
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className={
                  isPricing
                    ? "rounded-lg border border-slate-600 px-3 py-1.5 hover:bg-slate-800"
                    : "rounded-lg border border-[var(--border)] px-3 py-1.5"
                }
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav
        className={
          isPricing
            ? "border-b border-slate-200 bg-white"
            : "border-b border-[var(--border)] bg-[var(--surface)]/40"
        }
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isPricing
                  ? "whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  : "whitespace-nowrap rounded-lg px-3 py-2 text-sm text-[var(--text)] hover:bg-white/80"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
