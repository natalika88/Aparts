import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("Legal");
  return (
    <div className="prose prose-neutral max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">{t("termsTitle")}</h1>
      <p className="mt-6 whitespace-pre-wrap text-[var(--muted)]">{t("termsBody")}</p>
    </div>
  );
}
