import { getTranslations } from "next-intl/server";

export default async function ContactsPage() {
  const t = await getTranslations("Contacts");
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">{t("title")}</h1>
      <p className="text-[var(--muted)]">{t("body")}</p>
    </div>
  );
}
