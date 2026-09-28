"use client";

import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import PhilosophyButterfly, { PhilosophyButterflyGraphic } from "./PhilosophyButterfly";

const bloomEase = [0.19, 1, 0.22, 1] as const;
const flightEase = "linear" as const;
const particlePalette = [
  "#E7C98F",
  "#E7B7CA",
  "#BAC5F2",
] as const;

type Point = {
  x: number;
  y: number;
};

type Geometry = {
  contactSceneX: number;
  contactSceneY: number;
  deltaX: number;
  deltaY: number;
};

type Particle = {
  color: string;
  delay: number;
  duration: number;
  dx: number;
  dy: number;
  id: number;
  size: number;
  x: number;
  y: number;
};

type PhilosophyPollinationProps = {
  ariaLabel: string;
  buttonClassName: string;
  haloClassName: string;
  metallicWord?: string;
  motionClassName: string;
  onButtonBlur?: () => void;
  onButtonFocus?: () => void;
  onButtonMouseEnter?: () => void;
  onButtonMouseLeave?: () => void;
  quote: string;
  quoteClassName: string;
  targetWord: string;
};

function splitQuote(quote: string, targetWord: string) {
  const index = quote.indexOf(targetWord);

  if (index === -1) {
    return {
      after: "",
      before: quote,
      target: "",
    };
  }

  return {
    after: quote.slice(index + targetWord.length),
    before: quote.slice(0, index),
    target: quote.slice(index, index + targetWord.length),
  };
}

function findContactLetterIndex(target: string) {
  const lowerTarget = target.toLocaleLowerCase();
  const preferredIndex = Math.max(lowerTarget.lastIndexOf("м"), lowerTarget.lastIndexOf("d"));

  if (preferredIndex !== -1) {
    return preferredIndex;
  }

  return Math.max(0, Array.from(target).length - 1);
}

function sampleCubicBezierPoint(start: Point, controlA: Point, controlB: Point, end: Point, t: number) {
  const inverse = 1 - t;

  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * t * controlA.x +
      3 * inverse * t ** 2 * controlB.x +
      t ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * t * controlA.y +
      3 * inverse * t ** 2 * controlB.y +
      t ** 3 * end.y,
  } satisfies Point;
}

function buildFlightPath(start: Point, end: Point, lift: number, returning = false) {
  const dx = end.x - start.x;
  const controlA = { x: start.x + dx * 0.28, y: start.y - lift };
  const controlB = { x: end.x - dx * 0.22, y: end.y - lift * 0.75 };
  const progress = Array.from({ length: 90 }, (_, index) => index / 89);
  const points = progress.map((step) => {
    // Zero velocity at either end makes departure and landing continuous.
    const travel = step * step * step * (step * (step * 6 - 15) + 10);
    return sampleCubicBezierPoint(start, controlA, controlB, end, travel);
  });
  return {
    x: points.map((point) => point.x),
    y: points.map((point) => point.y),
    // A gentle bank follows travel without rotating the butterfly upside down.
    rotate: progress.map((step) => Math.sign(dx) * 24 * Math.sin(Math.PI * step) ** 2),
    scale: progress.map((step) => {
      const blend = step * step * (3 - 2 * step);
      return returning ? 0.94 + 0.06 * blend : 1 - 0.06 * blend;
    }),
    progress,
  };
}

const PhilosophyPollination = memo(function PhilosophyPollination({
  ariaLabel,
  buttonClassName,
  haloClassName,
  metallicWord = "",
  motionClassName,
  onButtonBlur,
  onButtonFocus,
  onButtonMouseEnter,
  onButtonMouseLeave,
  quote,
  quoteClassName,
  targetWord,
}: PhilosophyPollinationProps) {
  const reducedMotion = useReducedMotion();
  const mountedRef = useRef(true);
  const butterflyControls = useAnimationControls();
  const tintControls = useAnimationControls();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const particleCleanupRef = useRef<number | undefined>(undefined);
  const particleId = useRef(0);
  const busyRef = useRef(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isFlying, setIsFlying] = useState(false);
  const [isBlooming, setIsBlooming] = useState(false);
  const [hasBloomed, setHasBloomed] = useState(false);
  const quoteParts = useMemo(() => splitQuote(quote, targetWord), [quote, targetWord]);
  const afterMetallicParts = useMemo(
    () => splitQuote(quoteParts.after, metallicWord),
    [metallicWord, quoteParts.after],
  );
  const letters = useMemo(() => Array.from(quoteParts.target), [quoteParts.target]);
  const targetLetterIndex = useMemo(
    () => findContactLetterIndex(quoteParts.target),
    [quoteParts.target],
  );

  const measureGeometry = useCallback(() => {
    const scene = sceneRef.current;
    const button = buttonRef.current;
    const word = wordRef.current;

    if (!scene || !button || !word || quoteParts.target.length === 0) {
      return null;
    }

    const sceneRect = scene.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const anchorLetter = letterRefs.current[targetLetterIndex] ?? word;
    const letterRect = anchorLetter.getBoundingClientRect();
    const homeX = buttonRect.left + buttonRect.width / 2 - sceneRect.left;
    const homeY = buttonRect.top + buttonRect.height / 2 - sceneRect.top;
    const contactRatioX = targetLetterIndex >= letters.length - 1 ? 0.72 : 0.56;
    const contactSceneX = letterRect.left + letterRect.width * contactRatioX - sceneRect.left;
    const contactSceneY = letterRect.top + letterRect.height * 0.55 - sceneRect.top;

    const nextGeometry = {
      contactSceneX,
      contactSceneY,
      deltaX: contactSceneX - homeX,
      deltaY: contactSceneY - homeY,
    } satisfies Geometry;

    return nextGeometry;
  }, [letters.length, quoteParts.target.length, targetLetterIndex]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      butterflyControls.stop();
      tintControls.stop();
      if (particleCleanupRef.current) {
        window.clearTimeout(particleCleanupRef.current);
      }
    };
  }, [butterflyControls, tintControls]);

  const spawnParticles = useCallback((x: number, y: number, count: number) => {
    const batch: Particle[] = Array.from({ length: count }, (_, index) => ({
      color: particlePalette[index % particlePalette.length],
      delay: Math.random() * 0.08,
      duration: 0.62 + Math.random() * 0.24,
      dx: (Math.random() - 0.5) * 42,
      dy: -(8 + Math.random() * 18),
      id: particleId.current++,
      size: 2.2 + Math.random() * 2.6,
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 6,
    }));

    setParticles((current) => [...current, ...batch]);

    if (particleCleanupRef.current) {
      window.clearTimeout(particleCleanupRef.current);
    }

    particleCleanupRef.current = window.setTimeout(() => {
      setParticles((current) =>
        current.filter((particle) => !batch.some((item) => item.id === particle.id)),
      );
      particleCleanupRef.current = undefined;
    }, 1600);
  }, []);

  const runPollination = useCallback(async () => {
    if (busyRef.current) return;
    // Measure at activation, after fonts, responsive layout and scrolling settle.
    const activeGeometry = measureGeometry();
    if (!activeGeometry) return;

    busyRef.current = true;
    setIsFlying(!reducedMotion);
    setIsBlooming(false);
    setHasBloomed(false);
    tintControls.set({ opacity: 0 });

    const home = { x: 0, y: 0 };
    const contact = { x: activeGeometry.deltaX, y: activeGeometry.deltaY - 10 };
    const lift = Math.min(70, Math.max(28, Math.hypot(contact.x, contact.y) * 0.2));
    const fly = (path: ReturnType<typeof buildFlightPath>, duration: number) =>
      butterflyControls.start({
        x: path.x,
        y: path.y,
        rotate: path.rotate,
        scale: path.scale,
        transition: { duration, ease: flightEase, times: path.progress },
      });

    try {
      if (!reducedMotion) {
        await fly(buildFlightPath(home, contact, lift), 2.1);
        if (!mountedRef.current) return;
        spawnParticles(activeGeometry.contactSceneX, activeGeometry.contactSceneY, 6);
      }
      setIsBlooming(true);
      await tintControls.start({
        opacity: 1,
        transition: { duration: reducedMotion ? 0.2 : 0.8, ease: bloomEase },
      });
      if (!mountedRef.current) return;
      if (!reducedMotion) {
        await fly(buildFlightPath(contact, home, lift * 1.25, true), 2.3);
        if (!mountedRef.current) return;
      }
      setHasBloomed(true);
    } finally {
      if (mountedRef.current) {
        setIsBlooming(false);
        setIsFlying(false);
      }
      busyRef.current = false;
    }
  }, [butterflyControls, measureGeometry, reducedMotion, spawnParticles, tintControls]);

  return (
    <div ref={sceneRef} className="relative overflow-visible">
      <PhilosophyButterfly
        ref={buttonRef}
        ariaLabel={ariaLabel}
        buttonClassName={buttonClassName}
        haloClassName={haloClassName}
        motionClassName={motionClassName}
        isFlying={isFlying}
        onBlur={onButtonBlur}
        onFocus={onButtonFocus}
        onMouseEnter={onButtonMouseEnter}
        onMouseLeave={onButtonMouseLeave}
        onTrigger={() => void runPollination()}
      >
        {/* Keep one graphic mounted at the button origin throughout the flight. */}
        <motion.span
          aria-hidden="true"
          animate={butterflyControls}
          className="pointer-events-none block"
          style={{ x: 0, y: 0, rotate: 0, scale: 1, willChange: "transform" }}
        >
          <PhilosophyButterflyGraphic className={motionClassName} isFlying={isFlying} />
        </motion.span>
      </PhilosophyButterfly>

      <span className="pointer-events-none absolute inset-0 z-[22] overflow-visible">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: particle.color,
              height: particle.size,
              left: particle.x,
              top: particle.y,
              width: particle.size,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0, 1.08, 0],
              x: particle.dx,
              y: particle.dy,
            }}
            transition={{
              delay: particle.delay,
              duration: particle.duration,
              ease: "easeOut",
            }}
          />
        ))}
      </span>

      <p className={quoteClassName}>
        {quoteParts.before}
        {quoteParts.target ? (
          <span
            ref={wordRef}
            className="relative isolate inline-block whitespace-nowrap align-baseline"
          >
            <span
              className={cn(
                "relative z-[1] transition-opacity duration-[560ms] ease-[cubic-bezier(0.19,1,0.22,1)]",
                (isBlooming || hasBloomed) && "opacity-0",
              )}
            >
              {quoteParts.target}
            </span>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0"
            >
              {letters.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  ref={(element) => {
                    letterRefs.current[index] = element;
                  }}
                >
                  {letter}
                </span>
              ))}
            </span>

            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[2]"
            >
              <motion.span
                className="absolute inset-0"
                animate={tintControls}
                style={{
                  opacity: 0,
                  willChange: "opacity",
                }}
              >
                <span className="block text-[#e7c98f]">{quoteParts.target}</span>
              </motion.span>
            </motion.span>
          </span>
        ) : null}
        {afterMetallicParts.before}
        {afterMetallicParts.target ? (
          <span>{afterMetallicParts.target}</span>
        ) : null}
        {afterMetallicParts.after}
      </p>
    </div>
  );
});

export default PhilosophyPollination;
