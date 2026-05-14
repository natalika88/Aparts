import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function BookingSuccessPage() {
  const t = await getTranslations("Apartments");
  const loc = await getTranslations("Home");
  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">
        {loc("heroTitle")}
      </h1>
      <p className="text-[var(--muted)]">
        {t("details")} — заявка принята. Мы свяжемся с вами для подтверждения и согласования оплаты.
      </p>
      <Link href="/apartments" className="inline-block rounded-full border border-[var(--border)] px-6 py-3 text-sm hover:bg-[var(--surface)]">
        {t("title")}
      </Link>
    </div>
  );
}
