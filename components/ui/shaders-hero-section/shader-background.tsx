import { MeshGradient } from "@paper-design/shaders-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./shaders-hero-section.module.css";

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.root} id="portfolio">
      <svg className="absolute inset-0 h-0 w-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.25" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.02
                      0 0 0 0.88 0"
              result="tint"
            />
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className={styles.shader}
        colors={["#050505", "#180d06", "#EE740C", "#FFECD2", "#22120a"]}
        speed={0.22}
      />

      <MeshGradient
        className={`${styles.shader} ${styles.shaderSoft}`}
        colors={["#0a0a0a", "#FFDAB9", "#D4660A", "#050505"]}
        speed={0.16}
        wireframe="true"
      />

      <div className={styles.overlayRadial} />
      <div className={styles.overlayDark} />

      <section className={styles.shell} id="about">
        {children}
      </section>
    </div>
  );
}
