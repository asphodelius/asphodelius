import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { findProject, projects } from "../../../components/site/projects";
import { Story } from "../../../components/site/Story";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((project) => ({ locale, slug: project.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = findProject(slug);
  if (!project) return {};
  const t = await getTranslations({ locale, namespace: `Site.projects.${project.key}` });
  return {
    title: `${t("title")} — asphodelius`,
    description: t("about"),
    alternates: { canonical: `/${locale}/work/${slug}`, languages: { ru: `/ru/work/${slug}`, en: `/en/work/${slug}` } },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: `Site.projects.${project.key}` });

  return (
    <Story title={t("title")} meta={t("meta")}>
      <p>{t("about")}</p>
      <p>{t("work")}</p>
      <p>{t("credit")}</p>
      <p><a href={project.href} target="_blank" rel="noopener noreferrer" data-stitch="">{project.host}</a></p>
    </Story>
  );
}
