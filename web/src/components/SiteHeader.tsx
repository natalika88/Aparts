import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { HeaderBookButton } from "@/components/HeaderBookButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteHeaderShell } from "@/components/SiteHeaderShell";
import { getBrandLogoMarkUrl } from "@/lib/brand-logo";

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const mark = getBrandLogoMarkUrl();

  return (
    <SiteHeaderShell>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-5 text-[var(--text)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-90"
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
            <Link href="/" className="nav-link">
              {t("home")}
            </Link>
            <Link href="/apartments" className="nav-link">
              {t("apartments")}
            </Link>
            <Link href="/addresses" className="nav-link">
              {t("addresses")}
            </Link>
            <Link href="/contacts" className="nav-link">
              {t("contacts")}
            </Link>
            <Link href="/admin/login" className="nav-link opacity-70">
              {t("admin")}
            </Link>
          </div>
          <HeaderBookButton label={t("book")} />
          <LanguageSwitcher currentLocale={locale} />
        </nav>
      </div>
    </SiteHeaderShell>
  );
}
