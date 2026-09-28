import type { Metadata, Viewport } from "next";
import styles from "./resume.module.css";

export const metadata: Metadata = {
  title: "Никита Судоргин — Frontend Developer",
  description:
    "Резюме Никиты Судоргина, frontend-разработчика на React, TypeScript и Next.js.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Никита Судоргин — Frontend Developer",
    description: "Frontend-разработчик: React, TypeScript, Next.js, Tailwind CSS.",
    type: "profile",
    siteName: "asphodelius",
    url: "/resume",
    locale: "ru_RU",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "asphodelius" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Никита Судоргин — Frontend Developer",
    description: "Frontend-разработчик: React, TypeScript, Next.js, Tailwind CSS.",
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f7f3",
};

const goodPeoplePoints = [
  "Разработал и запустил корпоративный сайт по готовому дизайну на Next.js, React и TypeScript.",
  "Собрал адаптивную верстку на Flexbox и Grid и переиспользуемые UI-компоненты на Tailwind CSS.",
  "Реализовал SSR, SEO-структуру и оптимизацию скорости загрузки страниц.",
  "Подключил формы обратной связи и обработку данных через REST API.",
  "Вёл разработку в Git с понятной историей изменений.",
] as const;

const astonPoints = [
  "Разрабатывал и рефакторил UI-компоненты на React, JavaScript и TypeScript.",
  "Верстал адаптивные интерфейсы на HTML и CSS.",
  "Исправлял баги, улучшал читаемость и поддерживаемость кода.",
  "Участвовал в код-ревью и обсуждении архитектурных решений.",
] as const;

const skillGroups = [
  ["Основной стек", "JavaScript (ES6+), TypeScript, React, Next.js"],
  ["Интерфейсы", "HTML5, CSS3, Tailwind CSS, Material UI, Responsive Design"],
  ["Состояние", "Redux Toolkit, React Router, Context API"],
  ["Инструменты", "REST API, Axios, Git, GitHub, Vite"],
] as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={styles.sectionTitle}>{children}</h2>;
}

export default function ResumePage() {
  return (
    <main className={styles.page} lang="ru">
      <article className={styles.resume}>
        <header className={styles.header}>
          <div className={styles.identity}>
            <p className={styles.kicker}>Frontend Developer</p>
            <h1>Никита Судоргин</h1>
            <p className={styles.focus}>React · TypeScript · Next.js</p>
          </div>

          <address className={styles.contacts} aria-label="Контакты">
            <a href="tel:+79130611399">+7 913 061-13-99</a>
            <span>Санкт-Петербург</span>
            <a href="https://asphodelius.dev">asphodelius.dev</a>
            <a href="https://github.com/asphodelius">github.com/asphodelius</a>
            <a href="https://t.me/stereoling">Telegram: @stereoling</a>
          </address>
        </header>

        <div className={styles.content}>
          <section className={styles.experienceSection} aria-labelledby="experience-title">
            <SectionTitle>Опыт</SectionTitle>
            <span id="experience-title" className={styles.srOnly}>Опыт работы</span>

            <article className={styles.experience}>
              <div className={styles.experienceHeading}>
                <div>
                  <h3>Хорошие люди</h3>
                  <p>Frontend-разработчик · заказной проект</p>
                </div>
                <time dateTime="2026">2026</time>
              </div>
              <a className={styles.projectLink} href="https://good-people.pro">
                good-people.pro ↗
              </a>
              <p className={styles.stack}>Next.js · React · TypeScript · Tailwind CSS</p>
              <ul>
                {goodPeoplePoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </article>

            <article className={styles.experience}>
              <div className={styles.experienceHeading}>
                <div>
                  <h3>Aston</h3>
                  <p>Frontend Developer · проектная работа</p>
                </div>
                <time dateTime="2024-06/2024-09">Июнь — сентябрь 2024</time>
              </div>
              <ul>
                {astonPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </article>
          </section>

          <aside className={styles.details} aria-label="Профиль и квалификация">
            <section aria-labelledby="profile-title">
              <SectionTitle>Профиль</SectionTitle>
              <p id="profile-title" className={styles.summary}>
                Frontend-разработчик с опытом коммерческой и проектной работы на
                React и TypeScript. Создаю адаптивные интерфейсы, работаю с
                компонентной архитектурой и SSR. Пишу читаемый код, использую Git
                и участвую в код-ревью.
              </p>
            </section>

            <section aria-labelledby="skills-title">
              <SectionTitle>Навыки</SectionTitle>
              <div id="skills-title" className={styles.skills}>
                {skillGroups.map(([title, items]) => (
                  <div key={title}>
                    <h3>{title}</h3>
                    <p>{items}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="education-title">
              <SectionTitle>Образование</SectionTitle>
              <div id="education-title" className={styles.education}>
                <article>
                  <h3>СПбПУ (Политех)</h3>
                  <p>Информатика и вычислительная техника</p>
                  <span>Бакалавриат · 2025 — настоящее время</span>
                </article>
                <article>
                  <h3>НГТУ</h3>
                  <p>Информатика и вычислительная техника</p>
                  <span>Бакалавриат · 2023 — перевод</span>
                </article>
              </div>
            </section>

            <section aria-labelledby="languages-title">
              <SectionTitle>Языки</SectionTitle>
              <dl id="languages-title" className={styles.languages}>
                <div><dt>Русский</dt><dd>Родной</dd></div>
                <div><dt>English</dt><dd>Upper Intermediate</dd></div>
              </dl>
            </section>
          </aside>
        </div>
      </article>
    </main>
  );
}
