"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Board } from "./Board";
import type { Mode } from "./embroidery/threads";
import { findProject, projects } from "./projects";
import styles from "./site.module.css";

function subscribeMode(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
  return () => observer.disconnect();
}
const readMode = (): Mode => (document.documentElement.dataset.mode === "light" ? "light" : "dark");
const serverMode = (): Mode => "dark";

function openStory(pathname: string): string | null {
  if (pathname === "/projects") return "projects";
  const match = pathname.match(/^\/work\/([^/]+)/);
  return match ? match[1] : null;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const t = useTranslations("Site");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLElement>(null);
  const unpickRef = useRef<(() => void) | null>(null);

  const open = openStory(pathname);
  const [hovered, setHovered] = useState<string | null>(null);
  const [stitches, setStitches] = useState(0);
  const mode = useSyncExternalStore(subscribeMode, readMode, serverMode);
  const onStitches = useCallback((count: number) => setStitches(count), []);

  function toggleMode() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.switching = "";
    window.setTimeout(() => { delete root.dataset.switching; }, 4000);
    root.dataset.mode = next;
    try { localStorage.setItem("mode", next); } catch {}
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") router.push("/", { scroll: false }); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, router]);

  const previous = useRef<string | null>(open);
  useEffect(() => {
    if (previous.current && !open) sideRef.current?.querySelector<HTMLElement>(`[data-story="${previous.current}"]`)?.focus();
    previous.current = open;
  }, [open]);

  const highlight = (hovered && findProject(hovered)?.tint) || (open && findProject(open)?.tint) || false;

  return (
    <div className={styles.site} data-open={open ? "" : undefined} ref={rootRef}>
      <Board panelRef={panelRef} rootRef={rootRef} mode={mode} highlight={highlight} unpickRef={unpickRef} onStitches={onStitches} />

      <aside className={styles.side} ref={sideRef}>
        <p className={styles.name} translate="no">
          <span className={styles.logo} data-logo="" aria-hidden="true" />
          <span aria-hidden="true">asphodel<span className={styles.fi} data-fi="">ı</span>us</span>
          <span className={styles.srOnly}>asphodelius</span>
        </p>
        <p className={styles.lead}>{t("lead")}</p>

        <ul className={styles.work}>
          {projects.map(project => {
            const isOpen = open === project.slug;
            return (
              <li key={project.slug}>
                <Link
                  href={isOpen ? "/" : `/work/${project.slug}`}
                  scroll={false}
                  className={styles.project}
                  data-story={project.slug}
                  data-stitch="hover"
                  data-icon={project.slug}
                  aria-current={isOpen ? "page" : undefined}
                  onPointerEnter={() => setHovered(project.slug)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(project.slug)}
                  onBlur={() => setHovered(null)}
                >
                  <span className={styles.projectTitle} data-stitch-text="">{t(`projects.${project.key}.title`)}</span>
                  <small>{t(`projects.${project.key}.short`)}</small>
                </Link>
              </li>
            );
          })}
        </ul>

        <nav className={styles.more} aria-label={t("navLabel")}>
          <Link href={open === "projects" ? "/" : "/projects"} scroll={false} data-story="projects" data-stitch="" aria-current={open === "projects" ? "page" : undefined}>
            {t("projectsLink")}
          </Link>
          <NextLink href="/resume" data-stitch="">{t("resume")}</NextLink>
          <a href="/resume.pdf" download="Nikita-Sudorgin-Frontend-Developer.pdf" aria-label={t("resumePdfLabel")} data-stitch="">{t("resumePdf")}</a>
        </nav>

        <div className={styles.foot}>
          <ul className={styles.links}>
            <li><a href="https://github.com/asphodelius" target="_blank" rel="noopener noreferrer" data-stitch="" data-icon="github">GitHub</a></li>
            <li><a href="https://t.me/stereoling" target="_blank" rel="noopener noreferrer" data-stitch="" data-icon="telegram">Telegram</a></li>
            <li><a href="mailto:root@asphodelius.dev" data-stitch="" data-icon="mail">Email</a></li>
          </ul>
          <div className={styles.prefs}>
            {stitches > 0 ? (
              <button type="button" className={styles.mode} onClick={() => unpickRef.current?.()}>{t("unpick")}</button>
            ) : null}
            <button type="button" className={styles.mode} onClick={toggleMode}>
              <span className={styles.toLight}>{t("themeLight")}</span>
              <span className={styles.toDark}>{t("themeDark")}</span>
            </button>
            <nav className={styles.lang} aria-label={t("languageLabel")}>
              <Link href={pathname} locale="ru" scroll={false} hrefLang="ru" aria-current={locale === "ru" ? "true" : undefined}>RU</Link>
              <span aria-hidden="true">/</span>
              <Link href={pathname} locale="en" scroll={false} hrefLang="en" aria-current={locale === "en" ? "true" : undefined}>EN</Link>
            </nav>
          </div>
        </div>
      </aside>

      <main className={styles.story} data-empty={open ? undefined : ""}>{children}</main>

      <div className={styles.panel} ref={panelRef} />
    </div>
  );
}
