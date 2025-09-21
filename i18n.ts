// i18n.ts (root)
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'hi'];

function isValidLocale(locale: any): locale is string {
  return locales.includes(locale);
}

export default getRequestConfig(async ({ params }) => {
  const locale = params?.locale as string | undefined;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
