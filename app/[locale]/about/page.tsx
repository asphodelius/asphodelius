import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Story } from "../../components/site/Story";
import styles from "../../components/site/site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

const stack = ["core", "ui", "state", "tools"] as const;
const experience = ["goodPeople", "aston"] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site.meta" });
  return {
    title: t("aboutTitle"),
    description: t("description"),
    alternates: { canonical: `/${locale}/about`, languages: { ru: "/ru/about", en: "/en/about" } },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Site.about" });

  return (
    <Story title={t("title")}>
      <p>{t("profile")}</p>

      <section className={styles.block}>
        <h2>{t("stackTitle")}</h2>
        <dl className={styles.facts}>
          {stack.map(key => (
            <div key={key}>
              <dt>{t(`stack.${key}.label`)}</dt>
              <dd>{t(`stack.${key}.items`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.block}>
        <h2>{t("experienceTitle")}</h2>
        <ul className={styles.timeline}>
          {experience.map(key => (
            <li key={key}>
              <small>{t(`experience.${key}.period`)}</small>
              <span>{t(`experience.${key}.text`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h2>{t("educationTitle")}</h2>
        <p>{t("education")}</p>
      </section>

      <section className={styles.block}>
        <h2>{t("languagesTitle")}</h2>
        <p>{t("languages")}</p>
      </section>
    </Story>
  );
}
