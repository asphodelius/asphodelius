"use client";

import { useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Bloom } from "./Bloom";
import PhilosophyPollination from "./PhilosophyPollination";
import { StoryFlower } from "./StoryFlower";
import { technologies } from "./portfolio-technologies";
import styles from "./portfolio.module.css";

type Project = { title: string; category: string; summary: string; meta: string; href?: string; image?: string; imageAlt?: string; credit?: string };
type Contact = { label: string; value: string; href: string };
const projectLeaves = [0, 1, 2, 3, 5] as const;
const noLeaves: readonly number[] = [];

function ProjectEntry({ project, index, onActive }: {
  project: Project;
  index: number;
  onActive: (index: number | null) => void;
}) {
  const t = useTranslations("Portfolio.work");
  return (
    <article className={styles.project}>
      {project.image ? (
        <Image className={styles.projectImage} src={project.image} alt={project.imageAlt ?? project.title} loading="eager"
          width={1440} height={1000} sizes="(max-width: 760px) 90vw, (max-width: 1280px) 60vw, 760px" />
      ) : null}
      <div className={styles.projectHeading}>
        <span className={styles.index} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3>{project.title}</h3>
          <p className={styles.category}>{project.category}</p>
        </div>
      </div>
      <p className={styles.projectSummary}>{project.summary}</p>
      <p className={styles.meta}>{project.meta}</p>
      {project.credit ? <p className={styles.credit}>{project.credit}</p> : null}
      <a className={styles.projectLink} href={project.href}
        onMouseEnter={() => onActive(index)} onMouseLeave={() => onActive(null)}
        onFocus={() => onActive(index)} onBlur={() => onActive(null)}>
        {t("visit")} <span aria-hidden="true">↗</span>
        <span className="sr-only"> — {project.title}</span>
      </a>
    </article>
  );
}

export default function DigitalAsphodelusPortfolio() {
  const t = useTranslations("Portfolio");
  const locale = useLocale();
  // Root layouts persist during client-side locale navigation.
  // The server sets the initial language; keep it in sync after a language switch.
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // One scroll subscription, no animation loop or layout reads on every scroll.
  const flowerProgress = useTransform(scrollYProgress, value => reducedMotion ? 1 : value);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const projects = t.raw("work.projects") as Project[];
  const contacts = t.raw("contact.links") as Contact[];
  const drafts = projects.filter(project => !project.href);

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main">{t("navigation.skip")}</a>
      <header className={styles.header} id="top">
        <Link href="/" className={styles.alias} translate="no">{t("alias")}</Link>
        <nav aria-label={t("navigation.label")} className={styles.navigation}>
          <a href="#selected-work">{t("navigation.work")}</a>
          <a href="#intro">{t("navigation.about")}</a>
          <a href="#contact">{t("navigation.contact")}</a>
        </nav>
        <nav aria-label={t("navigation.language")} className={styles.languages}>
          <Link href="/" locale="ru" lang="ru" hrefLang="ru" aria-label="Русский" aria-current={locale === "ru" ? "page" : undefined}>RU</Link>
          <Link href="/" locale="en" lang="en" hrefLang="en" aria-label="English" aria-current={locale === "en" ? "page" : undefined}>EN</Link>
        </nav>
      </header>
      <main id="main" tabIndex={-1} className={styles.shell}>
        <div className={styles.story}>
          <section id="hero" className={styles.hero} aria-labelledby="hero-title">
            <p className={styles.eyebrow} translate="no">{t("hero.eyebrow")}</p>
            <h1 id="hero-title" className={styles.title}>
              <span>{t("hero.titleLine1")}</span>
              <span>{t("hero.titleLine2")} <Bloom locale={locale === "ru" ? "ru" : "en"} word={t("hero.bloomWord")} /></span>
              <span>{t("hero.titleLine3")}</span>
            </h1>
            <p className={styles.heroBody}>{t("hero.body")}</p>
            <div className={styles.actions}>
              <a className={styles.primaryLink} href="#selected-work">{t("hero.scrollCue")} <span aria-hidden="true">↓</span></a>
              <a className={styles.textLink} href="mailto:root@asphodelius.dev">{t("hero.contact")}</a>
            </div>
          </section>
          <section id="selected-work" className={styles.section} aria-labelledby="work-title">
            <h2 id="work-title" className={styles.sectionLabel}>{t("work.label")}</h2>
            {projects.map((project, index) => project.href ? (
              <ProjectEntry key={project.title} project={project} index={index} onActive={setActiveProject} />
            ) : null)}
            {drafts.length > 0 ? (
              <details className={styles.drafts}>
                <summary>{t("work.inProgress")} <span className={styles.draftNames}>{drafts.map(project => project.title).join(" / ")}</span></summary>
                <div className={styles.draftList}>
                  {drafts.map(project => (
                    <article key={project.title}><h3>{project.title}</h3><p>{project.summary}</p></article>
                  ))}
                </div>
              </details>
            ) : null}
          </section>
          <section id="intro" className={styles.section} aria-labelledby="intro-title">
            <h2 id="intro-title" className={styles.sectionLabel}>{t("intro.label")}</h2>
            <p className={styles.statement}>{t("intro.statement")}</p>
            <p className={styles.supporting}>{t("intro.supporting")}</p>
            <div className={styles.skills}>
              <h3>{t("intro.stackLabel")}</h3>
              <p className={styles.skillsHint}>{t("intro.stackHint")}</p>
              <ul className={styles.skillsList}>
                {technologies.map(({ key, label, Icon }) => (
                  <li key={key}><Icon aria-hidden="true" /><span>{label}</span></li>
                ))}
              </ul>
            </div>
          </section>
          <section id="philosophy" className={styles.section} aria-labelledby="philosophy-title">
            <h2 id="philosophy-title" className={styles.sectionLabel}>{t("philosophy.label")}</h2>
            <PhilosophyPollination
              ariaLabel={t("philosophy.butterflyLabel")}
              buttonClassName={styles.butterflyButton}
              haloClassName={styles.butterflyHalo}
              motionClassName={styles.butterflyGraphic}
              quote={t("philosophy.quote")}
              quoteClassName={styles.quote}
              targetWord={t("philosophy.highlightWord")}
            />
            <p className={styles.supporting}>{t("philosophy.supporting")}</p>
          </section>
          <section id="contact" className={styles.section} aria-labelledby="contact-title">
            <h2 id="contact-title" className={styles.sectionLabel}>{t("contact.label")}</h2>
            <p className={styles.statement}>{t("contact.heading")}</p>
            <p className={styles.supporting}>{t("contact.body")}</p>
            <ul className={styles.contactLinks}>
              {contacts.map(contact => (
                <li key={contact.label}><a href={contact.href}>
                  <span className={styles.contactLabel}>{contact.label}</span>
                  <span className={styles.contactValue}>{contact.value}</span>
                  <span aria-hidden="true">↗</span>
                </a></li>
              ))}
            </ul>
          </section>
        </div>
        <aside className={styles.visualRail} aria-hidden="true">
          <div className={styles.visualSticky}>
            <StoryFlower className={styles.flower} progress={flowerProgress}
              hoveredProject={activeProject} hoveredSkillLeaf={null}
              highlightedSkillLeaves={activeProject === 0 ? projectLeaves : noLeaves}
              activeProjectLabel={activeProject !== null ? projects[activeProject]?.title : null}
              idPrefix="portfolio-flower" />
            <p className={styles.flowerCaption}>{t("flowerCaption")}</p>
          </div>
        </aside>
      </main>
      <footer className={styles.footer}>
        <span translate="no">asphodelius · Digital Asphodelus</span>
        <a href="#top">{t("navigation.top")} <span aria-hidden="true">↑</span></a>
      </footer>
    </div>
  );
}
