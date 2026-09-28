"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Board } from "./Board";
import type { BoardMode } from "./board-engine";
import { findProject, projects } from "./projects";
import styles from "./site.module.css";

/* The theme lives on <html data-mode>, set before paint by the root layout's inline script. */
function subscribeMode(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
  return () => observer.disconnect();
}
const readMode = (): BoardMode => (document.documentElement.dataset.mode === "light" ? "light" : "dark");
const serverMode = (): BoardMode => "dark";

/** Which story is open, read from the URL: "/work/<slug>" or "/projects". */
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
  const panelRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLElement>(null);

  const open = openStory(pathname);
  const [hovered, setHovered] = useState<string | null>(null);
  const mode = useSyncExternalStore(subscribeMode, readMode, serverMode);
  const modeOriginRef = useRef<{ x: number; y: number } | null>(null);

  function toggleMode(e: MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    modeOriginRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const next: BoardMode = mode === "dark" ? "light" : "dark";
    const root = document.documentElement;
    // colours cross-fade only while the theme is switching, so ordinary hovers stay instant
    root.dataset.switching = "";
    window.setTimeout(() => { delete root.dataset.switching; }, 900);
    root.dataset.mode = next;
    try { localStorage.setItem("mode", next); } catch { /* private mode: the choice lasts for this visit */ }
  }

  // Esc closes the open story
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") router.push("/", { scroll: false }); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, router]);

  // when a story closes, focus returns to the link that opened it
  const previous = useRef<string | null>(open);
  useEffect(() => {
    if (previous.current && !open) sideRef.current?.querySelector<HTMLElement>(`[data-story="${previous.current}"]`)?.focus();
    previous.current = open;
  }, [open]);

  const highlight = [open, hovered].some(slug => slug && findProject(slug)?.highlight);

  return (
    <div className={styles.site} data-open={open ? "" : undefined}>
      <Board panelRef={panelRef} mode={mode} highlight={highlight} modeOriginRef={modeOriginRef} />

      <aside className={styles.side} ref={sideRef}>
        <p className={styles.name} translate="no">
          {/* eslint-disable-next-line @next/next/no-img-element -- a 16×16 pixel icon, scaled without smoothing */}
          <img src="/asphodel.png" alt="" width={22} height={22} />
          asphodelius
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
                  aria-current={isOpen ? "page" : undefined}
                  onPointerEnter={() => setHovered(project.slug)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(project.slug)}
                  onBlur={() => setHovered(null)}
                >
                  <span className={styles.projectTitle}>{t(`projects.${project.key}.title`)}</span>
                  <small>{t(`projects.${project.key}.short`)}</small>
                </Link>
              </li>
            );
          })}
        </ul>

        <nav className={styles.more} aria-label={t("navLabel")}>
          <Link href={open === "projects" ? "/" : "/projects"} scroll={false} data-story="projects" aria-current={open === "projects" ? "page" : undefined}>
            {t("projectsLink")}
          </Link>
          <NextLink href="/resume">{t("resume")}</NextLink>
        </nav>

        <div className={styles.foot}>
          <ul className={styles.links}>
            <li><a href="https://github.com/asphodelius" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://t.me/stereoling" target="_blank" rel="noopener noreferrer">Telegram</a></li>
            <li><a href="mailto:root@asphodelius.dev">Email</a></li>
          </ul>
          <div className={styles.prefs}>
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
