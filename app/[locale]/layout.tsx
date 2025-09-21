import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This is correct and necessary.
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'hi' }];
}

export const metadata = {
  title: "Kala AI",
  description: "AI-Powered Marketplace Assistant for Local Artisans",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // This pattern is correct for Next.js 15.
  const { locale } = await params;

  // THIS IS THE CRITICAL CHANGE:
  // We explicitly pass the resolved `locale` to `getMessages`.
  // This removes any ambiguity and ensures the correct message file is loaded.
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}