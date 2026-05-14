import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function SiteFooter() {
  const t = await getTranslations("Nav");
  const f = await getTranslations("Footer");
  const home = await getTranslations("Home");

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]/40 py-10 text-sm text-[var(--muted)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:justify-between">
        <div className="space-y-1">
          <p className="font-[family-name:var(--font-display)] text-lg text-[var(--text)]">
            {t("brandName")}
          </p>
          <p className="text-xs tracking-wide text-[var(--muted)]">{home("heroSubtitle")}</p>
          <p>{f("rights")}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-[var(--text)]">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="hover:text-[var(--text)]">
            {t("terms")}
          </Link>
          <Link href="/rules" className="hover:text-[var(--text)]">
            {t("rules")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
