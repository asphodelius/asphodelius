"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useId } from "react";

type StoryFlowerProps = {
  progress: MotionValue<number>;
  hoveredProject: number | null;
  hoveredSkillLeaf: number | null;
  activeProjectLabel?: string | null;
  activeSkillLabel?: string | null;
  activeSkillAccent?: string | null;
  className?: string;
  idPrefix?: string;
};

const outerPetalPalette = [
  { stroke: "#f7b2d0", fill: "rgba(247, 178, 208, 0.24)" },
  { stroke: "#f1d17a", fill: "rgba(241, 209, 122, 0.22)" },
  { stroke: "#99d9ff", fill: "rgba(153, 217, 255, 0.22)" },
  { stroke: "#98e1bb", fill: "rgba(152, 225, 187, 0.22)" },
  { stroke: "#cbb5ff", fill: "rgba(203, 181, 255, 0.22)" },
  { stroke: "#ffc89d", fill: "rgba(255, 200, 157, 0.22)" },
] as const;

const innerPetalPalette = [
  { stroke: "#ffd7ea", fill: "rgba(255, 215, 234, 0.2)" },
  { stroke: "#ffe8a8", fill: "rgba(255, 232, 168, 0.18)" },
  { stroke: "#d4f0ff", fill: "rgba(212, 240, 255, 0.18)" },
  { stroke: "#d7ffe7", fill: "rgba(215, 255, 231, 0.18)" },
  { stroke: "#e4d7ff", fill: "rgba(228, 215, 255, 0.18)" },
  { stroke: "#ffe1bf", fill: "rgba(255, 225, 191, 0.18)" },
] as const;

const outerPetalPaths = [
  "M210 154C219.389 154 227 128.928 227 98C227 67.0721 219.389 42 210 42C200.611 42 193 67.0721 193 98C193 128.928 200.611 154 210 154Z",
  "M208.268 153C212.962 161.131 238.481 155.186 265.265 139.722C292.05 124.258 309.957 105.131 305.263 97C300.568 88.869 275.05 94.8136 248.265 110.278C221.481 125.742 203.574 144.869 208.268 153Z",
  "M208.268 151C203.574 159.131 221.481 178.258 248.265 193.722C275.05 209.186 300.568 215.131 305.263 207C309.957 198.869 292.05 179.742 265.265 164.278C238.481 148.814 212.962 142.869 208.268 151Z",
  "M210 150C200.611 150 193 175.072 193 206C193 236.928 200.611 262 210 262C219.389 262 227 236.928 227 206C227 175.072 219.389 150 210 150Z",
  "M211.732 151C207.038 142.869 181.519 148.814 154.735 164.278C127.95 179.742 110.043 198.869 114.737 207C119.432 215.131 144.95 209.186 171.735 193.722C198.519 178.258 216.426 159.131 211.732 151Z",
  "M211.732 153C216.426 144.869 198.519 125.742 171.735 110.278C144.95 94.8136 119.432 88.869 114.737 97C110.043 105.131 127.95 124.258 154.735 139.722C181.519 155.186 207.038 161.131 211.732 153Z",
] as const;

const innerPetalPaths = [
  "M210 152C214.783 154.761 227.391 141.878 238.16 123.225C248.93 104.572 253.783 87.2114 249 84.45C244.217 81.6886 231.609 94.5716 220.84 113.225C210.07 131.878 205.217 149.239 210 152Z",
  "M210 152C210 157.523 227.461 162 249 162C270.539 162 288 157.523 288 152C288 146.477 270.539 142 249 142C227.461 142 210 146.477 210 152Z",
  "M210 152C205.217 154.761 210.07 172.122 220.84 190.775C231.609 209.428 244.217 222.311 249 219.55C253.783 216.789 248.93 199.428 238.16 180.775C227.391 162.122 214.783 149.239 210 152Z",
  "M210 152C205.217 149.239 192.609 162.122 181.84 180.775C171.07 199.428 166.217 216.789 171 219.55C175.783 222.311 188.391 209.428 199.16 190.775C209.93 172.122 214.783 154.761 210 152Z",
  "M210 152C210 146.477 192.539 142 171 142C149.461 142 132 146.477 132 152C132 157.523 149.461 162 171 162C192.539 162 210 157.523 210 152Z",
  "M210 152C214.783 149.239 209.93 131.878 199.16 113.225C188.391 94.5716 175.783 81.6886 171 84.45C166.217 87.2114 171.07 104.572 181.84 123.225C192.609 141.878 205.217 154.761 210 152Z",
] as const;

const skillLeaves = [
  {
    path: "M172 649C153 639 138 623 130 599C146 606 163 623 172 649Z",
    sidePath: "M172 648C155.846 634.636 140.769 619.045 130 599",
    cx: 130,
    cy: 599,
  },
  {
    path: "M176 601C197 585 214 566 223 541C205 548 189 566 176 601Z",
    sidePath: "M177 599C194.773 582.609 209.409 563.696 223 541",
    cx: 223,
    cy: 541,
  },
  {
    path: "M181 536C163 525 147 509 139 486C156 493 171 509 181 536Z",
    sidePath: "M181 536C165.25 522.047 150.55 505.767 139 486",
    cx: 139,
    cy: 486,
  },
  {
    path: "M181 430C199 416.933 216 398.267 226 374C208 380.533 192 398.267 181 430Z",
    sidePath: "M181 430C196 415.702 211 396.638 226 374",
    cx: 226,
    cy: 374,
  },
  {
    path: "M178 392C163 382 150 367 141 345C156 351 170 365 178 392Z",
    sidePath: "M179 392C165.588 378.744 151.059 363.077 141 345",
    cx: 141,
    cy: 345,
  },
  {
    path: "M180 333C195 322 209 307 219 285C203 290 190 304 180 333Z",
    sidePath: "M180 333C192.649 319.8 206.351 303 219 285",
    cx: 219,
    cy: 285,
  },
] as const;

const projectBranches = [
  { path: "M180 564C142 542 112 520 84 488", cx: 84, cy: 488 },
  { path: "M179 447C216.938 426.923 244.443 395.692 271 360", cx: 271, cy: 360 },
  { path: "M180 348C150 330 126 306 106 274", cx: 106, cy: 274 },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const hexToRgba = (color: string, alpha: number) => {
  const normalized = color.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(245, 239, 226, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const getTooltipLayout = (cx: number, cy: number, label: string) => {
  const width = clamp(label.length * 7.2 + 20, 52, 260);
  const height = 28;
  const placeRight = cx < 210;
  const rectX = placeRight
    ? clamp(cx + 16, 12, 420 - width - 12)
    : clamp(cx - width - 16, 12, 420 - width - 12);
  const rectY = clamp(cy - 34, 16, 840 - height - 16);

  return {
    rectX,
    rectY,
    width,
    height,
    textX: rectX + 10,
    textY: rectY + height / 2 + 0.5,
    attachX: placeRight ? rectX : rectX + width,
    attachY: rectY + height / 2,
    controlX: placeRight ? rectX - 18 : rectX + width + 18,
  };
};

export function StoryFlower({
  progress,
  hoveredProject,
  hoveredSkillLeaf,
  activeProjectLabel,
  activeSkillLabel,
  activeSkillAccent,
  className,
  idPrefix,
}: StoryFlowerProps) {
  const reactId = useId().replace(/:/g, "");
  const instanceId = (idPrefix ?? reactId).replace(/:/g, "");
  const stemGradientId = `stem-gradient-${instanceId}`;
  const glowId = `bloom-glow-${instanceId}`;
  const activeGlowId = `active-glow-${instanceId}`;
  const growthClipId = `growth-clip-${instanceId}`;

  const growthRevealTop = useTransform(progress, [0.03, 0.58], [650, 112]);
  const stemOpacity = useTransform(progress, [0.03, 0.18], [0.22, 1]);
  const leafOpacity = [
    useTransform(progress, [0.12, 0.24], [0, 1]),
    useTransform(progress, [0.26, 0.39], [0, 1]),
  ];
  const branchOpacity = [
    useTransform(progress, [0.24, 0.35], [0, 1]),
    useTransform(progress, [0.33, 0.48], [0, 1]),
    useTransform(progress, [0.43, 0.58], [0, 1]),
  ];
  const branchBudOpacity = useTransform(progress, [0.3, 0.62], [0, 1]);
  const bloomScale = useTransform(progress, [0.62, 0.92], [0.44, 1]);
  const innerBloomScale = useTransform(progress, [0.68, 0.95], [0.32, 1]);
  const bloomOpacity = useTransform(progress, [0.58, 0.82], [0, 1]);
  const bloomGlowOpacity = useTransform(progress, [0.58, 0.9], [0, 0.9]);
  const stamenOpacity = useTransform(progress, [0.72, 0.96], [0, 1]);
  const petalColorOpacity = useTransform(progress, [0.82, 0.96], [0, 1]);
  const stemDrift = useTransform(progress, [0, 1], [10, -6]);

  const activeSkillColor = activeSkillAccent ?? "#f5efe2";
  const branchAccent = (index: number) =>
    hoveredProject === index ? "#f5efe2" : "rgba(232, 227, 217, 0.78)";
  const skillLeafAccent = (index: number) =>
    hoveredSkillLeaf === index ? activeSkillColor : "rgba(232, 227, 217, 0.52)";

  const flowerTooltip =
    hoveredSkillLeaf !== null && activeSkillLabel
      ? {
          label: activeSkillLabel,
          tone: activeSkillColor,
          anchor: skillLeaves[hoveredSkillLeaf],
        }
      : hoveredProject !== null && activeProjectLabel
        ? {
            label: activeProjectLabel,
            tone: "#f5efe2",
            anchor: projectBranches[hoveredProject],
          }
        : null;

  const tooltipLayout = flowerTooltip
    ? getTooltipLayout(
        flowerTooltip.anchor.cx,
        flowerTooltip.anchor.cy,
        flowerTooltip.label,
      )
    : null;

  return (
    <motion.svg
      className={className}
      viewBox="0 0 420 840"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={stemGradientId} x1="108" y1="780" x2="242" y2="124">
          <stop offset="0%" stopColor="rgba(232, 227, 217, 0.26)" />
          <stop offset="52%" stopColor="rgba(232, 227, 217, 0.82)" />
          <stop offset="100%" stopColor="#f5efe2" />
        </linearGradient>
        <radialGradient
          id={glowId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(210 152) rotate(90) scale(108)"
        >
          <stop offset="0%" stopColor="rgba(232, 227, 217, 0.44)" />
          <stop offset="58%" stopColor="rgba(232, 227, 217, 0.18)" />
          <stop offset="100%" stopColor="rgba(232, 227, 217, 0)" />
        </radialGradient>
        <filter
          id={activeGlowId}
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={growthClipId}>
          <motion.rect x="0" width="420" height="760" style={{ y: growthRevealTop }} />
        </clipPath>
      </defs>

      <motion.g style={{ y: stemDrift }}>
        <motion.circle
          cx="210"
          cy="152"
          r="116"
          fill={`url(#${glowId})`}
          style={{ opacity: bloomGlowOpacity }}
        />

        <g opacity="0.26">
          <path
            d="M172 782C174 722 168 664 180 564C190 468 162 352 196 244C206 213 212 181 210 150"
            stroke="rgba(232, 227, 217, 0.42)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M174.83 612.5C147.83 597.5 127.83 574.5 112.83 538.5C139.83 546.5 160.83 569.5 174.83 612.5Z"
            stroke="rgba(232, 227, 217, 0.42)"
            fill="rgba(232, 227, 217, 0.05)"
            strokeWidth="1.05"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M184 491C217 468 242 438 254 398C225 410 202 442 184 491Z"
            stroke="rgba(232, 227, 217, 0.38)"
            fill="rgba(232, 227, 217, 0.04)"
            strokeWidth="1.05"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {projectBranches.map((branch) => (
            <path
              key={`scaffold-branch-${branch.cx}`}
              d={branch.path}
              stroke="rgba(232, 227, 217, 0.4)"
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {outerPetalPaths.map((path) => (
            <path
              key={`scaffold-${path}`}
              d={path}
              stroke="rgba(232, 227, 217, 0.38)"
              strokeWidth="0.95"
              fill="rgba(232, 227, 217, 0.02)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {skillLeaves.map((leaf, index) => {
          const isActive = hoveredSkillLeaf === index;

          return (
            <motion.g
              key={`skill-leaf-${leaf.cx}`}
              animate={
                isActive
                  ? { scale: [1, 1.03, 1], y: [0, -1.5, 0] }
                  : { scale: 1, y: 0 }
              }
              transition={
                isActive
                  ? {
                      duration: 1.9,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    }
                  : { duration: 0.18, ease: "easeOut" }
              }
              style={{ transformOrigin: `${leaf.cx}px ${leaf.cy}px` }}
            >
              {isActive ? (
                <>
                  <motion.path
                    d={leaf.path}
                    stroke={activeSkillColor}
                    strokeWidth="7.5"
                    fill="none"
                    filter={`url(#${activeGlowId})`}
                    vectorEffect="non-scaling-stroke"
                    animate={{ opacity: [0.12, 0.28, 0.12] }}
                    transition={{
                      duration: 1.9,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  <motion.path
                    d={leaf.sidePath}
                    stroke={activeSkillColor}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    filter={`url(#${activeGlowId})`}
                    vectorEffect="non-scaling-stroke"
                    animate={{ opacity: [0.12, 0.26, 0.12] }}
                    transition={{
                      duration: 1.9,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  <motion.circle
                    cx={leaf.cx}
                    cy={leaf.cy}
                    r="8.5"
                    fill={hexToRgba(activeSkillColor, 0.34)}
                    filter={`url(#${activeGlowId})`}
                    style={{ transformOrigin: `${leaf.cx}px ${leaf.cy}px` }}
                    animate={{
                      opacity: [0.18, 0.42, 0.18],
                      scale: [1, 1.38, 1],
                    }}
                    transition={{
                      duration: 1.9,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                </>
              ) : null}
              <path
                d={leaf.path}
                stroke={skillLeafAccent(index)}
                fill={
                  isActive
                    ? hexToRgba(activeSkillColor, 0.16)
                    : "rgba(232, 227, 217, 0.08)"
                }
                strokeWidth={isActive ? 1.55 : 1.05}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={leaf.sidePath}
                stroke={skillLeafAccent(index)}
                strokeWidth={isActive ? 1.8 : 0.9}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={leaf.cx}
                cy={leaf.cy}
                r={isActive ? 4.8 : 2.5}
                fill={isActive ? activeSkillColor : "rgba(232, 227, 217, 0.52)"}
              />
            </motion.g>
          );
        })}

        <g clipPath={`url(#${growthClipId})`}>
          <motion.path
            d="M172 782C174 722 168 664 180 564C190 468 162 352 196 244C206 213 212 181 210 150"
            stroke={`url(#${stemGradientId})`}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: stemOpacity }}
          />

          <motion.path
            d="M174.83 612.5C147.83 597.5 127.83 574.5 112.83 538.5C139.83 546.5 160.83 569.5 174.83 612.5Z"
            stroke="rgba(232, 227, 217, 0.82)"
            fill="rgba(232, 227, 217, 0.08)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: leafOpacity[0] }}
          />

          <motion.path
            d="M184 491C217 468 242 438 254 398C225 410 202 442 184 491Z"
            stroke="rgba(232, 227, 217, 0.76)"
            fill="rgba(232, 227, 217, 0.06)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: leafOpacity[1] }}
          />

          {projectBranches.map((branch, index) => {
            const isActive = hoveredProject === index;

            return (
              <motion.g
                key={`project-branch-${branch.cx}`}
                animate={
                  isActive
                    ? { scale: [1, 1.018, 1], x: [0, 1.2, 0], y: [0, -1, 0] }
                    : { scale: 1, x: 0, y: 0 }
                }
                transition={
                  isActive
                    ? {
                        duration: 1.75,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                      }
                    : { duration: 0.18, ease: "easeOut" }
                }
                style={{ transformOrigin: `${branch.cx}px ${branch.cy}px` }}
              >
                {isActive ? (
                  <>
                    <motion.path
                      d={branch.path}
                      stroke="#f5efe2"
                      strokeWidth="7.5"
                      strokeLinecap="round"
                      filter={`url(#${activeGlowId})`}
                      vectorEffect="non-scaling-stroke"
                      animate={{ opacity: [0.12, 0.24, 0.12] }}
                      transition={{
                        duration: 1.75,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                    <motion.circle
                      cx={branch.cx}
                      cy={branch.cy}
                      r="11"
                      fill="rgba(245, 239, 226, 0.3)"
                      filter={`url(#${activeGlowId})`}
                      style={{ transformOrigin: `${branch.cx}px ${branch.cy}px` }}
                      animate={{
                        opacity: [0.16, 0.38, 0.16],
                        scale: [1, 1.34, 1],
                      }}
                      transition={{
                        duration: 1.75,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  </>
                ) : null}
                <motion.path
                  d={branch.path}
                  stroke={branchAccent(index)}
                  strokeWidth={isActive ? 2.35 : 1.15}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: branchOpacity[index] }}
                />
                <motion.circle
                  cx={branch.cx}
                  cy={branch.cy}
                  r={isActive ? 6.9 : 4.5}
                  fill={isActive ? "#f5efe2" : "rgba(232, 227, 217, 0.72)"}
                  style={{ opacity: branchBudOpacity }}
                />
              </motion.g>
            );
          })}
        </g>

        {flowerTooltip && tooltipLayout ? (
          <motion.g
            pointerEvents="none"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <motion.path
              d={`M${flowerTooltip.anchor.cx} ${flowerTooltip.anchor.cy} Q${tooltipLayout.controlX} ${flowerTooltip.anchor.cy} ${tooltipLayout.attachX} ${tooltipLayout.attachY}`}
              stroke={hexToRgba(flowerTooltip.tone, 0.5)}
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
            <rect
              x={tooltipLayout.rectX - 2}
              y={tooltipLayout.rectY - 2}
              width={tooltipLayout.width + 4}
              height={tooltipLayout.height + 4}
              rx="16"
              fill={hexToRgba(flowerTooltip.tone, 0.24)}
              filter={`url(#${activeGlowId})`}
              opacity="0.86"
            />
            <rect
              x={tooltipLayout.rectX}
              y={tooltipLayout.rectY}
              width={tooltipLayout.width}
              height={tooltipLayout.height}
              rx="15"
              fill="rgba(8, 8, 8, 0.84)"
              stroke="rgba(245, 239, 226, 0.14)"
              strokeWidth="0.8"
            />
            <text
              x={tooltipLayout.textX}
              y={tooltipLayout.textY}
              fill="#f5efe2"
              fontSize="11"
              letterSpacing="0.06em"
              dominantBaseline="middle"
              fontFamily="var(--font-mono), IBM Plex Mono, monospace"
            >
              {flowerTooltip.label}
            </text>
          </motion.g>
        ) : null}

        <motion.g
          style={{
            opacity: bloomOpacity,
            scale: bloomScale,
            transformOrigin: "210px 152px",
          }}
        >
          {outerPetalPaths.map((path, index) => (
            <g key={`outer-${index}`}>
              <path
                d={path}
                stroke="rgba(232, 227, 217, 0.98)"
                strokeWidth="1.35"
                fill="rgba(232, 227, 217, 0.05)"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={path}
                stroke={outerPetalPalette[index].stroke}
                strokeWidth="1.55"
                fill={outerPetalPalette[index].fill}
                vectorEffect="non-scaling-stroke"
                style={{ opacity: petalColorOpacity }}
              />
            </g>
          ))}
        </motion.g>

        <motion.g
          style={{
            opacity: bloomOpacity,
            scale: innerBloomScale,
            transformOrigin: "210px 152px",
          }}
        >
          {innerPetalPaths.map((path, index) => (
            <g key={`inner-${index}`}>
              <path
                d={path}
                stroke="rgba(232, 227, 217, 0.74)"
                strokeWidth="1.15"
                fill="rgba(232, 227, 217, 0.03)"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={path}
                stroke={innerPetalPalette[index].stroke}
                strokeWidth="1.3"
                fill={innerPetalPalette[index].fill}
                vectorEffect="non-scaling-stroke"
                style={{ opacity: petalColorOpacity }}
              />
            </g>
          ))}
        </motion.g>

        <motion.circle
          cx="210"
          cy="152"
          r="11"
          fill="#e8e3d9"
          style={{ opacity: stamenOpacity }}
        />
        <motion.circle
          cx="207"
          cy="149"
          r="3.5"
          fill="rgba(10, 10, 10, 0.22)"
          style={{ opacity: stamenOpacity }}
        />
      </motion.g>
    </motion.svg>
  );
}
