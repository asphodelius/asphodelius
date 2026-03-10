'use client';

import { motion } from 'framer-motion';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function seededValue(seed: number) {
  const raw = Math.sin(seed * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
}

const STARS: Star[] = Array.from({ length: 90 }, (_, i) => {
  const seedBase = i + 1;
  const size = seededValue(seedBase * 3.3) * 2.5 + 0.8;

  return {
    id: i,
    x: seededValue(seedBase * 1.1) * 100,
    y: seededValue(seedBase * 2.1) * 65,
    size,
    delay: seededValue(seedBase * 4.7) * 4,
    duration: seededValue(seedBase * 5.9) * 2 + 1.5,
  };
});

export function Stars() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.size > 2 ? '#E2E8F0' : '#F4F7FB',
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* A few larger "bright" stars */}
      {STARS.slice(0, 6).map((star) => (
        <div
          key={`glow-${star.id}`}
          className="absolute rounded-full star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size * 3}px`,
            height: `${star.size * 3}px`,
            backgroundColor: 'transparent',
            boxShadow: `0 0 ${star.size * 4}px ${star.size}px rgba(186, 203, 226, 0.22)`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            transform: 'translate(-33%, -33%)',
          }}
        />
      ))}
    </motion.div>
  );
}
