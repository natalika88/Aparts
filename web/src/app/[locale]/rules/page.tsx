import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import {
  COMPACT_PROPERTY_RULES_EN,
  COMPACT_PROPERTY_RULES_RU,
  parsePropertyRulesSections,
} from "@/lib/property-rules";

export default async function RulesPage() {
  const t = await getTranslations("Legal");
  const locale = await getLocale();
  const sections = parsePropertyRulesSections(
    locale === "en" ? COMPACT_PROPERTY_RULES_EN : COMPACT_PROPERTY_RULES_RU,
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">{t("rulesTitle")}</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        {locale === "en"
          ? "These conditions apply to all Pushkin Son apartments. Your listing may include a few extra notes."
          : "Общие условия для всех апартаментов «Пушкин сон». В карточке объекта могут быть уточнения."}
      </p>
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-[var(--text)]">{section.title}</h2>
            <ul className="mt-3 space-y-2.5">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-[var(--muted)] leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
