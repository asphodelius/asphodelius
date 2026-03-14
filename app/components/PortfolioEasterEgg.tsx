"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  type MouseEvent,
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PhilosophyButterflyGraphic } from "./PhilosophyButterfly";


const ease = [0.22, 1, 0.36, 1] as const;
const UNLOCK_CLICKS = 10;
const HINT_AT = 5;
const BURST_COUNT = 7;
const SPARKLE_COUNT = 5;
const MAX_BUTTERFLIES = 24;
const COOLDOWN_MS = 150;
const PALETTE = [
  "#f6d365",
  "#fda085",
  "#f5a7cb",
  "#a5d8ff",
  "#8ce4bf",
  "#c7b5ff",
] as const;


type Butterfly = {
  color: string;
  delay: number;
  duration: number;
  id: number;
  rotate: number[];
  size: number;
  x: number;
  xPath: number[];
  y: number;
  yPath: number[];
};

type Sparkle = {
  color: string;
  delay: number;
  duration: number;
  id: number;
  size: number;
  x: number;
  xEnd: number;
  y: number;
  yEnd: number;
};

type Ripple = { id: number; x: number; y: number };


let _id = 0;
const uid = () => ++_id;


function makeButterflies(ox: number, oy: number): Butterfly[] {
  return Array.from({ length: BURST_COUNT }, (_, i) => {
    const spread = BURST_COUNT > 1 ? i / (BURST_COUNT - 1) : 0.5;
    const angle = -2.28 + spread * 1.5 + (Math.random() - 0.5) * 0.32;
    const size = 28 + Math.random() * 20;
    const dist = 120 + Math.random() * 160;
    const midDist = dist * (0.42 + Math.random() * 0.18);
    const lift = 50 + Math.random() * 90;
    const half = -size / 2;
    const driftX = Math.cos(angle) * dist;
    const driftY = Math.sin(angle) * dist - lift;
    const midX = Math.cos(angle + (Math.random() - 0.5) * 0.35) * midDist;
    const midY =
      Math.sin(angle - 0.2 + (Math.random() - 0.5) * 0.2) * midDist -
      lift * 0.6;
    const rotBase = (Math.random() - 0.5) * 28;
    const rotSpread = (spread - 0.5) * 120;

    return {
      color: PALETTE[i % PALETTE.length],
      delay: Math.random() * 0.1,
      duration: 1.4 + Math.random() * 0.6,
      id: uid(),
      rotate: [rotBase, rotBase + rotSpread * 0.45, rotBase + rotSpread],
      size,
      x: ox,
      xPath: [half, midX, driftX],
      y: oy,
      yPath: [half, midY, driftY],
    };
  });
}

function makeSparkles(ox: number, oy: number): Sparkle[] {
  return Array.from({ length: SPARKLE_COUNT }, (_, i) => {
    const angle =
      (Math.PI * 2 * i) / SPARKLE_COUNT + (Math.random() - 0.5) * 0.6;
    const dist = 36 + Math.random() * 72;
    return {
      color: PALETTE[i % PALETTE.length],
      delay: Math.random() * 0.12,
      duration: 0.55 + Math.random() * 0.35,
      id: uid(),
      size: 2.5 + Math.random() * 3.5,
      x: ox,
      xEnd: Math.cos(angle) * dist,
      y: oy,
      yEnd: Math.sin(angle) * dist - 24,
    };
  });
}


const ButterflyIcon = memo(function ButterflyIcon() {
  return (
    <PhilosophyButterflyGraphic className="block h-full w-full" isFlying />
  );
});


const ui = {
  backdrop: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
  backdropBase:
    "absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,168,211,0.2),transparent_27%),radial-gradient(circle_at_82%_16%,rgba(141,195,255,0.18),transparent_24%),radial-gradient(circle_at_52%_78%,rgba(140,228,191,0.16),transparent_30%),linear-gradient(180deg,rgba(6,9,15,0.96),rgba(12,16,24,0.94)_48%,rgba(11,12,18,0.98))]",
  backdropGlow:
    "absolute inset-[-12%] bg-[radial-gradient(circle_at_24%_34%,rgba(255,218,128,0.16),transparent_18%),radial-gradient(circle_at_72%_58%,rgba(250,167,203,0.14),transparent_20%),radial-gradient(circle_at_56%_14%,rgba(199,181,255,0.14),transparent_16%)] blur-[42px]",
  field: "pointer-events-none fixed inset-0 z-[66] overflow-hidden",
  butterfly: "absolute left-0 top-0 will-change-transform",
  sparkle: "absolute left-0 top-0 rounded-full will-change-transform",
  ripple:
    "absolute rounded-full border border-white/[0.08] will-change-transform",
  tooltipWrap:
    "pointer-events-none fixed inset-x-0 bottom-6 z-[72] flex justify-center px-4 max-[640px]:bottom-4",
  tooltip:
    "rounded-full bg-white/[0.05] px-3.5 py-2 text-[0.7rem] leading-none tracking-wide text-white/40 backdrop-blur-xl [font-family:var(--font-mono),monospace]",
} as const;


export default function PortfolioEasterEgg({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const t = useTranslations("Portfolio");
  const [clicks, setClicks] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const tooltipTimer = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const lastBurstAt = useRef(0);

  useEffect(
    () => () => {
      if (tooltipTimer.current !== null)
        window.clearTimeout(tooltipTimer.current);
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const flash = useCallback((msg: string, ms = 2000) => {
    setTooltip(msg);
    if (tooltipTimer.current !== null)
      window.clearTimeout(tooltipTimer.current);
    tooltipTimer.current = window.setTimeout(() => {
      setTooltip(null);
      tooltipTimer.current = null;
    }, ms);
  }, []);

  const burst = useCallback((x: number, y: number) => {
    const now = performance.now();
    if (now - lastBurstAt.current < COOLDOWN_MS) return;
    lastBurstAt.current = now;

    const bflies = makeButterflies(x, y);
    const sparks = makeSparkles(x, y);
    const ripple: Ripple = { id: uid(), x, y };

    const bIds = new Set(bflies.map((b) => b.id));
    const sIds = new Set(sparks.map((s) => s.id));

    /* ── cap total butterflies on screen ── */
    setButterflies((prev) => {
      const next = [...prev, ...bflies];
      return next.length > MAX_BUTTERFLIES
        ? next.slice(next.length - MAX_BUTTERFLIES)
        : next;
    });
    setSparkles((prev) => [...prev, ...sparks]);
    setRipples((prev) => [...prev, ripple]);

    const t1 = window.setTimeout(() => {
      setButterflies((p) => p.filter((b) => !bIds.has(b.id)));
    }, 2800);

    const t2 = window.setTimeout(() => {
      setSparkles((p) => p.filter((s) => !sIds.has(s.id)));
    }, 1100);

    const t3 = window.setTimeout(() => {
      setRipples((p) => p.filter((r) => r.id !== ripple.id));
    }, 700);

    timers.current.push(t1, t2, t3);
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (e.detail === 0 && e.clientX === 0 && e.clientY === 0) return;

      if (unlocked) {
        burst(e.clientX, e.clientY);
        return;
      }

      const next = Math.min(clicks + 1, UNLOCK_CLICKS);
      const remaining = UNLOCK_CLICKS - next;
      setClicks(next);

      if (remaining <= 0) {
        setUnlocked(true);
        burst(e.clientX, e.clientY);
        flash(t("easterEgg.unlocked"), 3000);
        return;
      }

      if (next >= HINT_AT) {
        flash(t("easterEgg.progress", { remaining }));
      }
    },
    [clicks, unlocked, burst, flash, t],
  );

  return (
    <main className={className} onClickCapture={handleClick}>
      <div className={ui.backdrop} aria-hidden="true">
        <motion.div
          className={ui.backdropBase}
          animate={{ opacity: unlocked ? 1 : 0, scale: unlocked ? 1 : 1.04 }}
          transition={{ duration: 0.8, ease }}
        />
        <motion.div
          className={ui.backdropGlow}
          animate={{ opacity: unlocked ? 1 : 0, y: unlocked ? 0 : 24 }}
          transition={{ duration: 1, ease }}
        />
      </div>

      {children}

      <div className={ui.field} aria-hidden="true">
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className={ui.ripple}
            style={{ left: r.x, top: r.y, width: 72, height: 72 }}
            initial={{ opacity: 0.5, scale: 0, x: -36, y: -36 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 0.6, ease }}
          />
        ))}

        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            className={ui.sparkle}
            style={{
              background: s.color,
              height: s.size,
              left: s.x,
              top: s.y,
              width: s.size,
            }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.4, 0],
              x: s.xEnd,
              y: s.yEnd,
            }}
            transition={{ delay: s.delay, duration: s.duration, ease }}
          />
        ))}

        {butterflies.map((b) => (
          <motion.div
            key={b.id}
            className={ui.butterfly}
            style={{
              color: b.color,
              height: b.size,
              left: b.x,
              top: b.y,
              width: b.size,
            }}
            initial={{
              opacity: 0,
              rotate: b.rotate[0],
              scale: 0.3,
              x: b.xPath[0],
              y: b.yPath[0],
            }}
            animate={{
              opacity: [0, 1, 0],
              rotate: b.rotate,
              scale: [0.3, 1, 0.78],
              x: b.xPath,
              y: b.yPath,
            }}
            transition={{
              delay: b.delay,
              duration: b.duration,
              ease,
              times: [0, 0.2, 1],
            }}
          >
            <ButterflyIcon />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {tooltip ? (
          <motion.div
            key={tooltip}
            className={ui.tooltipWrap}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease }}
          >
            <span className={ui.tooltip}>{tooltip}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}