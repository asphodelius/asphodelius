import { AsphodelusFlower } from "./asphodelus-flower";
import styles from "./shaders-hero-section.module.css";

export function HeroContent() {
  return (
    <main className={styles.hero} id="contact">
      <div className={styles.content}>
        <div className={styles.eyebrow} style={{ filter: "url(#glass-effect)" }}>
          <div className={styles.eyebrowLine} />
          <span className={styles.eyebrowText}>Asphodelus portfolio</span>
        </div>

        <div className={styles.heroBloom} aria-hidden="true">
          <div className={styles.heroBloomGlow} />
          <AsphodelusFlower className={styles.heroBloomFlower} />
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleAccent}>Atmospheric</span> interfaces.
          <br />
          <span>Selected frontend work.</span>
        </h1>

        <p className={styles.description}>
          Portfolio for visual systems, experimental frontends, and calm motion shaped around the asphodelus mark.
        </p>

        <div className={styles.actions}>
          <a href="#portfolio" className={styles.buttonGhost}>
            View portfolio
          </a>
          <a href="mailto:hello@asphodelius.dev" className={styles.buttonSolid}>
            Contact
          </a>
        </div>
      </div>
    </main>
  );
}
