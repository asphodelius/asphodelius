'use client';

interface SkillBloom {
  id: string;
  x: string;
  stemHeight: number;
  label: string;
  labelStyle: 'cream' | 'charcoal' | 'blue' | 'violet';
  petals: string[];
  center: string;
  icon: string;
}

const BLOOMS: SkillBloom[] = [
  {
    id: 'js',
    x: '13%',
    stemHeight: 112,
    label: 'JavaScript (ES6+)',
    labelStyle: 'cream',
    petals: ['#f8d442', '#f2c818', '#f7de64', '#f1bb16'],
    center: '#8f6518',
    icon: 'JS',
  },
  {
    id: 'react',
    x: '22%',
    stemHeight: 128,
    label: 'React',
    labelStyle: 'blue',
    petals: ['#8bd3ff', '#62b7f5', '#3c98df', '#5fcbff'],
    center: '#f0f8ff',
    icon: 'R',
  },
  {
    id: 'next',
    x: '34%',
    stemHeight: 118,
    label: 'Next.js',
    labelStyle: 'charcoal',
    petals: ['#25282f', '#181a20', '#2d313a', '#343944'],
    center: '#f5f5f5',
    icon: 'N',
  },
  {
    id: 'ts',
    x: '42%',
    stemHeight: 108,
    label: 'TS',
    labelStyle: 'blue',
    petals: ['#4e90df', '#2a6ec2', '#77aced', '#3e81d1'],
    center: '#ecf5ff',
    icon: 'TS',
  },
  {
    id: 'redux',
    x: '52%',
    stemHeight: 122,
    label: 'Redux',
    labelStyle: 'violet',
    petals: ['#ba83f4', '#8c5bd6', '#a971ea', '#7c47cb'],
    center: '#ffd77a',
    icon: 'Rx',
  },
  {
    id: 'rest',
    x: '67%',
    stemHeight: 126,
    label: 'REST API',
    labelStyle: 'cream',
    petals: ['#fcf8e7', '#f2e8ca', '#f8f2dd', '#e8dcbb'],
    center: '#f0bf2c',
    icon: 'API',
  },
  {
    id: 'git',
    x: '79%',
    stemHeight: 114,
    label: 'Git',
    labelStyle: 'charcoal',
    petals: ['#ef6b39', '#d85624', '#fa8c5f', '#cc4b1a'],
    center: '#fff8f4',
    icon: 'G',
  },
  {
    id: 'vite',
    x: '89%',
    stemHeight: 108,
    label: 'Vite',
    labelStyle: 'violet',
    petals: ['#b089ff', '#8d62eb', '#ccabff', '#7951db'],
    center: '#fff1a0',
    icon: 'V',
  },
];

const LABEL_STYLES = {
  cream: {
    background: '#f2e5c8',
    color: '#443822',
    border: '1px solid rgba(121, 96, 55, 0.45)',
  },
  charcoal: {
    background: '#202126',
    color: '#f1f3f6',
    border: '1px solid rgba(255, 255, 255, 0.16)',
  },
  blue: {
    background: '#2f75c7',
    color: '#eaf4ff',
    border: '1px solid rgba(217, 236, 255, 0.26)',
  },
  violet: {
    background: '#7849ce',
    color: '#f4e9ff',
    border: '1px solid rgba(240, 227, 255, 0.32)',
  },
} as const;

export function GrassSection() {
  return (
    <section className="absolute inset-x-0 bottom-0 h-[42%] min-h-[300px] z-40 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(168, 202, 88, 0.2) 0%, rgba(129, 174, 62, 0.72) 34%, rgba(79, 131, 38, 0.92) 100%),
            radial-gradient(90% 70% at 50% 20%, rgba(230, 255, 176, 0.28), rgba(230, 255, 176, 0) 70%)
          `,
        }}
      />

      <div
        className="absolute inset-0 opacity-75"
        style={{
          backgroundImage: `
            repeating-linear-gradient(102deg, rgba(30, 84, 30, 0.34) 0 3px, rgba(30, 84, 30, 0) 3px 12px),
            repeating-linear-gradient(78deg, rgba(186, 235, 91, 0.2) 0 2px, rgba(186, 235, 91, 0) 2px 14px)
          `,
        }}
      />

      <div
        className="absolute inset-x-[-2%] bottom-0 h-[58%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(96, 154, 48, 0.5) 0%, rgba(63, 104, 33, 0.9) 100%)',
          clipPath:
            'polygon(0% 26%, 6% 14%, 11% 20%, 16% 8%, 23% 17%, 29% 9%, 36% 18%, 42% 7%, 49% 19%, 55% 8%, 61% 20%, 68% 10%, 75% 18%, 82% 7%, 88% 16%, 94% 9%, 100% 22%, 100% 100%, 0% 100%)',
        }}
      />

      <div className="absolute left-[7%] bottom-[16%] hidden md:block">
        <svg width="152" height="120" viewBox="0 0 152 120" fill="none" aria-hidden>
          <path
            d="M20 77 C20 60 34 47 51 47 H87 C103 47 117 60 117 77 V96 H20 V77Z"
            fill="#88a1a5"
            stroke="#52646d"
            strokeWidth="3"
          />
          <path d="M95 58 L131 40" stroke="#52646d" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="135" cy="38" rx="12" ry="8" transform="rotate(-30 135 38)" fill="#88a1a5" stroke="#52646d" strokeWidth="3" />
          <path
            d="M42 47 C42 23 60 11 79 11 C95 11 108 22 108 36"
            stroke="#52646d"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="30" y="57" width="10" height="34" rx="4" fill="#a7bcc0" opacity="0.7" />
          <circle cx="129" cy="58" r="3" fill="#78bfd8" />
          <circle cx="137" cy="64" r="3.2" fill="#78bfd8" />
          <circle cx="124" cy="66" r="2.5" fill="#78bfd8" />
        </svg>
      </div>

      <div className="absolute left-0 right-0 top-[7%] h-[58%] px-[4vw]">
        {BLOOMS.map((bloom) => {
          const labelStyles = LABEL_STYLES[bloom.labelStyle];

          return (
            <div
              key={bloom.id}
              className="absolute -translate-x-1/2 bloom-sway"
              style={{
                left: bloom.x,
                bottom: '0%',
                animationDelay: `${parseFloat(bloom.x) / 12}s`,
                animationDuration: `${3.8 + (parseFloat(bloom.x) % 2.6)}s`,
              }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-xl px-3 py-2 text-[clamp(0.65rem,1.2vw,1rem)] leading-none whitespace-nowrap shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
                style={{
                  bottom: `${bloom.stemHeight + 46}px`,
                  background: labelStyles.background,
                  color: labelStyles.color,
                  border: labelStyles.border,
                  fontWeight: 800,
                }}
              >
                {bloom.label}
                <span
                  className="absolute left-1/2 -translate-x-1/2 -bottom-[0.45rem] block h-3 w-3 rotate-45"
                  style={{ background: labelStyles.background, borderRight: labelStyles.border, borderBottom: labelStyles.border }}
                />
              </div>

              <div className="relative" style={{ width: '64px', height: `${bloom.stemHeight + 55}px` }}>
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 rounded-full"
                  style={{
                    width: '8px',
                    height: `${bloom.stemHeight}px`,
                    background: 'linear-gradient(180deg, #5b8a35 0%, #3f6b26 100%)',
                  }}
                />
                <div
                  className="absolute left-[38%] rounded-[80%_20%_80%_20%]"
                  style={{
                    width: '19px',
                    height: '11px',
                    bottom: `${Math.floor(bloom.stemHeight * 0.42)}px`,
                    background: 'linear-gradient(180deg, #86b94a 0%, #5e8d34 100%)',
                    transform: 'rotate(-28deg)',
                  }}
                />
                <div
                  className="absolute right-[38%] rounded-[20%_80%_20%_80%]"
                  style={{
                    width: '17px',
                    height: '10px',
                    bottom: `${Math.floor(bloom.stemHeight * 0.58)}px`,
                    background: 'linear-gradient(180deg, #7eb244 0%, #4d7d2a 100%)',
                    transform: 'rotate(24deg)',
                  }}
                />

                <div className="absolute left-1/2 -translate-x-1/2 top-[1px]">
                  <div className="relative h-[56px] w-[56px]">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <span
                        key={index}
                        className="absolute left-1/2 top-1/2 block rounded-[50%_50%_45%_45%]"
                        style={{
                          width: '18px',
                          height: '27px',
                          background: bloom.petals[index % bloom.petals.length],
                          transform: `translate(-50%, -50%) rotate(${index * 60}deg) translateY(-15px)`,
                          border: '1px solid rgba(60, 43, 19, 0.2)',
                        }}
                      />
                    ))}

                    <span
                      className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[0.62rem] font-black"
                      style={{
                        width: '22px',
                        height: '22px',
                        background: bloom.center,
                        color: '#2f2a20',
                        border: '1px solid rgba(86, 63, 25, 0.22)',
                      }}
                    >
                      {bloom.icon}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute left-[62%] bottom-[21%] hidden md:block">
        <div
          className="relative h-[44px] w-[44px] rounded-full"
          style={{
            background: 'linear-gradient(180deg, #fff3d9 0%, #e8d8b9 100%)',
            border: '1px solid rgba(124, 104, 64, 0.55)',
          }}
        >
          <span className="absolute left-[7px] top-[17px] h-[10px] w-[10px] rounded-full bg-[#1f2328]" />
          <span className="absolute right-[7px] top-[17px] h-[10px] w-[10px] rounded-full bg-[#1f2328]" />
          <span className="absolute left-1/2 top-[27px] h-[5px] w-[12px] -translate-x-1/2 rounded-full bg-[#1f2328]" />
        </div>
      </div>

      <div className="absolute right-[12%] bottom-[16%] hidden md:block">
        <div
          className="relative h-[82px] w-[58px] rounded-[52%_52%_32%_32%]"
          style={{
            background: 'linear-gradient(180deg, #f06736 0%, #d14c20 100%)',
            border: '2px solid rgba(104, 44, 20, 0.6)',
          }}
        >
          <span className="absolute left-[8px] top-[14px] h-[9px] w-[16px] rotate-[26deg] rounded-full bg-[#fce7c8] opacity-90" />
          <span className="absolute left-[29px] top-[18px] h-[7px] w-[12px] rotate-[10deg] rounded-full bg-[#fce7c8] opacity-90" />
          <span className="absolute left-[20px] top-[34px] h-[8px] w-[14px] rotate-[-14deg] rounded-full bg-[#fce7c8] opacity-90" />
          <span className="absolute left-[22px] top-[78px] h-[48px] w-[13px] -translate-y-1/2 rounded-full bg-[#c3a685]" />
        </div>
      </div>
    </section>
  );
}
