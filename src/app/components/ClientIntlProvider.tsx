"use client";

import { IntlProvider } from "next-intl";
import type { ReactNode } from "react";

export function ClientIntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
