import styles from "./shaders-hero-section.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand} />

      <nav className={styles.nav}>
        <a href="#portfolio" className={styles.navLink}>
          Portfolio
        </a>
        <a href="#about" className={styles.navLink}>
          About
        </a>
        <a href="#contact" className={styles.navLink}>
          Contact
        </a>
      </nav>

      <a href="mailto:hello@asphodelius.dev" className={styles.topAction}>
        Email
      </a>
    </header>
  );
}
