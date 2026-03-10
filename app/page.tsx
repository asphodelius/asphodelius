import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

function resolveLocale(acceptLanguage: string | null): AppLocale {
  if (!acceptLanguage) {
    return routing.defaultLocale;
  }

  const requestedLocales = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const requestedLocale of requestedLocales) {
    if (routing.locales.includes(requestedLocale as AppLocale)) {
      return requestedLocale as AppLocale;
    }

    const baseLocale = requestedLocale.split("-")[0];
    if (routing.locales.includes(baseLocale as AppLocale)) {
      return baseLocale as AppLocale;
    }
  }

  return routing.defaultLocale;
}

export default async function Home() {
  const acceptLanguage = (await headers()).get("accept-language");
  redirect(`/${resolveLocale(acceptLanguage)}`);
}
