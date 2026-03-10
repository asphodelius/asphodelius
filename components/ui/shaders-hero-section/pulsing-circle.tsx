import { PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import styles from "./shaders-hero-section.module.css";

export function PulsingCircle() {
  return (
    <div className={styles.orbWrap}>
      <div className={styles.orb}>
        <PulsingBorder
          colors={["#FFFFFF", "#CFCFCF", "#7A7A7A", "#FFFFFF"]}
          colorBack="#00000000"
          speed={1.2}
          roundness={1}
          thickness={0.1}
          softness={0.18}
          intensity={3.8}
          spotSize={0.1}
          pulse={0.06}
          smoke={0.22}
          smokeSize={4}
          scale={0.68}
          rotation={0}
          frame={9161408.251009725}
          style={{ width: "64px", height: "64px", borderRadius: "50%" }}
        />

        <motion.svg
          className={styles.orbText}
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transform: "scale(1.52)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-white/70 text-[7px] uppercase tracking-[0.28em]">
            <textPath href="#circle" startOffset="0%">
              asphodelius minimal motion asphodelius minimal motion
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  );
}
