"use client";

import {
  motion,
  useAnimationControls,
} from "framer-motion";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import GradientText from "@/components/GradientText";
import MetallicPaint from "@/components/MetallicPaint";
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
  bloomRadius: number;
  contactSceneX: number;
  contactSceneY: number;
  contactWordX: number;
  contactWordY: number;
  deltaX: number;
  deltaY: number;
  homeX: number;
  homeY: number;
  wordHeight: number;
  wordWidth: number;
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

function parsePixelValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildTextTextureSource({
  fontFamily,
  fontSize,
  fontStyle,
  fontWeight,
  height,
  letterSpacing,
  text,
  width,
}: {
  fontFamily: string;
  fontSize: string;
  fontStyle: string;
  fontWeight: string;
  height: number;
  letterSpacing: string;
  text: string;
  width: number;
}) {
  const paddingX = Math.max(3, Math.round(width * 0.015));
  const paddingY = Math.max(2, Math.round(height * 0.035));
  const totalWidth = width + paddingX * 2;
  const totalHeight = height + paddingY * 2;
  const canvas = document.createElement("canvas");
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  canvas.width = totalWidth * scale;
  canvas.height = totalHeight * scale;

  const context = canvas.getContext("2d");

  if (!context) {
    return {
      paddingX,
      paddingY,
      src: "",
    };
  }

  context.scale(scale, scale);
  context.clearRect(0, 0, totalWidth, totalHeight);
  context.fillStyle = "#000000";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;

  const spacing = letterSpacing === "normal" ? 0 : parsePixelValue(letterSpacing);
  const metrics = context.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || parsePixelValue(fontSize) * 0.78;
  const descent = metrics.actualBoundingBoxDescent || parsePixelValue(fontSize) * 0.22;
  const baselineY = paddingY + (height - (ascent + descent)) / 2 + ascent;

  if (Math.abs(spacing) < 0.01) {
    context.fillText(text, paddingX, baselineY);
  } else {
    let cursorX = paddingX;

    Array.from(text).forEach((character, index, characters) => {
      context.fillText(character, cursorX, baselineY);
      cursorX += context.measureText(character).width;

      if (index < characters.length - 1) {
        cursorX += spacing;
      }
    });
  }

  return {
    paddingX,
    paddingY,
    src: canvas.toDataURL("image/png"),
  };
}

type MetallicTextureData = {
  paddingX: number;
  paddingY: number;
  src: string;
};

const MetallicInlineWord = memo(function MetallicInlineWord({
  className,
  text,
}: {
  className?: string;
  text: string;
}) {
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [textureData, setTextureData] = useState<MetallicTextureData | null>(null);

  useEffect(() => {
    const element = measureRef.current;

    if (!element) {
      return;
    }

    const update = () => {
      const rect = element.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return;
      }

      const styles = window.getComputedStyle(element);

      setTextureData(
        buildTextTextureSource({
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontStyle: styles.fontStyle,
          fontWeight: styles.fontWeight,
          height: Math.ceil(rect.height),
          letterSpacing: styles.letterSpacing === "normal" ? "0px" : styles.letterSpacing,
          text,
          width: Math.ceil(rect.width),
        }),
      );
    };

    update();
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(update);
    });
    resizeObserver.observe(element);

    if ("fonts" in document) {
      void document.fonts.ready.then(update);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  return (
    <span
      ref={measureRef}
      className={cn(
        "relative inline-block align-baseline text-transparent selection:text-transparent [-webkit-text-fill-color:transparent]",
        className,
      )}
    >
      {text}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute overflow-visible"
        style={
          textureData
            ? {
                bottom: `${-textureData.paddingY}px`,
                left: `${-textureData.paddingX}px`,
                right: `${-textureData.paddingX}px`,
                top: `${-textureData.paddingY}px`,
              }
            : undefined
        }
      >
        {textureData ? (
          <MetallicPaint
            imageSrc={textureData.src}
            seed={31}
            scale={3.4}
            refraction={0.018}
            blur={0.022}
            liquid={0.58}
            speed={0.18}
            brightness={1.75}
            contrast={0.82}
            angle={-14}
            fresnel={0.9}
            lightColor="#fff7de"
            darkColor="#2a1508"
            patternSharpness={0.82}
            waveAmplitude={1}
            noiseScale={0.44}
            chromaticSpread={1.55}
            distortion={1}
            contour={0.2}
            tintColor="#feb3ff"
          />
        ) : null}
      </span>
    </span>
  );
});

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

function sampleCubicBezierTangent(
  start: Point,
  controlA: Point,
  controlB: Point,
  end: Point,
  t: number,
) {
  const inverse = 1 - t;

  return {
    x:
      3 * inverse ** 2 * (controlA.x - start.x) +
      6 * inverse * t * (controlB.x - controlA.x) +
      3 * t ** 2 * (end.x - controlB.x),
    y:
      3 * inverse ** 2 * (controlA.y - start.y) +
      6 * inverse * t * (controlB.y - controlA.y) +
      3 * t ** 2 * (end.y - controlB.y),
  } satisfies Point;
}

function vectorFromHeading(heading: number, distance: number) {
  const radians = (heading * Math.PI) / 180;

  return {
    x: Math.sin(radians) * distance,
    y: -Math.cos(radians) * distance,
  } satisfies Point;
}

function alignAngleToReference(value: number, reference: number) {
  let nextValue = value;
  let delta = nextValue - reference;

  while (delta > 180) {
    nextValue -= 360;
    delta = nextValue - reference;
  }

  while (delta < -180) {
    nextValue += 360;
    delta = nextValue - reference;
  }

  return nextValue;
}

function unwrapAngles(values: number[]) {
  return values.reduce<number[]>((result, value, index) => {
    if (index === 0) {
      result.push(value);
      return result;
    }

    result.push(alignAngleToReference(value, result[index - 1]));
    return result;
  }, []);
}

function limitAngleStep(values: number[], maxStep: number) {
  return values.reduce<number[]>((result, value, index) => {
    if (index === 0) {
      result.push(value);
      return result;
    }

    const target = alignAngleToReference(value, result[index - 1]);
    const delta = target - result[index - 1];
    const clampedDelta = Math.max(-maxStep, Math.min(maxStep, delta));
    result.push(result[index - 1] + clampedDelta);
    return result;
  }, []);
}

function buildFlutterKeyframes({
  baseScaleEnd,
  baseScaleStart,
  controlA,
  controlB,
  end,
  flutterAmplitude,
  flutterPhase,
  flutterWaves,
  frames,
  start,
  tiltEnd,
  tiltStart,
}: {
  baseScaleEnd: number;
  baseScaleStart: number;
  controlA: Point;
  controlB: Point;
  end: Point;
  flutterAmplitude: number;
  flutterPhase: number;
  flutterWaves: number;
  frames: number;
  start: Point;
  tiltEnd: number;
  tiltStart: number;
}) {
  const progress = Array.from({ length: frames }, (_, index) => index / (frames - 1));
  const x = progress.map((step) => {
    const travel = 0.5 - Math.cos(step * Math.PI) / 2;
    const point = sampleCubicBezierPoint(start, controlA, controlB, end, travel);
    const tangent = sampleCubicBezierTangent(start, controlA, controlB, end, travel);
    const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
    const tangentX = tangent.x / tangentLength;
    const normalX = -tangent.y / tangentLength;
    const flutterEnvelope = Math.sin(travel * Math.PI) * Math.pow(1 - travel, 0.9);
    const settleEnvelope = Math.sin(travel * Math.PI) * Math.pow(1 - travel, 1.12);
    const driftEnvelope = Math.sin(travel * Math.PI) * Math.pow(1 - travel, 0.98);
    const flutter =
      Math.sin(travel * Math.PI * flutterWaves + flutterPhase) *
      flutterEnvelope *
      flutterAmplitude;
    const settle =
      Math.sin(travel * Math.PI * (flutterWaves * 0.48) + flutterPhase * 0.24) *
      settleEnvelope *
      flutterAmplitude *
      0.08;
    const drift =
      Math.cos(travel * Math.PI * (flutterWaves * 0.34) + flutterPhase * 0.86) *
      driftEnvelope *
      flutterAmplitude *
      0.22;

    return point.x + normalX * (flutter + settle) + tangentX * drift;
  });
  const y = progress.map((step) => {
    const travel = 0.5 - Math.cos(step * Math.PI) / 2;
    const point = sampleCubicBezierPoint(start, controlA, controlB, end, travel);
    const tangent = sampleCubicBezierTangent(start, controlA, controlB, end, travel);
    const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
    const tangentY = tangent.y / tangentLength;
    const normalY = tangent.x / tangentLength;
    const flutterEnvelope = Math.sin(travel * Math.PI) * Math.pow(1 - travel, 0.9);
    const settleEnvelope = Math.sin(travel * Math.PI) * Math.pow(1 - travel, 1.12);
    const driftEnvelope = Math.sin(travel * Math.PI) * Math.pow(1 - travel, 0.98);
    const flutter =
      Math.sin(travel * Math.PI * flutterWaves + flutterPhase) *
      flutterEnvelope *
      flutterAmplitude;
    const settle =
      Math.sin(travel * Math.PI * (flutterWaves * 0.48) + flutterPhase * 0.24) *
      settleEnvelope *
      flutterAmplitude *
      0.08;
    const drift =
      Math.cos(travel * Math.PI * (flutterWaves * 0.34) + flutterPhase * 0.86) *
      driftEnvelope *
      flutterAmplitude *
      0.22;

    return point.y + normalY * (flutter + settle) + tangentY * drift;
  });
  const rotate = limitAngleStep(progress.reduce<number[]>((angles, step, index) => {
    const travel = 0.5 - Math.cos(step * Math.PI) / 2;
    const deltaX = x[Math.min(index + 1, x.length - 1)] - x[Math.max(index - 1, 0)];
    const deltaY = y[Math.min(index + 1, y.length - 1)] - y[Math.max(index - 1, 0)];
    const rawHeading =
      Math.hypot(deltaX, deltaY) > 0.001
        ? Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90
        : index === 0
          ? 0
          : angles[index - 1];
    const heading =
      index === 0 ? rawHeading : alignAngleToReference(rawHeading, angles[index - 1]);
    const flutterEnvelope = Math.sin(travel * Math.PI) * Math.pow(1 - travel, 0.7);
    const swayEnvelope = Math.sin(travel * Math.PI) * Math.pow(1 - travel, 0.84);
    const flutterTilt =
      Math.sin(travel * Math.PI * flutterWaves + flutterPhase * 0.48) *
      flutterEnvelope *
      2.2;
    const swayTilt =
      Math.sin(travel * Math.PI * (flutterWaves * 0.42) + flutterPhase * 0.9) *
      swayEnvelope *
      1.1;
    const bias = tiltStart + (tiltEnd - tiltStart) * travel;
    const nextAngle = heading + bias + flutterTilt + swayTilt;

    angles.push(index === 0 ? nextAngle : alignAngleToReference(nextAngle, angles[index - 1]));
    return angles;
  }, []), 5.2);
  const scale = progress.map((step) => {
    const travel = 0.5 - Math.cos(step * Math.PI) / 2;
    const pulse =
      Math.sin(travel * Math.PI * (flutterWaves - 0.28)) * 0.006 +
      Math.cos(travel * Math.PI * 1.2 + flutterPhase * 0.32) * 0.002;

    return baseScaleStart + (baseScaleEnd - baseScaleStart) * travel + pulse;
  });

  return {
    progress,
    rotate,
    scale,
    x,
    y,
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
  const butterflyControls = useAnimationControls();
  const tintControls = useAnimationControls();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const particleCleanupRef = useRef<number | undefined>(undefined);
  const particleId = useRef(0);
  const busyRef = useRef(false);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
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
    const wordRect = word.getBoundingClientRect();
    const anchorLetter = letterRefs.current[targetLetterIndex] ?? word;
    const letterRect = anchorLetter.getBoundingClientRect();
    const homeX = buttonRect.left + buttonRect.width / 2 - sceneRect.left;
    const homeY = buttonRect.top + buttonRect.height / 2 - sceneRect.top;
    const contactRatioX = targetLetterIndex >= letters.length - 1 ? 0.72 : 0.56;
    const contactSceneX = letterRect.left + letterRect.width * contactRatioX - sceneRect.left;
    const contactSceneY = letterRect.top + letterRect.height * 0.55 - sceneRect.top;
    const wordOffsetX = wordRect.left - sceneRect.left;
    const wordOffsetY = wordRect.top - sceneRect.top;

    const nextGeometry = {
      bloomRadius: Math.hypot(wordRect.width, wordRect.height) * 0.7,
      contactSceneX,
      contactSceneY,
      contactWordX: contactSceneX - wordOffsetX,
      contactWordY: contactSceneY - wordOffsetY,
      deltaX: contactSceneX - homeX,
      deltaY: contactSceneY - homeY,
      homeX,
      homeY,
      wordHeight: wordRect.height,
      wordWidth: wordRect.width,
    } satisfies Geometry;

    setGeometry(nextGeometry);
    return nextGeometry;
  }, [letters.length, quoteParts.target.length, targetLetterIndex]);

  useEffect(() => {
    const update = () => {
      window.requestAnimationFrame(() => {
        measureGeometry();
      });
    };

    update();
    window.addEventListener("resize", update);
    const resizeObserver = new ResizeObserver(update);
    const scene = sceneRef.current;
    const button = buttonRef.current;
    const word = wordRef.current;

    if (scene) {
      resizeObserver.observe(scene);
    }

    if (button) {
      resizeObserver.observe(button);
    }

    if (word) {
      resizeObserver.observe(word);
    }

    if ("fonts" in document) {
      void document.fonts.ready.then(update);
    }

    return () => {
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [measureGeometry]);

  useEffect(() => {
    if (!geometry || busyRef.current) {
      return;
    }

    tintControls.set({
      opacity: hasBloomed ? 1 : 0,
    });

    butterflyControls.set({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
  }, [butterflyControls, geometry, hasBloomed, tintControls]);

  useEffect(() => {
    return () => {
      if (particleCleanupRef.current) {
        window.clearTimeout(particleCleanupRef.current);
      }
    };
  }, []);

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
    if (busyRef.current) {
      return;
    }

    const activeGeometry = geometry ?? measureGeometry();

    if (!activeGeometry) {
      return;
    }

    busyRef.current = true;
    setIsFlying(true);
    setIsBlooming(false);
    setHasBloomed(false);

    tintControls.stop();
    butterflyControls.stop();

    tintControls.set({
      opacity: 0,
    });

    butterflyControls.set({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });

    const dx = activeGeometry.deltaX;
    const dy = activeGeometry.deltaY;
    const contactX = dx - 2.6;
    const contactY = dy - 6.3;
    const contactRestX = contactX - 0.28;
    const contactRestY = contactY - 0.46;
    const contactRestRotate = -0.2;
    const contactRestScale = 0.959;
    const outwardDirection = dx === 0 ? 1 : -Math.sign(dx);
    const approachLift = Math.min(36, Math.max(20, Math.abs(dy) * 0.1 + 18));
    const approachCross = Math.min(18, Math.abs(dx) * 0.08 + 7);
    const startPoint = { x: 0, y: 0 } satisfies Point;
    const contactPoint = { x: contactRestX, y: contactRestY } satisfies Point;
    const approachControlA = {
      x: dx * 0.24 + Math.sign(dx || -1) * 8,
      y: -approachLift - 6,
    } satisfies Point;
    const approachControlB = {
      x: contactRestX - dx * 0.16 - outwardDirection * (approachCross + 4),
      y: contactRestY - Math.min(22, Math.abs(dy) * 0.07 + 11),
    } satisfies Point;
    const approachPath = buildFlutterKeyframes({
      baseScaleEnd: contactRestScale,
      baseScaleStart: 1,
      controlA: approachControlA,
      controlB: approachControlB,
      end: contactPoint,
      flutterAmplitude: Math.min(4.8, Math.abs(dx) * 0.012 + 2.4),
      flutterPhase: 0.64,
      flutterWaves: 1.18,
      frames: 96,
      start: startPoint,
      tiltEnd: contactRestRotate,
      tiltStart: 0,
    });
    const approachStartHeading = approachPath.rotate[0] ?? 0;
    const approachEndHeading =
      approachPath.rotate[approachPath.rotate.length - 1] ?? approachStartHeading;

    butterflyControls.set({
      x: 0,
      y: 0,
      rotate: approachStartHeading,
      scale: 1,
      opacity: 1,
    });

    await butterflyControls.start({
      x: approachPath.x,
      y: approachPath.y,
      rotate: approachPath.rotate,
      scale: approachPath.scale,
      opacity: 1,
      transition: {
        duration: 2.18,
        ease: flightEase,
        times: approachPath.progress,
      },
    });

    spawnParticles(activeGeometry.contactSceneX, activeGeometry.contactSceneY, 6);
    setIsBlooming(true);

    const bloomAnimation = tintControls.start({
      opacity: [0, 0.42, 1],
      transition: {
        duration: 0.92,
        ease: bloomEase,
        times: [0, 0.46, 1],
      },
    });
    await bloomAnimation;

    const returnDepartureVector = vectorFromHeading(
      approachEndHeading,
      Math.min(15, Math.max(8.5, Math.hypot(dx, dy) * 0.022 + 6.8)),
    );
    const departurePoint = {
      x: contactRestX + returnDepartureVector.x,
      y: contactRestY + returnDepartureVector.y,
    } satisfies Point;
    const departurePath = buildFlutterKeyframes({
      baseScaleEnd: contactRestScale,
      baseScaleStart: contactRestScale,
      controlA: {
        x: contactRestX + returnDepartureVector.x * 0.34,
        y: contactRestY + returnDepartureVector.y * 0.34,
      },
      controlB: {
        x: contactRestX + returnDepartureVector.x * 0.84,
        y: contactRestY + returnDepartureVector.y * 0.84,
      },
      end: departurePoint,
      flutterAmplitude: 0.12,
      flutterPhase: 0.24,
      flutterWaves: 0.36,
      frames: 18,
      start: contactPoint,
      tiltEnd: contactRestRotate,
      tiltStart: contactRestRotate,
    });
    const stitchedDepartureRotate = unwrapAngles([
      approachEndHeading,
      ...departurePath.rotate.slice(1),
    ]);
    const departureEndHeading =
      stitchedDepartureRotate[stitchedDepartureRotate.length - 1] ?? approachEndHeading;

    await butterflyControls.start({
      x: departurePath.x,
      y: departurePath.y,
      rotate: stitchedDepartureRotate,
      scale: departurePath.scale,
      opacity: 1,
      transition: {
        duration: 0.34,
        ease: flightEase,
        times: departurePath.progress,
      },
    });

    const bankLeadVector = vectorFromHeading(
      departureEndHeading,
      Math.min(22, Math.max(13, Math.hypot(dx, dy) * 0.032 + 8)),
    );
    const bankSweepPoint = {
      x:
        departurePoint.x +
        Math.sign(dx || -1) * Math.min(36, Math.max(18, Math.abs(dx) * 0.05 + 12)),
      y:
        departurePoint.y +
        Math.sign(dy || 1) * Math.min(30, Math.max(16, Math.abs(dy) * 0.05 + 11)),
    } satisfies Point;
    const bankExitHeading =
      (dx <= 0 ? 1 : -1) * Math.min(58, Math.max(34, Math.abs(dx) * 0.045 + 26));
    const bankExitVector = vectorFromHeading(
      bankExitHeading,
      Math.min(24, Math.max(14, Math.hypot(dx, dy) * 0.028 + 10)),
    );
    const bankPath = buildFlutterKeyframes({
      baseScaleEnd: contactRestScale + 0.008,
      baseScaleStart: contactRestScale,
      controlA: {
        x: departurePoint.x + bankLeadVector.x,
        y: departurePoint.y + bankLeadVector.y,
      },
      controlB: {
        x: bankSweepPoint.x - bankExitVector.x,
        y: bankSweepPoint.y - bankExitVector.y,
      },
      end: bankSweepPoint,
      flutterAmplitude: Math.min(0.95, Math.abs(dx) * 0.0024 + 0.36),
      flutterPhase: 0.48,
      flutterWaves: 0.52,
      frames: 28,
      start: departurePoint,
      tiltEnd: 0,
      tiltStart: contactRestRotate * 0.18,
    });
    const stitchedBankRotate = unwrapAngles([
      departureEndHeading,
      ...bankPath.rotate.slice(1),
    ]);
    const bankEndHeading =
      stitchedBankRotate[stitchedBankRotate.length - 1] ?? departureEndHeading;

    await butterflyControls.start({
      x: bankPath.x,
      y: bankPath.y,
      rotate: stitchedBankRotate,
      scale: bankPath.scale,
      opacity: 1,
      transition: {
        duration: 0.64,
        ease: flightEase,
        times: bankPath.progress,
      },
    });

    const returnArrivalHeading =
      (dx <= 0 ? 1 : -1) * Math.min(42, Math.max(26, Math.abs(dx) * 0.034 + 20));
    const returnArrivalVector = vectorFromHeading(
      returnArrivalHeading,
      Math.min(25, Math.max(15, Math.hypot(dx, dy) * 0.03 + 12)),
    );
    const returnLeadVector = vectorFromHeading(
      bankEndHeading,
      Math.min(24, Math.max(15, Math.hypot(dx, dy) * 0.034 + 9)),
    );
    const returnControlA = {
      x: bankSweepPoint.x + returnLeadVector.x,
      y: bankSweepPoint.y + returnLeadVector.y,
    } satisfies Point;
    const returnControlB = {
      x:
        startPoint.x -
        returnArrivalVector.x +
        Math.sign(dx || -1) * Math.min(12, Math.max(5, Math.abs(dx) * 0.018)),
      y:
        startPoint.y -
        returnArrivalVector.y -
        Math.min(16, Math.max(8, Math.abs(dy) * 0.03 + 5)),
    } satisfies Point;

    const returnPath = buildFlutterKeyframes({
      baseScaleEnd: 1,
      baseScaleStart: bankPath.scale[bankPath.scale.length - 1] ?? contactRestScale,
      controlA: returnControlA,
      controlB: returnControlB,
      end: startPoint,
      flutterAmplitude: Math.min(3.3, Math.abs(dx) * 0.008 + 1.8),
      flutterPhase: 0.88,
      flutterWaves: 0.94,
      frames: 92,
      start: bankSweepPoint,
      tiltEnd: 0,
      tiltStart: 0,
    });
    const stitchedReturnRotate = unwrapAngles([
      bankEndHeading,
      ...returnPath.rotate.slice(1),
    ]);

    await butterflyControls.start({
      x: returnPath.x,
      y: returnPath.y,
      rotate: stitchedReturnRotate,
      scale: returnPath.scale,
      opacity: 1,
      transition: {
        duration: 1.82,
        ease: flightEase,
        times: returnPath.progress,
      },
    });

    await butterflyControls.start({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    });
    setHasBloomed(true);
    setIsBlooming(false);
    setIsFlying(false);
    busyRef.current = false;
  }, [
    butterflyControls,
    geometry,
    measureGeometry,
    spawnParticles,
    tintControls,
  ]);

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
        showGraphic={!geometry}
      />

      {geometry ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-[24] overflow-visible"
          style={{
            left: geometry.homeX,
            top: geometry.homeY,
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.span
            animate={butterflyControls}
            className="block"
            style={{ willChange: "transform, opacity" }}
          >
            <PhilosophyButterflyGraphic
              className={motionClassName}
              isFlying={isFlying}
            />
          </motion.span>
        </span>
      ) : null}

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
                <GradientText
                  className="m-0 h-full w-full bg-transparent p-0 [font:inherit] cursor-default"
                  textClassName="block [font:inherit] leading-[inherit] tracking-[inherit]"
                  colors={["#FFB86C","#FF79C6","#BD93F9","#8BE9FD","#50FA7B","#FFB86C"]}
                  animationSpeed={6.8}
                  direction="horizontal-reverse"
                  pauseOnHover={false}
                  showBorder={false}
                  yoyo={false}
                >
                  {quoteParts.target}
                </GradientText>
              </motion.span>
            </motion.span>
          </span>
        ) : null}
        {afterMetallicParts.before}
        {afterMetallicParts.target ? (
          <MetallicInlineWord className="mx-[0.01em]" text={afterMetallicParts.target} />
        ) : null}
        {afterMetallicParts.after}
      </p>
    </div>
  );
});

export default PhilosophyPollination;
