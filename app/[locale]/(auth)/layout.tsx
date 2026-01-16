// src/app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { i18n } from '@/lib/i18n-config';
import '../globals.css';

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Vérifier que la locale est valide
  if (!i18n.locales.includes(locale as any)) {
    notFound();
  }

  // Charger les messages de traduction
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <title>Quiz Islamic - Test Your Islamic Knowledge</title>
        <meta name="description" content="Test your Islamic knowledge with our multilingual quiz app" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
