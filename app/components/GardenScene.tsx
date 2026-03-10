'use client';

import { GrassSection } from './GrassSection';
import { WoodenSign } from './WoodenSign';

const CLOUDS = [
  { top: '10%', left: '-14%', width: '22rem', height: '6rem', delay: '0s', duration: '54s', opacity: 0.58 },
  { top: '18%', left: '-20%', width: '28rem', height: '8rem', delay: '8s', duration: '68s', opacity: 0.5 },
  { top: '30%', left: '-10%', width: '24rem', height: '7rem', delay: '18s', duration: '62s', opacity: 0.42 },
  { top: '22%', left: '-28%', width: '20rem', height: '6rem', delay: '27s', duration: '58s', opacity: 0.36 },
];

export function GardenScene() {
  return (
    <main className="relative h-screen min-h-[680px] w-full overflow-hidden select-none">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(130% 80% at 50% 72%, rgba(230, 239, 187, 0.42), rgba(230, 239, 187, 0) 55%),
            linear-gradient(180deg, #2c79d0 0%, #5ea3e6 38%, #9bd0ee 62%, #b8dfdc 76%, #9bc97e 100%)
          `,
        }}
      />

      <div
        className="absolute inset-0 opacity-45 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 16% 20%, rgba(255,255,255,0.18) 0, rgba(255,255,255,0) 40%),
            radial-gradient(circle at 82% 14%, rgba(255,255,255,0.14) 0, rgba(255,255,255,0) 37%),
            repeating-linear-gradient(20deg, rgba(255,255,255,0.03) 0 2px, rgba(255,255,255,0) 2px 5px)
          `,
        }}
      />

      <div
        className="absolute top-[3.5rem] left-[1.5rem] z-20 rounded-full sun-pulse"
        style={{
          width: 'clamp(3.4rem, 8vw, 5.2rem)',
          aspectRatio: '1 / 1',
          background: 'radial-gradient(circle at 35% 35%, #fff4a6 0%, #f7d642 65%, #f3b51f 100%)',
          boxShadow: '0 0 48px rgba(255, 220, 84, 0.5)',
        }}
      >
        <div className="absolute inset-[-34%]">
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className="absolute left-1/2 top-1/2 block"
              style={{
                width: '0.24rem',
                height: '1rem',
                borderRadius: '9999px',
                background: '#f6ce3f',
                transform: `translate(-50%, -50%) rotate(${index * 36}deg) translateY(-2.6rem)`,
                opacity: 0.86,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {CLOUDS.map((cloud, index) => (
          <div
            key={index}
            className="absolute rounded-full cloud-drift"
            style={{
              top: cloud.top,
              left: cloud.left,
              width: cloud.width,
              height: cloud.height,
              opacity: cloud.opacity,
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.36) 45%, rgba(255,255,255,0) 76%)',
              filter: 'blur(1.2px)',
              animationDelay: cloud.delay,
              animationDuration: cloud.duration,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-x-0 bottom-[28%] h-[35%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(118, 165, 202, 0.2) 0%, rgba(98, 136, 165, 0.48) 64%, rgba(72, 104, 122, 0.64) 100%)',
          clipPath:
            'polygon(0% 70%, 8% 58%, 15% 66%, 24% 48%, 34% 62%, 43% 43%, 52% 60%, 62% 46%, 72% 62%, 84% 50%, 100% 70%, 100% 100%, 0% 100%)',
        }}
      />

      <div
        className="absolute left-[16%] bottom-[35%] w-[28%] h-[24%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(190, 215, 213, 0.46) 0%, rgba(147, 184, 160, 0.68) 100%)',
          clipPath:
            'polygon(0% 76%, 10% 62%, 16% 66%, 24% 46%, 34% 53%, 44% 34%, 56% 49%, 68% 38%, 78% 55%, 90% 50%, 100% 62%, 100% 100%, 0% 100%)',
          filter: 'blur(0.5px)',
        }}
      />

      <div
        className="absolute left-[24%] bottom-[33%] w-[5%] h-[22%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(232, 241, 255, 0.74) 0%, rgba(209, 235, 255, 0.58) 45%, rgba(184, 219, 245, 0.24) 100%)',
          clipPath: 'polygon(34% 0, 72% 0, 62% 100%, 22% 100%)',
          filter: 'blur(0.35px)',
        }}
      />

      <div
        className="absolute inset-x-0 bottom-[22%] h-[24%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(156, 205, 137, 0.25) 0%, rgba(119, 180, 98, 0.58) 56%, rgba(80, 133, 70, 0.72) 100%)',
          clipPath:
            'polygon(0% 58%, 9% 62%, 18% 56%, 30% 63%, 43% 54%, 57% 64%, 67% 55%, 78% 63%, 89% 52%, 100% 58%, 100% 100%, 0% 100%)',
        }}
      />

      <div
        className="absolute -left-[6%] bottom-[20%] h-[44%] w-[25%] pointer-events-none"
        style={{
          background:
            'radial-gradient(65% 55% at 60% 38%, rgba(143, 190, 94, 0.95) 0%, rgba(90, 136, 67, 0.92) 55%, rgba(55, 88, 44, 0.82) 100%)',
          borderRadius: '54% 46% 52% 48% / 48% 54% 46% 52%',
          filter: 'drop-shadow(0 8px 10px rgba(34, 56, 30, 0.26))',
        }}
      />
      <div
        className="absolute -right-[7%] bottom-[20%] h-[46%] w-[27%] pointer-events-none"
        style={{
          background:
            'radial-gradient(65% 55% at 40% 40%, rgba(151, 199, 100, 0.94) 0%, rgba(89, 139, 65, 0.92) 56%, rgba(52, 86, 41, 0.84) 100%)',
          borderRadius: '45% 55% 48% 52% / 52% 48% 54% 46%',
          filter: 'drop-shadow(0 8px 10px rgba(34, 56, 30, 0.24))',
        }}
      />

      <div
        className="absolute left-[7%] bottom-[19%] h-[24%] w-[1.25rem] rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #6d4f2f 0%, #4c351f 100%)' }}
      />
      <div
        className="absolute right-[9%] bottom-[19%] h-[25%] w-[1.25rem] rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #6d4f2f 0%, #4c351f 100%)' }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 248, 213, 0.16) 0%, rgba(255, 248, 213, 0) 30%, rgba(39, 64, 37, 0.14) 100%)',
        }}
      />

      <WoodenSign />
      <GrassSection />
    </main>
  );
}
