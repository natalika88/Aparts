import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getBrandLogoMarkUrl } from "@/lib/brand-logo";

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const mark = getBrandLogoMarkUrl();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-5 text-[var(--text)] transition hover:opacity-90"
        >
          {mark ? (
            <span className="inline-flex shrink-0 items-center justify-center">
              <Image
                src={mark}
                alt={t("logoAlt")}
                width={400}
                height={124}
                className="h-[4.75rem] w-auto object-contain object-left sm:h-24 md:h-28"
                sizes="(max-width: 640px) 240px, (max-width: 1024px) 300px, 360px"
                priority
              />
            </span>
          ) : null}
          <span className="font-[family-name:var(--font-brand-lockup)] leading-[0.92] text-[var(--text)]">
            <span className="block text-[1.4rem] font-semibold tracking-[-0.02em] sm:text-2xl md:text-[1.75rem]">
              {t("brandWordTop")}
            </span>
            <span className="mt-0.5 block text-center text-[0.58rem] font-semibold uppercase tracking-[0.52em] text-[var(--text)]/85 sm:text-[0.65rem] sm:tracking-[0.58em]">
              {t("brandWordBottom")}
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-end gap-3 text-[13px] font-[family-name:var(--font-display)] tracking-wide text-[var(--muted)] sm:gap-4 sm:text-sm">
            <Link href="/" className="hover:text-[var(--text)]">
              {t("home")}
            </Link>
            <Link href="/apartments" className="hover:text-[var(--text)]">
              {t("apartments")}
            </Link>
            <Link href="/addresses" className="hover:text-[var(--text)]">
              {t("addresses")}
            </Link>
            <Link href="/contacts" className="hover:text-[var(--text)]">
              {t("contacts")}
            </Link>
            <Link href="/rules" className="hover:text-[var(--text)]">
              {t("rules")}
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text)]">
              {t("privacy")}
            </Link>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </nav>
      </div>
    </header>
  );
}
