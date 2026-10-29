import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AccountMenus } from "@/components/account-menus";
import { MotionProvider } from "@/components/motion-provider";
import { Navbar } from "@/components/navbar";
import { SettingsProvider } from "@/components/settings/settings-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routing } from "@/i18n/routing";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await getLocale();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir="ltr"
      translate="no"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var raw=localStorage.getItem("webrew.settings");if(raw&&JSON.parse(raw).night)document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="flex h-dvh flex-col overflow-hidden">
        <MotionProvider>
          <TooltipProvider delayDuration={300}>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <SpeedInsights />
              <SettingsProvider>
                <Navbar menus={<AccountMenus />}>{children}</Navbar>
              </SettingsProvider>
            </NextIntlClientProvider>
          </TooltipProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
