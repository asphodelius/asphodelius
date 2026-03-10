"use client";

import {
  motion,
  type HTMLMotionProps,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import { forwardRef, memo, useRef } from "react";

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
};

type PhilosophyButterflyGraphicProps = HTMLMotionProps<"span"> & {
  isFlying?: boolean;
};

export const PhilosophyButterflyGraphic = memo(function PhilosophyButterflyGraphic({
  className,
  isFlying = false,
  ...props
}: PhilosophyButterflyGraphicProps) {
  const phase = useRef(Math.PI * 0.61803398875);
  const shellX = useMotionValue(0);
  const shellY = useMotionValue(0);
  const shellRotate = useMotionValue(0);
  const shellScale = useMotionValue(1);
  const leftWingRotate = useMotionValue(0);
  const leftWingScaleX = useMotionValue(1);
  const leftWingScaleY = useMotionValue(1);
  const rightWingRotate = useMotionValue(0);
  const rightWingScaleX = useMotionValue(1);
  const rightWingScaleY = useMotionValue(1);
  const torsoRotate = useMotionValue(0);
  const torsoY = useMotionValue(0);

  useAnimationFrame((time) => {
    const t = time / 1000;
    const basePhase = phase.current;
  
    const flapRate = isFlying ? 4.3 : 2.25;
    const normalizedPhase = basePhase / (Math.PI * 2);
    const cycle = (t * flapRate + normalizedPhase) % 1;
    const closePhaseRaw =
      cycle < 0.38 ? cycle / 0.38 : 1 - (cycle - 0.38) / 0.62;
    const closePhase = Math.max(closePhaseRaw, 0);
    const closeStrength = Math.pow(closePhase, isFlying ? 1.32 : 1.18);
    const wingOpenAngle = isFlying ? 21.5 : 16.5;
    const wingClosedAngle = isFlying ? -6.2 : -2.8;
    const recoveryFlutter =
      Math.sin(t * flapRate * Math.PI * 2 + basePhase * 0.42) *
      (1 - closeStrength) *
      (isFlying ? 0.95 : 0.42);
    const wingAngle =
      wingOpenAngle +
      (wingClosedAngle - wingOpenAngle) * closeStrength +
      recoveryFlutter;
    const wingScaleYValue = 1 - closeStrength * (isFlying ? 0.15 : 0.09);
    const wingScaleXValue = 1 + closeStrength * (isFlying ? 0.014 : 0.008);
    const flapLift = closeStrength * (isFlying ? 0.9 : 0.42);

    leftWingRotate.set(wingAngle);
    leftWingScaleX.set(wingScaleXValue);
    leftWingScaleY.set(wingScaleYValue);
    rightWingRotate.set(-wingAngle * 0.97);
    rightWingScaleX.set(wingScaleXValue);
    rightWingScaleY.set(wingScaleYValue);

    if (isFlying) {
      shellX.set(
        (Math.sin(t * 5.4 + basePhase) * 1.35 +
          Math.sin(t * 9.2 + basePhase * 0.6) * 0.42),
      );
      shellY.set(
        (Math.sin(t * 4.9 + basePhase * 0.8) * -1.05 +
          Math.sin(t * 8.6 + basePhase * 1.2) * 0.22 -
          flapLift),
      );
      shellRotate.set(
        (Math.sin(t * 3.8 + basePhase * 0.75) * 2.1 +
          Math.cos(t * 6.6 + basePhase) * 0.8),
      );
      shellScale.set(
        1 +
          (Math.sin(t * 5.3 + basePhase * 0.4) * 0.012 +
            Math.cos(t * 2.8 + basePhase) * 0.006),
      );
      torsoRotate.set(
        (Math.sin(t * 5.2 + basePhase * 0.5) * 1.5 +
          Math.cos(t * 3.4 + basePhase) * 0.45),
      );
      torsoY.set(
        (Math.sin(t * 5.4 + basePhase * 0.9) * -0.34 +
          Math.cos(t * 3.4 + basePhase * 0.55) * 0.12 -
          flapLift * 0.2),
      );
      return;
    }

    shellX.set(
      (Math.sin(t * 1.15 + basePhase) * 2.8 +
        Math.sin(t * 0.58 + basePhase * 0.8) * 1.2),
    );
    shellY.set(
      (Math.sin(t * 0.96 + basePhase * 0.65) * -2.6 +
        Math.cos(t * 0.48 + basePhase * 1.1) * -0.95 -
        flapLift),
    );
    shellRotate.set(
      (-
        4.4 +
        Math.sin(t * 1.26 + basePhase * 0.85) * 2.1 +
        Math.cos(t * 0.74 + basePhase * 0.4) * 0.62),
    );
    shellScale.set(
      1 +
        (Math.sin(t * 1.05 + basePhase * 0.4) * 0.012 +
          Math.cos(t * 0.64 + basePhase) * 0.006),
    );
    torsoRotate.set(
      (Math.sin(t * 1.52 + basePhase * 0.45) * 0.8 +
        Math.cos(t * 0.92 + basePhase * 0.75) * 0.24),
    );
    torsoY.set(
      (Math.sin(t * 1.42 + basePhase * 0.95) * -0.22 +
        Math.cos(t * 0.88 + basePhase * 0.35) * 0.08 -
        flapLift * 0.12),
    );
  });

  return (
    <motion.span
      className={className}
      {...props}
      style={{
        x: shellX,
        y: shellY,
        rotate: shellRotate,
        scale: shellScale,
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
            rotate: leftWingRotate,
            scaleX: leftWingScaleX,
            scaleY: leftWingScaleY,
            transformBox: "view-box",
            transformOrigin: "39px 28px",
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
            rotate: rightWingRotate,
            scaleX: rightWingScaleX,
            scaleY: rightWingScaleY,
            transformBox: "view-box",
            transformOrigin: "41px 28px",
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
            rotate: torsoRotate,
            y: torsoY,
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

          {showGraphic ? (
            <PhilosophyButterflyGraphic
              className={motionClassName}
              isFlying={isFlying}
            />
          ) : null}
        </button>
      );
    },
  ),
);

export default PhilosophyButterfly;
