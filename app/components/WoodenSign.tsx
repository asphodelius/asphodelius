'use client';

import { motion } from 'framer-motion';

export function WoodenSign() {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-center z-30 pointer-events-none">
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ y: -380, rotate: -0.4 }}
        animate={{ y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 48,
          damping: 12,
          mass: 1.8,
          delay: 0.25,
        }}
      >
        {/* Ropes and rings */}
        <div
          className="flex justify-between items-start px-12"
          style={{ width: 'clamp(310px, 82vw, 930px)', height: '106px' }}
        >
          <div className="relative w-[10px] h-full">
            <div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[6px] h-[82px] rounded-full"
              style={{
                background:
                  'repeating-linear-gradient(180deg, #936e43 0px, #b28654 5px, #7f5a36 10px)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.26)',
              }}
            />
            <div
              className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[22px] h-[22px] rounded-full"
              style={{
                border: '4px solid #4e4b45',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.18), 0 2px 4px rgba(0,0,0,0.28)',
              }}
            />
          </div>

          <div className="relative w-[10px] h-full">
            <div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[6px] h-[82px] rounded-full"
              style={{
                background:
                  'repeating-linear-gradient(180deg, #8c653f 0px, #b58a5a 4px, #7c5634 9px)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.26)',
              }}
            />
            <div
              className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[22px] h-[22px] rounded-full"
              style={{
                border: '4px solid #4e4b45',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.18), 0 2px 4px rgba(0,0,0,0.28)',
              }}
            />
          </div>
        </div>

        {/* Main plank */}
        <div
          className="relative sign-sway"
          style={{
            width: 'clamp(320px, 84vw, 940px)',
            padding: '2.3rem 4.3rem 2rem',
            transform: 'rotate(-1deg)',
            background: `
              linear-gradient(180deg,
                #a96f35 0%,
                #9a622f 14%,
                #875427 38%,
                #7a4c24 55%,
                #8f5a2b 78%,
                #754621 100%
              )
            `,
            border: '3px solid #5d3518',
            borderRadius: '24px 26px 20px 22px / 14px 16px 10px 12px',
            boxShadow: `
              inset 0 2px 6px rgba(255, 222, 168, 0.18),
              inset 0 -4px 8px rgba(39, 21, 9, 0.32),
              0 16px 26px rgba(0, 0, 0, 0.34)
            `,
            textAlign: 'center' as const,
          }}
        >
          <div
            className="absolute -left-[2.6%] top-[6%] h-[80%] w-[6.4%]"
            style={{
              background: 'linear-gradient(180deg, #7d4b21 0%, #65391b 100%)',
              transform: 'rotate(7deg)',
              borderRadius: '8px',
            }}
          />
          <div
            className="absolute -right-[2.6%] top-[8%] h-[76%] w-[6.2%]"
            style={{
              background: 'linear-gradient(180deg, #7d4b21 0%, #65391b 100%)',
              transform: 'rotate(-8deg)',
              borderRadius: '8px',
            }}
          />

          {/* Wood grain texture */}
          <div
            className="absolute inset-0 rounded-[inherit] overflow-hidden opacity-[0.26]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  6deg,
                  transparent,
                  transparent 10px,
                  rgba(56,27,12,0.3) 10px,
                  rgba(56,27,12,0.3) 12px
                ),
                radial-gradient(circle at 18% 34%, rgba(255,255,255,0.16), rgba(255,255,255,0) 36%)
              `,
            }}
          />

          {/* Nails */}
          {[
            { top: 13, left: 24 },
            { top: 13, right: 24 },
            { bottom: 12, left: 34 },
            { bottom: 14, right: 34 },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-[14px] h-[14px] rounded-full"
              style={{
                ...pos,
                background:
                  'radial-gradient(circle at 35% 35%, #a4abb3, #6e747c, #484d54)',
                boxShadow:
                  'inset 0 -1px 2px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.3)',
              }}
            />
          ))}

          {/* Lantern */}
          <div className="absolute left-[2.2%] top-[28%] hidden md:block">
            <svg width="58" height="92" viewBox="0 0 58 92" fill="none" aria-hidden>
              <path d="M29 3 L39 16 H19 L29 3Z" fill="#5d3a1d" />
              <rect x="17" y="16" width="24" height="42" rx="6" fill="#4f2f16" stroke="#2e190b" strokeWidth="2" />
              <rect x="22" y="24" width="14" height="25" rx="4" fill="#f9d764" opacity="0.92" />
              <path d="M19 58 H39 L34 84 H24 L19 58Z" fill="#385168" />
            </svg>
          </div>

          {/* Floral details */}
          <div className="absolute left-[6%] top-[7%] hidden lg:flex gap-1">
            {['#7a4cb8', '#af76d8', '#8760c8'].map((shade, idx) => (
              <div
                key={idx}
                className="relative rounded-full"
                style={{ width: '14px', height: '14px', background: shade, boxShadow: '0 0 0 2px rgba(255,255,255,0.22)' }}
              >
                <span
                  className="absolute rounded-full"
                  style={{ width: '5px', height: '5px', background: '#f7e6b5', left: '4px', top: '4px' }}
                />
              </div>
            ))}
          </div>
          <div className="absolute right-[8%] top-[10%] hidden lg:flex gap-1">
            {['#9b63da', '#c086ea', '#874fca'].map((shade, idx) => (
              <div
                key={idx}
                className="relative rounded-full"
                style={{ width: '13px', height: '13px', background: shade, boxShadow: '0 0 0 2px rgba(255,255,255,0.2)' }}
              >
                <span
                  className="absolute rounded-full"
                  style={{ width: '5px', height: '5px', background: '#f7e6b5', left: '4px', top: '4px' }}
                />
              </div>
            ))}
          </div>
          <div
            className="absolute right-[15%] top-[11%] hidden lg:block"
            style={{
              width: '3.4rem',
              height: '1.4rem',
              borderRadius: '100% 100% 60% 60%',
              background: 'linear-gradient(180deg, #4380e0 0%, #2b57a6 100%)',
              transform: 'rotate(8deg)',
            }}
          />

          {/* Title */}
          <h1
            className="relative z-10 font-sign tracking-[0.02em]"
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 6rem)',
              color: '#f8dc86',
              textShadow: `
                0 3px 4px rgba(45, 23, 10, 0.5),
                0 0 8px rgba(255, 216, 132, 0.2)
              `,
              letterSpacing: '0.01em',
              lineHeight: 1.2,
            }}
          >
            Asphodelius
          </h1>
        </div>
      </motion.div>
    </div>
  );
}
