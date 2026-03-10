'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface FlowerProps {
  x: number;
  skill: string;
  color: string;
  petalColor: string;
  scale?: number;
}

const PETAL_COUNT = 5;

export function Flower({ x, skill, color, petalColor, scale = 1 }: FlowerProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const flowerHeight = 84 * scale;
  const flowerWidth = 46 * scale;

  return (
    <motion.div
      className="absolute flower-sway"
      style={{
        left: `${x}%`,
        bottom: 0,
        transform: 'translateX(-50%)',
        animationDelay: `${(x * 37) % 3}s`,
        animationDuration: `${4 + (x % 1.8)}s`,
        zIndex: Math.round(x),
        cursor: 'default',
      }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 8,
        mass: 0.8,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap z-40 pointer-events-none"
          style={{
            top: -14,
            background: 'rgba(31, 35, 40, 0.88)',
            color: '#E4E8ED',
            border: '1px solid rgba(186, 197, 211, 0.42)',
            boxShadow: '0 3px 12px rgba(0,0,0,0.35)',
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          {skill}
          {/* Tooltip arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45"
            style={{
              background: 'rgba(31, 35, 40, 0.88)',
              borderRight: '1px solid rgba(186, 197, 211, 0.42)',
              borderBottom: '1px solid rgba(186, 197, 211, 0.42)',
            }}
          />
        </motion.div>
      )}

      <svg
        width={flowerWidth}
        height={flowerHeight}
        viewBox="0 0 46 84"
        className="block overflow-visible"
      >
        {/* Stem */}
        <motion.path
          d="M23 82 Q22 62 23 44 Q24 30 23 16"
          fill="none"
          stroke="#3B5F40"
          strokeWidth="2.1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        {/* Left leaf */}
        <motion.path
          d="M23 58 Q15 52 14 46 Q17 51 23 55"
          fill="#4E7A54"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        />

        {/* Right leaf (smaller, higher) */}
        <motion.path
          d="M23 44 Q31 39 32 34 Q29 38 23 42"
          fill="#456C4A"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.3 }}
        />

        {/* Petals */}
        <g transform="translate(23, 14)">
          {Array.from({ length: PETAL_COUNT }).map((_, i) => (
            <motion.ellipse
              key={i}
              cx="0"
              cy="-7"
              rx="4"
              ry="7"
              fill={petalColor}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.82"
              transform={`rotate(${(360 / PETAL_COUNT) * i})`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.55 + i * 0.06,
                type: 'spring',
                stiffness: 200,
                damping: 12,
              }}
            />
          ))}

          {/* Inner petals (smaller, rotated) */}
          {Array.from({ length: PETAL_COUNT }).map((_, i) => (
            <motion.ellipse
              key={`inner-${i}`}
              cx="0"
              cy="-4.3"
              rx="2.2"
              ry="4.2"
              fill={petalColor}
              opacity="0.35"
              transform={`rotate(${(360 / PETAL_COUNT) * i + 22})`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.7 + i * 0.04,
                type: 'spring',
                stiffness: 200,
                damping: 12,
              }}
            />
          ))}

          {/* Center */}
          <motion.circle
            cx="0"
            cy="0"
            r="4"
            fill={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.85,
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
          />
          {/* Center highlight */}
          <motion.circle
            cx="-1"
            cy="-1"
            r="1.2"
            fill="rgba(255,255,255,0.3)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.95 }}
          />
        </g>
      </svg>
    </motion.div>
  );
}
