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
    openGraph: { type: "website", siteName: "asphodelius", url: `/${locale}`, locale: locale === "ru" ? "ru_RU" : "en_US", title: t("title"), description: t("description"), images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "asphodelius" }] },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: ["/opengraph-image.png"] },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Site.meta" });
  return <h1 className={styles.srOnly}>{t("title")}</h1>;
}
