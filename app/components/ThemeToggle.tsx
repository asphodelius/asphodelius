'use client';

import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border-0 outline-none"
      style={{
        background: isLight
          ? 'radial-gradient(circle at 35% 35%, #E8DCA8, #CDAE63)'
          : 'radial-gradient(circle at 35% 35%, #D5D7DD, #8E95A3)',
        boxShadow: isLight
          ? '0 6px 18px rgba(84, 62, 20, 0.25), inset 0 1px 2px rgba(255,255,255,0.35)'
          : '0 6px 18px rgba(16, 18, 26, 0.45), inset 0 1px 2px rgba(255,255,255,0.2)',
        border: isLight ? '1px solid rgba(108, 80, 32, 0.45)' : '1px solid rgba(207, 216, 236, 0.25)',
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      animate={{ rotate: isLight ? 0 : 180 }}
      transition={{ type: 'spring', stiffness: 170, damping: 16 }}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      <motion.div
        animate={{ rotate: isLight ? 0 : -180 }}
        transition={{ type: 'spring', stiffness: 170, damping: 16 }}
      >
        {isLight ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4.4" fill="#F5E8B8" stroke="#8A6B2D" strokeWidth="1.2" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <line
                key={angle}
                x1="12"
                y1="12"
                x2={12 + 8.3 * Math.cos((angle * Math.PI) / 180)}
                y2={12 + 8.3 * Math.sin((angle * Math.PI) / 180)}
                stroke="#8A6B2D"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.6"
              />
            ))}
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              fill="#D9DFEB"
              stroke="#798396"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="9" r="0.8" fill="#B6BECD" opacity="0.45" />
            <circle cx="11" cy="14" r="1.2" fill="#B6BECD" opacity="0.35" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}
