"use client";

import {
  motion,
  type HTMLMotionProps,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { forwardRef, memo, useEffect, useRef, type ReactNode } from "react";

type PhilosophyButterflyProps = {
  ariaLabel: string;
  buttonClassName: string;
  haloClassName: string;
  motionClassName: string;
  isFlying?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onTrigger?: () => void;
  showGraphic?: boolean;
  children?: ReactNode;
};

type PhilosophyButterflyGraphicProps = HTMLMotionProps<"span"> & {
  isFlying?: boolean;
};

export const PhilosophyButterflyGraphic = memo(function PhilosophyButterflyGraphic({
  className,
  isFlying = false,
  style,
  ...props
}: PhilosophyButterflyGraphicProps) {
  const reducedMotion = useReducedMotion();
  const phase = useRef(0);
  const elapsed = useRef(0);
  const flightBlend = useRef(0);
  const shellX = useMotionValue(0);
  const shellY = useMotionValue(0);
  const shellRotate = useMotionValue(0);
  const wingScaleX = useMotionValue(1);

  useEffect(() => {
    if (reducedMotion || !isFlying) {
      shellX.set(0);
      shellY.set(0);
      shellRotate.set(0);
      wingScaleX.set(1);
      return;
    }
    let frame = 0;
    let previousTime = performance.now();
    const animate = (time: number) => {
    const delta = time - previousTime;
    previousTime = time;
    // Integrate the phase: changing speed must never restart a wingbeat.
    const dt = Math.min(delta, 40) / 1000;
    flightBlend.current += ((isFlying ? 1 : 0) - flightBlend.current) *
      (1 - Math.exp(-dt * 7));
    const flying = flightBlend.current;
    elapsed.current += dt;
    phase.current = (phase.current + dt * (1.25 + flying * 3) * Math.PI * 2) %
      (Math.PI * 2);
    const t = elapsed.current;
    const fold = (1 - Math.cos(phase.current)) / 2;
    // Both wings fold toward the torso, with no detached or skewed joints.
    wingScaleX.set(1 - fold * (0.2 + flying * 0.48));
    shellX.set(Math.sin(t * 1.1) * (1.1 - flying * 0.8));
    shellY.set(Math.sin(t * 1.6) * (1.4 - flying) - fold * flying * 0.45);
    shellRotate.set(Math.sin(t * 1.3) * (1.8 - flying));
    frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isFlying, reducedMotion, shellRotate, shellX, shellY, wingScaleX]);

  return (
    <motion.span
      className={className}
      {...props}
      style={{
        ...style,
        x: shellX,
        y: shellY,
        rotate: shellRotate,
        transformOrigin: "50% 52%",
        willChange: "transform",
      }}
    >
      <svg
        viewBox="0 0 80 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="block h-full w-full overflow-visible"
      >
        <motion.g
          style={{
            scaleX: wingScaleX,
            transformBox: "view-box",
            transformOrigin: "40px 30px",
            willChange: "transform",
          }}
        >
          <path
            d="M39.8 24.4C31.4 11.4 18.1 8.3 10.8 15.1C8.3 17.4 7.4 21.3 9.2 25C11.8 30.3 21.5 31.8 39.8 26.8"
            fill="rgba(245,239,226,0.05)"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M38 25.2C30 21.5 22 18.5 14 17"
            stroke="currentColor"
            strokeWidth="0.45"
            strokeLinecap="round"
            opacity={0.18}
          />
          <path
            d="M38.5 25.8C32 24 24 23.5 16 24"
            stroke="currentColor"
            strokeWidth="0.35"
            strokeLinecap="round"
            opacity={0.13}
          />
          <motion.ellipse
            cx="23"
            cy="19.5"
            rx="3"
            ry="2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.55"
            initial={false}
            animate={{ opacity: isFlying ? 0.3 : 0.1 }}
            transition={{ duration: 0.35 }}
          />
          <path
            d="M39.2 31.7C30.7 34.4 22 38.4 18.2 45.3C16.1 49.1 16.9 53.1 20 55.4C24.2 58.5 31.1 56.8 36 49.9C38 47.2 39.1 42.7 39.5 36.4"
            fill="rgba(245,239,226,0.04)"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M39 34.5C32 39 26 44 22 49"
            stroke="currentColor"
            strokeWidth="0.45"
            strokeLinecap="round"
            opacity={0.15}
          />
          <motion.circle
            cx="27"
            cy="45"
            r="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.55"
            initial={false}
            animate={{ opacity: isFlying ? 0.26 : 0.08 }}
            transition={{ duration: 0.35 }}
          />
        </motion.g>

        <motion.g
          style={{
            scaleX: wingScaleX,
            transformBox: "view-box",
            transformOrigin: "40px 30px",
            willChange: "transform",
          }}
        >
          <path
            d="M40.2 24.4C48.6 11.4 61.9 8.3 69.2 15.1C71.7 17.4 72.6 21.3 70.8 25C68.2 30.3 58.5 31.8 40.2 26.8"
            fill="rgba(245,239,226,0.05)"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M42 25.2C50 21.5 58 18.5 66 17"
            stroke="currentColor"
            strokeWidth="0.45"
            strokeLinecap="round"
            opacity={0.18}
          />
          <path
            d="M41.5 25.8C48 24 56 23.5 64 24"
            stroke="currentColor"
            strokeWidth="0.35"
            strokeLinecap="round"
            opacity={0.13}
          />
          <motion.ellipse
            cx="57"
            cy="19.5"
            rx="3"
            ry="2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.55"
            initial={false}
            animate={{ opacity: isFlying ? 0.3 : 0.1 }}
            transition={{ duration: 0.35 }}
          />
          <path
            d="M40.8 31.7C49.3 34.4 58 38.4 61.8 45.3C63.9 49.1 63.1 53.1 60 55.4C55.8 58.5 48.9 56.8 44 49.9C42 47.2 40.9 42.7 40.5 36.4"
            fill="rgba(245,239,226,0.04)"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M41 34.5C48 39 54 44 58 49"
            stroke="currentColor"
            strokeWidth="0.45"
            strokeLinecap="round"
            opacity={0.15}
          />
          <motion.circle
            cx="53"
            cy="45"
            r="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.55"
            initial={false}
            animate={{ opacity: isFlying ? 0.26 : 0.08 }}
            transition={{ duration: 0.35 }}
          />
        </motion.g>

        <motion.g
          style={{
            transformBox: "view-box",
            transformOrigin: "40px 18px",
            willChange: "transform",
          }}
        >
          <path
            d="M37.3 17.1C36.1 13.7 33.5 11.1 30.5 8.9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <motion.circle
            cx="30"
            cy="8.5"
            r="1"
            fill="currentColor"
            initial={false}
            animate={{ opacity: isFlying ? 0.48 : 0.28 }}
          />
          <path
            d="M42.7 17.1C43.9 13.7 46.5 11.1 49.5 8.9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <motion.circle
            cx="50"
            cy="8.5"
            r="1"
            fill="currentColor"
            initial={false}
            animate={{ opacity: isFlying ? 0.48 : 0.28 }}
          />
        </motion.g>

        <path
          d="M40 18.4C38.6 22.2 38 27.1 38 31.3C38 37.9 38.9 44.2 40 48.8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M40 18.4C41.4 22.2 42 27.1 42 31.3C42 37.9 41.1 44.2 40 48.8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="40" cy="28" r="0.65" fill="currentColor" opacity={0.18} />
        <circle cx="40" cy="33" r="0.65" fill="currentColor" opacity={0.18} />
        <circle cx="40" cy="38" r="0.55" fill="currentColor" opacity={0.14} />
        <circle cx="40" cy="43" r="0.45" fill="currentColor" opacity={0.1} />
        <circle cx="40" cy="22.5" r="1.8" fill="currentColor" />
      </svg>
    </motion.span>
  );
});

const PhilosophyButterfly = memo(
  forwardRef<HTMLButtonElement, PhilosophyButterflyProps>(
    function PhilosophyButterfly(
      {
        ariaLabel,
        buttonClassName,
        haloClassName,
        motionClassName,
        isFlying = false,
        onBlur,
        onFocus,
        onMouseEnter,
        onMouseLeave,
        onTrigger,
        showGraphic = true,
        children,
      },
      ref,
    ) {
      return (
        <button
          ref={ref}
          type="button"
          className={buttonClassName}
          aria-label={ariaLabel}
          onBlur={onBlur}
          onClick={onTrigger}
          onFocus={onFocus}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <motion.span
            className={haloClassName}
            animate={
              isFlying
                ? { scale: [1, 1.04, 0.94], opacity: [0.42, 0.16, 0] }
                : { scale: 1, opacity: 0.55 }
            }
            transition={
              isFlying
                ? { duration: 0.42, ease: "easeOut" }
                : { duration: 0.24 }
            }
          />

          {children ?? (showGraphic ? (
            <PhilosophyButterflyGraphic
              className={motionClassName}
              isFlying={isFlying}
            />
          ) : null)}
        </button>
      );
    },
  ),
);

export default PhilosophyButterfly;
