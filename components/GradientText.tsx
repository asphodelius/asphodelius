import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  textClassName?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?:
    | "horizontal"
    | "horizontal-reverse"
    | "vertical"
    | "vertical-reverse"
    | "diagonal"
    | "diagonal-reverse";
  pauseOnHover?: boolean;
  yoyo?: boolean;
}

export default function GradientText({
  children,
  className = "",
  textClassName = "",
  colors = ["#5227FF", "#FF9FFC", "#B19EEF"],
  animationSpeed = 8,
  showBorder = false,
  direction = "horizontal",
  pauseOnHover = false,
  yoyo = true,
}: GradientTextProps) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = animationSpeed * 1000;

  useAnimationFrame((time) => {
    if (isPaused) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    if (yoyo) {
      const fullCycle = animationDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;

      if (cycleTime < animationDuration) {
        progress.set((cycleTime / animationDuration) * 100);
      } else {
        progress.set(100 - ((cycleTime - animationDuration) / animationDuration) * 100);
      }
    } else {
      // Continuously increase position for seamless looping
      progress.set((elapsedRef.current / animationDuration) * 100);
    }
  });

  useEffect(() => {
    elapsedRef.current = 0;
    progress.set(0);
  }, [animationSpeed, progress, yoyo]);

  const backgroundPosition = useTransform(progress, (p) => {
    if (direction === "horizontal") {
      return `${p}% 50%`;
    } else if (direction === "horizontal-reverse") {
      return `${100 - p}% 50%`;
    } else if (direction === "vertical") {
      return `50% ${p}%`;
    } else if (direction === "vertical-reverse") {
      return `50% ${100 - p}%`;
    } else if (direction === "diagonal-reverse") {
      return `${100 - p}% ${100 - p}%`;
    } else {
      return `${p}% ${p}%`;
    }
  });

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  const gradientAngle =
    direction === "horizontal"
      ? "to right"
      : direction === "horizontal-reverse"
        ? "to left"
      : direction === "vertical"
        ? "to bottom"
        : direction === "vertical-reverse"
          ? "to top"
          : direction === "diagonal-reverse"
            ? "to top left"
        : "to bottom right";
  const gradientColors = [...colors, colors[0]].join(", ");

  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundRepeat: "repeat",
    backgroundSize:
      direction === "horizontal" || direction === "horizontal-reverse"
        ? "300% 100%"
        : direction === "vertical" || direction === "vertical-reverse"
          ? "100% 300%"
          : "300% 300%",
  };

  return (
    <motion.span
      className={cn(
        "animated-gradient-text relative inline-block align-baseline",
        showBorder && "overflow-hidden rounded-[1.25rem] px-2 py-1",
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showBorder && (
        <motion.span
          className="gradient-overlay absolute inset-0 z-0 pointer-events-none rounded-[1.25rem]"
          style={{ ...gradientStyle, backgroundPosition }}
        >
          <span
            className="absolute z-[-1] rounded-[1.25rem] bg-black"
            style={{
              height: "calc(100% - 2px)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "calc(100% - 2px)",
            }}
          />
        </motion.span>
      )}
      <motion.span
        className={cn(
          "text-content relative z-[2] inline-block bg-clip-text text-transparent",
          textClassName,
        )}
        style={{
          ...gradientStyle,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundPosition,
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
