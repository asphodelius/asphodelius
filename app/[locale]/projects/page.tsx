import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { projects } from "../../components/site/projects";
import { Story } from "../../components/site/Story";
import styles from "../../components/site/site.module.css";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site.meta" });
  return {
    title: t("projectsTitle"),
    description: t("description"),
    alternates: { canonical: `/${locale}/projects`, languages: { ru: "/ru/projects", en: "/en/projects" } },
  };
}

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Site" });

  return (
    <Story title={t("projectsPage.title")}>
      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/work/${project.slug}`} scroll={false}>{t(`projects.${project.key}.title`)}</Link>
            <small>{t(`projects.${project.key}.short`)}</small>
          </li>
        ))}
      </ul>
    </Story>
  );
}
