import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import styles from "../components/site/site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: `/${locale}`, languages: { ru: "/ru", en: "/en" } },
  };
}

// The home page has no story open: the middle column stays empty and the board takes the space.
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Site.meta" });
  return <h1 className={styles.srOnly}>{t("title")}</h1>;
}
