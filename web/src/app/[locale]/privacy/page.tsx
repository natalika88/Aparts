import { getTranslations } from "next-intl/server";
import { PersonalDataNotice } from "@/components/personal-data/PersonalDataNotice";

export default async function PrivacyPage() {
  const t = await getTranslations("Legal");
  const apt = await getTranslations("Apartments");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">
          {t("privacyTitle")}
        </h1>
        <p className="mt-6 whitespace-pre-wrap leading-relaxed text-[var(--muted)]">
          {t("privacyBody")}
        </p>
      </div>

      <PersonalDataNotice
        labels={{
          title: apt("personalData.title"),
          protected: apt("personalData.protected"),
          noAi: apt("personalData.noAi"),
          mergeOnly: apt("personalData.mergeOnly"),
          consent: apt("personalData.consent"),
        }}
      />

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">
          {t("privacyAiTitle")}
        </h2>
        <p className="mt-3 leading-relaxed text-[var(--muted)]">{t("privacyAiBody")}</p>
      </section>
    </div>
  );
}
