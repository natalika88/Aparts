import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Cormorant_Garamond, Manrope, Playfair_Display } from "next/font/google";
import { routing } from "@/i18n/routing";
import { MainShell } from "@/components/MainShell";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
});

/** Связка «Пушкин / СОН» в шапке — ближе к «книжной» антикве с макета. */
const brandLockup = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-brand-lockup",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div
        className={`${manrope.variable} ${playfair.variable} ${brandLockup.variable} flex min-h-screen flex-col font-[family-name:var(--font-manrope)]`}
        style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
      >
        <div className="ambient-bg" aria-hidden />
        <SiteHeader locale={locale} />
        <MainShell>{children}</MainShell>
        <SiteFooter />
      </div>
    </NextIntlClientProvider>
  );
}
