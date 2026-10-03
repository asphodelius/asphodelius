"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./site.module.css";

export function Story({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  const t = useTranslations("Site");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus({ preventScroll: window.innerWidth > 760 }); }, [title]);

  return (
    <article className={styles.article} aria-labelledby="story-title">
      <header className={styles.articleHead}>
        <h1 id="story-title" ref={headingRef} tabIndex={-1}>{title}</h1>
        <Link href="/" scroll={false} className={styles.close} data-stitch="">{t("close")}</Link>
      </header>
      {meta ? <p className={styles.meta}>{meta}</p> : null}
      {children}
    </article>
  );
}
