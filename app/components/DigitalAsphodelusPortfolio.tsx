"use client";

import {
  SiAxios,
  SiCss,
  SiFramer,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiRadixui,
  SiReact,
  SiRedux,
  SiShadcnui,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from "@icons-pack/react-simple-icons";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import {
  type ComponentType,
  type MouseEvent,
  type SVGProps,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import GradientText from "@/components/GradientText";
import { Highlighter } from "@/components/ui/highlighter";
import { cn } from "@/lib/utils";
import { Bloom } from "./Bloom";
import PortfolioEasterEgg from "./PortfolioEasterEgg";
import PhilosophyPollination from "./PhilosophyPollination";
import { StoryFlower } from "./StoryFlower";

const revealEase = [0.22, 1, 0.36, 1] as const;
const technologyAccent = "rgba(232, 227, 217, 0.62)";
const flowerCompletionLockProgress = 0.96;
const LazyLightRays = dynamic(() => import("@/components/LightRays"), {
  ssr: false,
});

type CursorMode = "default" | "focus" | "link";
type CursorOverlayHandle = {
  reset: () => void;
  setFocus: (mode: CursorMode, label: string) => void;
};

type Project = {
  title: string;
  category: string;
  summary: string;
  meta: string;
  href?: string;
};

type Contact = {
  label: string;
  value: string;
  href: string;
};

type Technology = {
  accent: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  key: string;
  label: string;
  leafIndex: number;
};

type IntroAccentConfig = {
  highlight: string;
  underline: string;
};

const technologies: Technology[] = [
  {
    key: "javascript",
    label: "JavaScript (ES6+)",
    Icon: SiJavascript,
    accent: "#f7df1e",
    leafIndex: 0,
  },
  {
    key: "typescript",
    label: "TypeScript",
    Icon: SiTypescript,
    accent: "#3178c6",
    leafIndex: 0,
  },
  {
    key: "react",
    label: "React",
    Icon: SiReact,
    accent: "#61dafb",
    leafIndex: 1,
  },
  {
    key: "nextjs",
    label: "Next.js",
    Icon: SiNextdotjs,
    accent: "#ffffff",
    leafIndex: 1,
  },
  {
    key: "redux",
    label: "Redux Toolkit / Context API",
    Icon: SiRedux,
    accent: "#764abc",
    leafIndex: 1,
  },
  {
    key: "html",
    label: "HTML5",
    Icon: SiHtml5,
    accent: "#e34f26",
    leafIndex: 2,
  },
  {
    key: "css",
    label: "CSS",
    Icon: SiCss,
    accent: "#1572b6",
    leafIndex: 2,
  },
  {
    key: "tailwind",
    label: "Tailwind CSS",
    Icon: SiTailwindcss,
    accent: "#06b6d4",
    leafIndex: 3,
  },
  {
    key: "shadcn",
    label: "Shadcn UI",
    Icon: SiShadcnui,
    accent: "#ffffff",
    leafIndex: 3,
  },
  {
    key: "radix",
    label: "Radix UI",
    Icon: SiRadixui,
    accent: "#ffffff",
    leafIndex: 3,
  },
  {
    key: "axios",
    label: "REST API / Axios",
    Icon: SiAxios,
    accent: "#5a29e4",
    leafIndex: 4,
  },
  {
    key: "git",
    label: "Git",
    Icon: SiGit,
    accent: "#f05032",
    leafIndex: 5,
  },
  {
    key: "github",
    label: "GitHub",
    Icon: SiGithub,
    accent: "#ffffff",
    leafIndex: 5,
  },
  {
    key: "vite",
    label: "Vite",
    Icon: SiVite,
    accent: "#646cff",
    leafIndex: 5,
  },
  {
    key: "framer",
    label: "Framer Motion",
    Icon: SiFramer,
    accent: "#0055ff",
    leafIndex: 5,
  },
];

const projectSkillLeavesByIndex: Record<number, readonly number[]> = {
  0: [0, 1, 2, 3, 5],
};

const emptyProjectSkillLeaves: readonly number[] = [];

const introStatementAccentMap: Record<string, IntroAccentConfig> = {
  en: {
    highlight: "atmosphere",
    underline: "precision",
  },
  ru: {
    highlight: "атмосферой",
    underline: "точность",
  },
};

function splitTextFragment(text: string, fragment: string) {
  if (!fragment) {
    return {
      after: "",
      before: text,
      target: "",
    };
  }

  const index = text.indexOf(fragment);

  if (index === -1) {
    return {
      after: "",
      before: text,
      target: "",
    };
  }

  return {
    after: text.slice(index + fragment.length),
    before: text.slice(0, index),
    target: text.slice(index, index + fragment.length),
  };
}

const ui = {
  page:
    "relative min-h-screen overflow-x-clip text-white [background:radial-gradient(circle_at_22%_18%,rgba(232,227,217,0.08),transparent_28%),radial-gradient(circle_at_78%_14%,rgba(232,227,217,0.04),transparent_24%),#0a0a0a]",
  pageWithCursor:
    "cursor-none [&_a]:cursor-none [&_button]:cursor-none [&_[tabindex='0']]:cursor-none",
  ambientGlow:
    "pointer-events-none absolute inset-0 left-[48%] h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(circle,rgba(232,227,217,0.12),rgba(232,227,217,0)_68%)] blur-[24px]",
  ambientGlowSecondary:
    "pointer-events-none absolute left-[-16rem] top-[16rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),rgba(255,255,255,0)_72%)] blur-[32px]",
  noise:
    "pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:7rem_7rem] [mask-image:radial-gradient(circle_at_center,black_36%,transparent_100%)]",
  shell:
    "relative z-[1] mx-auto grid w-full max-w-[90rem] grid-cols-[minmax(0,1.05fr)_minmax(18rem,30rem)] gap-[clamp(2.5rem,8vw,8rem)] px-[clamp(1.5rem,6vw,5rem)] max-[980px]:max-w-[56rem] max-[980px]:grid-cols-1 max-[980px]:gap-0 max-[640px]:px-[0.95rem]",
  story:
    "relative z-[2] min-w-0 pt-[6vh] pb-[10vh] max-[640px]:pt-0 max-[640px]:pb-16",
  section:
    "relative py-[clamp(5rem,13vh,10rem)] max-[640px]:py-16",
  heroSection:
    "grid min-h-screen content-center gap-[clamp(2rem,4vw,3.5rem)] pt-[clamp(3.5rem,8vh,6rem)] pb-[clamp(4rem,10vh,7rem)] max-[980px]:content-start max-[980px]:gap-[1.6rem] max-[980px]:pt-[clamp(5rem,12vh,8rem)] max-[980px]:[min-height:auto] max-[640px]:gap-[1.2rem] max-[640px]:pt-[3.75rem] max-[640px]:[min-height:auto]",
  heroTopbar:
    "flex flex-wrap items-center justify-start gap-4 max-[980px]:mb-[0.4rem] max-[640px]:items-start",
  alias:
    "text-[clamp(1rem,1vw,1.1rem)] lowercase tracking-[0.18em] [&_.text-content]:text-inherit [&_.text-content]:font-medium [&_.text-content]:leading-none [&_.text-content]:tracking-[inherit] [&_.text-content]:[font-family:var(--font-mono),IBM_Plex_Mono,monospace]",
  microLabel:
    "mb-6 inline-flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.22em] text-[#a1a1aa] before:block before:h-px before:w-10 before:bg-[rgba(232,227,217,0.35)] before:content-[''] [font-family:var(--font-mono),IBM_Plex_Mono,monospace]",
  heroCopy:
    "max-w-[36rem] min-w-0 transform-gpu [will-change:transform,opacity] max-[980px]:max-w-[40rem]",
  displayTitle:
    "m-0 max-w-[10ch] text-[clamp(4.1rem,10vw,8.7rem)] font-semibold leading-[0.9] tracking-[-0.06em] [&>[data-hero-line]]:block max-[980px]:max-w-[9ch] max-[640px]:max-w-[8ch] max-[640px]:text-[clamp(3.1rem,16vw,4.7rem)]",
  bloomLine: "inline-flex flex-wrap items-end gap-x-[0.16em] gap-y-[0.04em]",
  heroBody:
    "mt-8 max-w-[29rem] text-[clamp(1rem,1.4vw,1.18rem)] leading-[1.75] text-[#bdbdc5]",
  scrollCue:
    "group mt-9 inline-flex items-center gap-4 text-[0.76rem] uppercase tracking-[0.18em] text-[#e8e3d9] transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-[0.45rem] hover:text-white focus-visible:translate-x-[0.45rem] focus-visible:text-white [font-family:var(--font-mono),IBM_Plex_Mono,monospace]",
  scrollCueLine:
    "block h-px w-[2.8rem] bg-[rgba(232,227,217,0.44)] transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-16 group-focus-visible:w-16",
  introGrid: "grid gap-[clamp(2.25rem,6vw,5rem)]",
  introLead: "grid min-w-0 gap-[clamp(1.4rem,2vw,2rem)]",
  introStatement:
    "m-0 max-w-[18ch] text-[clamp(2.55rem,5.2vw,4.6rem)] leading-[0.98] tracking-[-0.075em] [text-wrap:pretty] max-[980px]:max-w-[16ch] max-[640px]:max-w-[15ch] max-[640px]:text-[clamp(2.35rem,11vw,3.2rem)]",
  introStatementPrimaryAccent: "text-inherit",
  introStatementPrimaryLayer: "relative z-[2] inline-block",
  introStatementSecondaryAccent: "",
  introStatementSecondaryLayer: "relative z-[1] inline-block opacity-80",
  introSupporting:
    "m-0 max-w-[33rem] text-[0.98rem] leading-[1.85] text-[#a6a6ae] max-[640px]:text-[0.94rem]",
  introFoot: "block",
  skillsBlock:
    "grid w-full grid-cols-1 gap-4 rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015)),rgba(10,10,10,0.48)] px-6 py-[1.35rem] shadow-[0_24px_80px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[18px] max-[980px]:max-w-[30rem] max-[640px]:w-full max-[640px]:gap-3 max-[640px]:rounded-[1.2rem] max-[640px]:px-3.5 max-[640px]:py-[0.95rem]",
  skillsIntro: "grid content-start gap-[0.55rem]",
  skillsLabel:
    "text-[0.72rem] uppercase tracking-[0.18em] text-[#b0b0b8] [font-family:var(--font-mono),IBM_Plex_Mono,monospace]",
  skillsHint:
    "mt-[-0.2rem] text-[0.82rem] leading-[1.7] text-[#8d8d95] max-[640px]:text-[0.74rem] max-[640px]:leading-[1.55]",
  skillsGrid:
    "flex w-full flex-wrap content-start items-start gap-[0.7rem] max-[640px]:gap-[0.42rem]",
  skillChip:
    "group inline-flex items-center gap-[0.65rem] rounded-full border border-white/8 bg-white/[0.02] px-[0.95rem] py-[0.7rem] text-[0.88rem] leading-none text-[#d0d0d6] transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] hover:border-[rgba(232,227,217,0.24)] hover:bg-white/[0.04] focus-visible:-translate-y-[2px] focus-visible:border-[rgba(232,227,217,0.24)] focus-visible:bg-white/[0.04] max-[640px]:gap-[0.45rem] max-[640px]:px-[0.68rem] max-[640px]:py-[0.52rem] max-[640px]:text-[0.74rem]",
  skillChipActive:
    "border-[rgba(245,239,226,0.36)] bg-[rgba(245,239,226,0.08)] text-[#f5efe2] shadow-[0_0_0_1px_rgba(245,239,226,0.06),0_14px_40px_rgba(0,0,0,0.16)]",
  skillIcon:
    "size-4 shrink-0 transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] max-[640px]:size-[0.82rem]",
  workList: "mt-6 border-t border-white/10",
  projectRow:
    "grid grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] gap-x-12 gap-y-6 border-b border-white/8 py-[2.6rem] outline-none transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-[0.55rem] hover:border-[rgba(232,227,217,0.28)] focus-visible:translate-x-[0.55rem] focus-visible:border-[rgba(232,227,217,0.28)] max-[980px]:grid-cols-1",
  projectHeading: "grid grid-cols-[auto_1fr] items-start gap-5",
  projectIndex:
    "pt-[0.35rem] text-[0.78rem] tracking-[0.16em] text-[#a1a1aa] [font-family:var(--font-mono),IBM_Plex_Mono,monospace]",
  projectTitle:
    "m-0 text-[clamp(2rem,4vw,3rem)] font-[560] leading-[0.98] tracking-[-0.05em] max-[640px]:text-[clamp(1.75rem,10vw,2.3rem)]",
  projectCategory: "mt-[0.65rem] text-base text-[#d2d2d8]",
  projectBody: "grid content-between justify-items-start gap-5 max-[980px]:gap-[0.9rem]",
  projectSummary:
    "m-0 text-[1.05rem] leading-[1.8] text-[#bcbcc4]",
  projectMeta:
    "text-[0.72rem] uppercase tracking-[0.16em] text-[#8b8b92] [font-family:var(--font-mono),IBM_Plex_Mono,monospace]",
  philosophySection: "py-[clamp(7rem,18vh,13rem)]",
  philosophyBlock: "relative max-w-[44rem] pr-[5.5rem] max-[640px]:pr-[3.2rem]",
  philosophyButterflyButton:
    "absolute right-0 top-[3.15rem] z-10 inline-flex size-[5.5rem] items-center justify-center overflow-visible rounded-full border border-white/8 bg-[radial-gradient(circle,rgba(255,255,255,0.045),rgba(255,255,255,0)_68%)] text-[#efe7d6] transition-[transform,border-color,background-color,opacity] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04] hover:border-[rgba(232,227,217,0.18)] hover:bg-[radial-gradient(circle,rgba(245,239,226,0.11),rgba(255,255,255,0)_68%)] focus-visible:scale-[1.04] focus-visible:border-[rgba(232,227,217,0.18)] focus-visible:bg-[radial-gradient(circle,rgba(245,239,226,0.11),rgba(255,255,255,0)_68%)] focus-visible:outline-none max-[640px]:top-[2.35rem] max-[640px]:size-[4.75rem]",
  philosophyButterflyHalo:
    "pointer-events-none absolute inset-[0.8rem] rounded-full bg-[radial-gradient(circle,rgba(245,239,226,0.16),rgba(245,239,226,0)_72%)] blur-[10px] opacity-70",
  philosophyButterflyMotion: "relative z-[1] block size-[3.1rem] max-[640px]:size-[2.65rem]",
  philosophyQuote:
    "m-0 max-w-[12ch] text-[clamp(2.6rem,5.3vw,4.8rem)] leading-[1.04] tracking-[-0.045em] max-[640px]:text-[clamp(2.2rem,10vw,3rem)]",
  supportingCopy:
    "mt-[3.4rem] max-w-[22rem] text-base leading-[1.8] text-[#a1a1aa] max-[640px]:max-w-none",
  contactSection: "pb-[clamp(5rem,14vh,10rem)]",
  contactGrid:
    "grid grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] gap-[clamp(2rem,7vw,7rem)] max-[980px]:grid-cols-1",
  contactHeading:
    "m-0 max-w-[27rem] text-[1.05rem] leading-[1.8] text-[#bcbcc4] max-[640px]:max-w-none",
  contactLinks: "grid gap-4 self-end",
  contactLink:
    "grid gap-[0.3rem] border-t border-white/8 py-[1.1rem] transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-[0.45rem] hover:text-[#e8e3d9] hover:border-[rgba(232,227,217,0.28)] focus-visible:translate-x-[0.45rem] focus-visible:text-[#e8e3d9] focus-visible:border-[rgba(232,227,217,0.28)] last:border-b last:border-white/8",
  contactLinkLabel:
    "text-[0.72rem] uppercase tracking-[0.18em] text-[#8b8b92] [font-family:var(--font-mono),IBM_Plex_Mono,monospace]",
  contactLinkValue:
    "text-[clamp(1.35rem,2vw,1.8rem)] font-medium leading-[1.2] tracking-[-0.03em] max-[640px]:text-[1.2rem]",
  visualRail: "relative z-[1] max-[980px]:hidden",
  visualSticky: "sticky top-0 pb-[7vh]",
  mobileVisualBackdrop:
    "pointer-events-none fixed inset-x-0 top-0 z-0 hidden h-screen overflow-hidden max-[980px]:block",
  mobileVisualGlow:
    "absolute left-1/2 top-[18svh] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,239,226,0.12),rgba(245,239,226,0)_72%)] blur-[34px] opacity-80",
  mobileStoryFlowerFrame:
    "absolute inset-x-[-10%] top-[6svh] bottom-[-10svh] opacity-[0.34] [mask-image:linear-gradient(180deg,transparent_0%,black_14%,black_78%,transparent_100%)]",
  mobileStoryFlower:
    "absolute left-1/2 top-0 h-full w-[min(100vw,25rem)] -translate-x-1/2 overflow-visible",
  railVisualFrame:
    "relative isolate ml-auto h-[min(84vh,48rem)] min-h-[38rem] w-full max-w-[33rem] overflow-visible [--visual-scene-offset:clamp(3.25rem,5vw,5rem)] before:absolute before:bottom-28 before:left-[20%] before:top-[8%] before:z-[1] before:w-px before:bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.09)_18%,rgba(232,227,217,0.16)_42%,rgba(255,255,255,0.06)_78%,rgba(255,255,255,0))] before:content-[''] before:[transform:translateY(var(--visual-scene-offset))]",
  railLightRays:
    "pointer-events-none absolute z-0 opacity-[0.58] mix-blend-screen [mask-image:radial-gradient(circle_at_82%_14%,black_20%,transparent_78%)]",
  flowerSvg:
    "absolute inset-x-0 top-0 bottom-[5.75rem] z-[2] block h-[calc(100%-5.75rem)] w-full overflow-visible [transform:translateY(var(--visual-scene-offset))] max-[640px]:bottom-[2.25rem] max-[640px]:h-[calc(100%-2.25rem)]",
  codePrelude:
    "absolute bottom-0 left-0 z-[3] grid max-w-[22rem] gap-[0.55rem] text-[clamp(0.66rem,0.84vw,0.76rem)] leading-[1.55] tracking-[0.04em] text-[#94949c] [font-family:var(--font-mono),IBM_Plex_Mono,monospace] before:mb-[0.7rem] before:block before:h-px before:w-20 before:bg-[rgba(232,227,217,0.25)] before:content-[''] [transform:translateY(var(--visual-scene-offset))] max-[980px]:max-w-[18rem] max-[640px]:left-[0.1rem] max-[640px]:max-w-[14rem] max-[640px]:gap-[0.45rem] max-[640px]:text-[0.62rem]",
  codePreludeInner: "grid gap-[0.55rem] max-[640px]:gap-[0.45rem]",
} as const;

const railLightRaysStyle = {
  inset: "-10% calc((((100vw - min(100vw, 90rem)) / 2) + clamp(1.5rem, 6vw, 5rem)) * -1) 10% -6%",
} as const;

function DefaultCursorIcon() {
  return (
    <svg
      className="block size-12 overflow-visible [filter:drop-shadow(0_12px_24px_rgba(0,0,0,0.28))]"
      width="48"
      height="48"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.8333 6L20.9167 16.3917L31 26.7833L24.9022 27.2667L20.9167 28.2333L17.25 29.6833L12.6667 32.1L9 35L10.8333 6Z"
        stroke="#E8E3D9"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PointerCursorIcon() {
  return (
    <svg
      className="block size-12 overflow-visible [filter:drop-shadow(0_12px_24px_rgba(0,0,0,0.28))]"
      width="48"
      height="48"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 22V10C16 8.5 17 7.5 18.5 7.5C20 7.5 21 8.5 21 10V22"
        stroke="#E8E3D9"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M21 22V16.75C21 16.3 21.8889 16 22.9556 16C24.1111 16 25 16.3 25 16.75V22"
        stroke="#E8E3D9"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M25 22V16.8571C25 16.3429 26.0714 16 27.5 16C28.9286 16 30 16.3429 30 16.8571V22"
        stroke="#E8E3D9"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M30 22V18.5714C30 18.2286 30.8571 18 32 18C33.1429 18 34 18.2286 34 18.5714V22"
        stroke="#E8E3D9"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M15.4057 20.9017C15.4057 20.9017 13.3397 19.2987 11.7902 20.3673C10.2406 21.436 11.2737 24.1076 12.3067 26.2449L16.4387 33.7254C17.9883 36.397 21.0873 38 24.1864 38H27.8019C31.4175 38 34 35.3284 34 31.5881V20.9017"
        stroke="#E8E3D9"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CursorOverlay = forwardRef<
  CursorOverlayHandle
>(function CursorOverlay(_, ref) {
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [cursorLabel, setCursorLabel] = useState("");
  const cursorX = useMotionValue(-120);
  const cursorY = useMotionValue(-120);
  const cursorVisibleRef = useRef(false);
  const cursorModeRef = useRef<CursorMode>("default");
  const cursorLabelRef = useRef("");

  useImperativeHandle(ref, () => ({
    setFocus(mode, label) {
      if (cursorModeRef.current !== mode) {
        cursorModeRef.current = mode;
        setCursorMode(mode);
      }

      if (cursorLabelRef.current !== label) {
        cursorLabelRef.current = label;
        setCursorLabel(label);
      }
    },
    reset() {
      if (cursorModeRef.current !== "default") {
        cursorModeRef.current = "default";
        setCursorMode("default");
      }

      if (cursorLabelRef.current !== "") {
        cursorLabelRef.current = "";
        setCursorLabel("");
      }
    },
  }), []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);

      if (!cursorVisibleRef.current) {
        cursorVisibleRef.current = true;
        setCursorVisible(true);
      }
    };

    const handlePointerLeave = () => {
      if (!cursorVisibleRef.current) {
        return;
      }

      cursorVisibleRef.current = false;
      setCursorVisible(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [cursorX, cursorY]);

  const usePointerCursor = cursorMode !== "default";
  const showCursorTooltip = cursorMode !== "default" && cursorLabel.length > 0;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[60]"
      aria-hidden="true"
      style={{ x: cursorX, y: cursorY }}
    >
      <motion.div
        className="absolute left-0 top-0 size-12 origin-top-left"
        animate={{
          opacity: cursorVisible ? 1 : 0,
        }}
        transition={{ duration: 0 }}
      >
        <div
          className={[
            "size-12",
            usePointerCursor
              ? "translate-x-[-18px] translate-y-[-8px]"
              : "translate-x-[-11px] translate-y-[-6px]",
          ].join(" ")}
        >
          {usePointerCursor ? <PointerCursorIcon /> : <DefaultCursorIcon />}
        </div>
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 inline-flex min-h-8 origin-top-left items-center justify-center whitespace-nowrap rounded-full bg-[rgba(14,14,14,0.38)] px-[0.82rem] py-[0.52rem] text-[0.56rem] leading-none uppercase tracking-[0.16em] text-[#e8e3d9] translate-x-[12px] translate-y-[10px] backdrop-blur-[16px] [font-family:var(--font-mono)]"
        animate={{
          opacity: cursorVisible && showCursorTooltip ? 1 : 0,
          scale: cursorVisible && showCursorTooltip ? 1 : 0.96,
        }}
        transition={{ duration: 0.12, ease: revealEase }}
      >
        {cursorLabel}
      </motion.div>
    </motion.div>
  );
});

export default function DigitalAsphodelusPortfolio() {
  const t = useTranslations("Portfolio");
  const locale = useLocale();
  const isRussian = locale === "ru";
  const introStatement = t("intro.statement");
  const introSupporting = t("intro.supporting");
  const introStatementAccent =
    introStatementAccentMap[locale] ?? introStatementAccentMap.en;
  const lenisRef = useRef<Lenis | null>(null);
  const workListRef = useRef<HTMLDivElement | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredSkillLeaf, setHoveredSkillLeaf] = useState<number | null>(null);
  const [hoveredSkillLabel, setHoveredSkillLabel] = useState<string | null>(null);
  const [hoveredSkillAccent, setHoveredSkillAccent] = useState<string | null>(null);
  const [hasReachedWorkListEnd, setHasReachedWorkListEnd] = useState(false);
  const [isFlowerProgressLocked, setIsFlowerProgressLocked] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [isHeroVisualReady, setIsHeroVisualReady] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const cursorRef = useRef<CursorOverlayHandle | null>(null);
  const introUnderlineParts = useMemo(
    () => splitTextFragment(introStatement, introStatementAccent.underline),
    [introStatement, introStatementAccent.underline],
  );
  const introHighlightParts = useMemo(
    () => splitTextFragment(introUnderlineParts.after, introStatementAccent.highlight),
    [introStatementAccent.highlight, introUnderlineParts.after],
  );

  const { scrollYProgress } = useScroll();
  const railFlowerProgress = useMotionValue(0);

  const codeOpacity = useTransform(scrollYProgress, [0, 0.22, 0.46], [1, 1, 0.38]);
  const haloOpacity = useTransform(scrollYProgress, [0, 0.7], [0.18, 0.48]);
  const backgroundShift = useTransform(scrollYProgress, [0, 1], [0, 56]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const updateProgress = (value: number) => {
      if (isFlowerProgressLocked) {
        railFlowerProgress.set(1);
        return;
      }

      railFlowerProgress.set(value);

      if (hasReachedWorkListEnd && value >= flowerCompletionLockProgress) {
        setIsFlowerProgressLocked(true);
        railFlowerProgress.set(1);
      }
    };

    updateProgress(scrollYProgress.get());

    const unsubscribe = scrollYProgress.on("change", updateProgress);
    return () => unsubscribe();
  }, [
    hasReachedWorkListEnd,
    isFlowerProgressLocked,
    railFlowerProgress,
    scrollYProgress,
  ]);

  useEffect(() => {
    if (isFlowerProgressLocked || typeof window === "undefined") {
      return;
    }

    const updateWorkListEnd = () => {
      const workList = workListRef.current;
      if (!workList) {
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const reachedEnd = workList.getBoundingClientRect().bottom <= viewportHeight - 12;

      if (reachedEnd) {
        setHasReachedWorkListEnd(true);

        if (scrollYProgress.get() >= flowerCompletionLockProgress) {
          setIsFlowerProgressLocked(true);
          railFlowerProgress.set(1);
        }
      }
    };

    updateWorkListEnd();
    window.addEventListener("scroll", updateWorkListEnd, { passive: true });
    window.addEventListener("resize", updateWorkListEnd);

    return () => {
      window.removeEventListener("scroll", updateWorkListEnd);
      window.removeEventListener("resize", updateWorkListEnd);
    };
  }, [
    isFlowerProgressLocked,
    railFlowerProgress,
    scrollYProgress,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(pointer: fine)");
    const updatePointer = () => setFinePointer(media.matches);
    updatePointer();
    media.addEventListener("change", updatePointer);

    return () => {
      media.removeEventListener("change", updatePointer);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(min-width: 981px)");
    const updateViewport = () => setIsDesktopViewport(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);

    return () => {
      media.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameOne = 0;
    let frameTwo = 0;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let idleId: number | null = null;

    const activateVisuals = () => {
      setIsHeroVisualReady(true);
    };

    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(() => {
        const requestIdle = window.requestIdleCallback?.bind(window);

        if (requestIdle) {
          idleId = requestIdle(activateVisuals, { timeout: 700 });
          return;
        }

        timeoutId = globalThis.setTimeout(activateVisuals, 420);
      });
    });

    return () => {
      window.cancelAnimationFrame(frameOne);
      window.cancelAnimationFrame(frameTwo);

      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (!isHeroVisualReady || typeof window === "undefined") {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;

    let animationFrame = 0;

    const onFrame = (time: number) => {
      lenis.raf(time);
      animationFrame = window.requestAnimationFrame(onFrame);
    };

    animationFrame = window.requestAnimationFrame(onFrame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isHeroVisualReady]);

  const showCursor = finePointer;
  const projects = t.raw("work.projects") as Project[];
  const contacts = t.raw("contact.links") as Contact[];
  const codeLines = t.raw("hero.code") as string[];
  const activeProjectLabel =
    hoveredProject !== null ? projects[hoveredProject]?.title ?? null : null;
  const highlightedProjectSkillLeaves =
    hoveredProject !== null
      ? projectSkillLeavesByIndex[hoveredProject] ?? emptyProjectSkillLeaves
      : emptyProjectSkillLeaves;

  const pageClassName = useMemo(
    () => cn(ui.page, showCursor && ui.pageWithCursor),
    [showCursor],
  );

  const setFocusCursor = (mode: CursorMode, label: string) => {
    if (!showCursor) {
      return;
    }
    cursorRef.current?.setFocus(mode, label);
  };

  const resetCursor = () => {
    if (!showCursor) {
      return;
    }
    cursorRef.current?.reset();
  };

  const handleScrollCueClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = "#selected-work";

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -32, duration: 1.15 });
      return;
    }

    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderCodePrelude = (className?: string) => (
    <div className={cn(ui.codePrelude, className)}>
      <motion.div className={ui.codePreludeInner} style={{ opacity: codeOpacity }}>
        {codeLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </motion.div>
    </div>
  );

  return (
    <PortfolioEasterEgg className={pageClassName}>
      <motion.div
        className={ui.ambientGlow}
        style={{ opacity: haloOpacity, y: backgroundShift }}
      />
      <div className={ui.ambientGlowSecondary} />
      <div className={ui.noise} />
      <div className={ui.mobileVisualBackdrop} aria-hidden="true">
        <div className={ui.mobileVisualGlow} />
        {isHeroVisualReady ? (
          <div className={ui.mobileStoryFlowerFrame}>
            <StoryFlower
              className={ui.mobileStoryFlower}
              progress={railFlowerProgress}
              hoveredProject={hoveredProject}
              hoveredSkillLeaf={hoveredSkillLeaf}
              highlightedSkillLeaves={highlightedProjectSkillLeaves}
              activeProjectLabel={activeProjectLabel}
              activeSkillLabel={hoveredSkillLabel}
              activeSkillAccent={hoveredSkillAccent}
              idPrefix="mobile-flower"
            />
          </div>
        ) : null}
      </div>
      {showCursor ? <CursorOverlay ref={cursorRef} /> : null}

      <div className={ui.shell}>
        <article className={ui.story}>
          <section id="hero" className={cn(ui.section, ui.heroSection)}>
            <div className={ui.heroTopbar}>
              <GradientText
                colors={["#f3d59f", "#f5a7cb", "#8dc3ff", "#8ce4bf", "#f3d59f"]}
                animationSpeed={11}
                showBorder={false}
                className={ui.alias}
              >
                {t("alias")}
              </GradientText>
            </div>

            <motion.div
              className={ui.heroCopy}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, ease: revealEase }}
            >
              <span className={ui.microLabel}>{t("hero.eyebrow")}</span>
              <h1 className={ui.displayTitle}>
                {isRussian ? (
                  <>
                    <span data-hero-line>{t("hero.titleLine1")}</span>
                    <span data-hero-line>{t("hero.titleLine2")}</span>
                    <span data-hero-line className={ui.bloomLine}>
                      <Bloom
                        activationDelayMs={520}
                        locale="ru"
                        word={t("hero.bloomWord")}
                      />
                      <span>{t("hero.titleLine3")}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span data-hero-line>
                      {t("hero.titleLine1")} {t("hero.titleLine2")}
                    </span>
                    <span data-hero-line className={ui.bloomLine}>
                      <Bloom
                        activationDelayMs={520}
                        locale="en"
                        word={t("hero.bloomWord")}
                      />
                      <span>{t("hero.titleLine3")}</span>
                    </span>
                  </>
                )}
              </h1>
              {t("hero.body") ? <p className={ui.heroBody}>{t("hero.body")}</p> : null}
              <a
                className={ui.scrollCue}
                href="#selected-work"
                onClick={handleScrollCueClick}
                onMouseEnter={() => setFocusCursor("link", t("cursor.open"))}
                onMouseLeave={resetCursor}
                onFocus={() => setFocusCursor("link", t("cursor.open"))}
                onBlur={resetCursor}
              >
                <span className={ui.scrollCueLine} />
                {t("hero.scrollCue")}
              </a>
            </motion.div>
          </section>

          <section id="intro" className={ui.section}>
            <motion.div
              initial={{ opacity: 0.96, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.38, once: true }}
              transition={{ duration: 0.96, ease: revealEase }}
              className={ui.introGrid}
            >
              <div className={ui.introLead}>
                <span className={ui.microLabel}>{t("intro.label")}</span>
                <p className={ui.introStatement}>
                  {introUnderlineParts.before}
                  {introUnderlineParts.target ? (
                    <span className={ui.introStatementPrimaryLayer}>
                      <Highlighter
                        action="underline"
                        animationDuration={520}
                        color="#f0b45a"
                        isView
                        iterations={2}
                        multiline={true}
                        padding={3}
                        strokeWidth={2}
                      >
                        <span className={ui.introStatementPrimaryAccent}>
                          {introUnderlineParts.target}
                        </span>
                      </Highlighter>
                    </span>
                  ) : null}
                  {introHighlightParts.before}
                  {introHighlightParts.target ? (
                    <span className={ui.introStatementSecondaryLayer}>
                      <Highlighter
                        action="highlight"
                        animationDuration={560}
                        color="#83769c"
                        isView
                        iterations={1}
                        multiline={false}
                        padding={2}
                        strokeWidth={1.5}
                      >
                        <span className={ui.introStatementSecondaryAccent}>
                          {introHighlightParts.target}
                        </span>
                      </Highlighter>
                    </span>
                  ) : null}
                  {introHighlightParts.after}
                </p>
                <p className={ui.introSupporting}>
                  {introSupporting}
                </p>
              </div>
              <div className={ui.introFoot}>
                <div className={ui.skillsBlock}>
                  <div className={ui.skillsIntro}>
                    <span className={ui.skillsLabel}>{t("intro.stackLabel")}</span>
                    <p className={ui.skillsHint}>{t("intro.stackHint")}</p>
                  </div>

                  <div className={ui.skillsGrid}>
                    {technologies.map((technology) => {
                      const Icon = technology.Icon;
                      const isActive = hoveredSkillLeaf === technology.leafIndex;

                      return (
                        <button
                          key={technology.key}
                          type="button"
                          className={cn(ui.skillChip, isActive && ui.skillChipActive)}
                          onMouseEnter={() => {
                            setHoveredSkillLeaf(technology.leafIndex);
                            setHoveredSkillLabel(technology.label);
                            setHoveredSkillAccent(technology.accent);
                            setFocusCursor("focus", t("cursor.explore"));
                          }}
                          onMouseLeave={() => {
                            setHoveredSkillLeaf(null);
                            setHoveredSkillLabel(null);
                            setHoveredSkillAccent(null);
                            resetCursor();
                          }}
                          onFocus={() => {
                            setHoveredSkillLeaf(technology.leafIndex);
                            setHoveredSkillLabel(technology.label);
                            setHoveredSkillAccent(technology.accent);
                            setFocusCursor("focus", t("cursor.explore"));
                          }}
                          onBlur={() => {
                            setHoveredSkillLeaf(null);
                            setHoveredSkillLabel(null);
                            setHoveredSkillAccent(null);
                            resetCursor();
                          }}
                        >
                          <Icon
                            aria-hidden="true"
                            className={cn(ui.skillIcon, isActive && "scale-[1.06]")}
                            style={{ color: isActive ? technology.accent : technologyAccent }}
                          />
                          <span>{technology.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <section id="selected-work" className={ui.section}>
            <motion.div
              initial={{ opacity: 0.97, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.22, once: true }}
              transition={{ duration: 0.9, ease: revealEase }}
            >
              <span className={ui.microLabel}>{t("work.label")}</span>
              <div ref={workListRef} className={ui.workList}>
                {projects.map((project, index) => {
                  const isExternalProject = project.href?.startsWith("http") ?? false;
                  const projectCursorMode: CursorMode = project.href ? "link" : "focus";
                  const projectCursorLabel = project.href
                    ? t("cursor.open")
                    : t("cursor.view");
                  const projectContent = (
                    <>
                      <div className={ui.projectHeading}>
                        <span className={ui.projectIndex}>0{index + 1}</span>
                        <div>
                          <h2 className={ui.projectTitle}>{project.title}</h2>
                          <p className={ui.projectCategory}>{project.category}</p>
                        </div>
                      </div>
                      <div className={ui.projectBody}>
                        <p className={ui.projectSummary}>{project.summary}</p>
                        <span className={ui.projectMeta}>{project.meta}</span>
                      </div>
                    </>
                  );

                  const handleProjectEnter = () => {
                    setHoveredProject(index);
                    setFocusCursor(projectCursorMode, projectCursorLabel);
                  };

                  const handleProjectLeave = () => {
                    setHoveredProject(null);
                    resetCursor();
                  };

                  if (project.href) {
                    return (
                      <motion.a
                        key={project.title}
                        className={ui.projectRow}
                        href={project.href}
                        initial={{ opacity: 0.96, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ amount: 0.34, once: true }}
                        transition={{
                          duration: 0.85,
                          ease: revealEase,
                          delay: index * 0.08,
                        }}
                        onMouseEnter={handleProjectEnter}
                        onMouseLeave={handleProjectLeave}
                        onFocus={handleProjectEnter}
                        onBlur={handleProjectLeave}
                        target={isExternalProject ? "_blank" : undefined}
                        rel={isExternalProject ? "noreferrer" : undefined}
                      >
                        {projectContent}
                      </motion.a>
                    );
                  }

                  return (
                    <motion.article
                      key={project.title}
                      className={ui.projectRow}
                      initial={{ opacity: 0.96, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ amount: 0.34, once: true }}
                      transition={{
                        duration: 0.85,
                        ease: revealEase,
                        delay: index * 0.08,
                      }}
                      onMouseEnter={handleProjectEnter}
                      onMouseLeave={handleProjectLeave}
                    >
                      {projectContent}
                    </motion.article>
                  );
                })}
              </div>
            </motion.div>
          </section>

          <section id="philosophy" className={cn(ui.section, ui.philosophySection)}>
            <motion.div
              initial={{ opacity: 0.96, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.42, once: true }}
              transition={{ duration: 1, ease: revealEase }}
              className={ui.philosophyBlock}
            >
              <span className={ui.microLabel}>{t("philosophy.label")}</span>
              <PhilosophyPollination
                ariaLabel={t("philosophy.butterflyLabel")}
                buttonClassName={ui.philosophyButterflyButton}
                haloClassName={ui.philosophyButterflyHalo}
                metallicWord={t("philosophy.metallicWord")}
                motionClassName={ui.philosophyButterflyMotion}
                onButtonBlur={resetCursor}
                onButtonFocus={() => setFocusCursor("focus", t("cursor.butterfly"))}
                onButtonMouseEnter={() => setFocusCursor("focus", t("cursor.butterfly"))}
                onButtonMouseLeave={resetCursor}
                quote={t("philosophy.quote")}
                quoteClassName={ui.philosophyQuote}
                targetWord={t("philosophy.highlightWord")}
              />
              <p className={ui.supportingCopy}>{t("philosophy.supporting")}</p>
            </motion.div>
          </section>

          <section id="contact" className={cn(ui.section, ui.contactSection)}>
            <motion.div
              initial={{ opacity: 0.97, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.26, once: true }}
              transition={{ duration: 0.9, ease: revealEase }}
              className={ui.contactGrid}
            >
              <div>
                <span className={ui.microLabel}>{t("contact.label")}</span>
                <p className={ui.contactHeading}>{t("contact.heading")}</p>
              </div>
              <div className={ui.contactLinks}>
                {contacts.map((contact) => (
                  <a
                    key={contact.label}
                    className={ui.contactLink}
                    href={contact.href}
                    target={contact.href.startsWith("http") ? "_blank" : undefined}
                    rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
                    onMouseEnter={() => setFocusCursor("link", t("cursor.contact"))}
                    onMouseLeave={resetCursor}
                    onFocus={() => setFocusCursor("link", t("cursor.contact"))}
                    onBlur={resetCursor}
                  >
                    <span className={ui.contactLinkLabel}>{contact.label}</span>
                    <strong className={ui.contactLinkValue}>{contact.value}</strong>
                  </a>
                ))}
              </div>
            </motion.div>
          </section>
        </article>

        <aside className={ui.visualRail}>
          <div className={ui.visualSticky}>
            <div className={ui.railVisualFrame}>
              {isHeroVisualReady ? (
                <>
                  {isDesktopViewport ? (
                    <div className={ui.railLightRays} style={railLightRaysStyle}>
                      <LazyLightRays
                        raysOrigin="top-right"
                        raysColor="#f5efe2"
                        raysSpeed={0.4}
                        lightSpread={0.94}
                        rayLength={5}
                        fadeDistance={2}
                        saturation={0.72}
                        followMouse
                        mouseInfluence={0.07}
                        noiseAmount={0.04}
                        distortion={0.06}
                      />
                    </div>
                  ) : null}
                  <StoryFlower
                    className={ui.flowerSvg}
                    progress={railFlowerProgress}
                    hoveredProject={hoveredProject}
                    hoveredSkillLeaf={hoveredSkillLeaf}
                    highlightedSkillLeaves={highlightedProjectSkillLeaves}
                    activeProjectLabel={activeProjectLabel}
                    activeSkillLabel={hoveredSkillLabel}
                    activeSkillAccent={hoveredSkillAccent}
                    idPrefix="rail-flower"
                  />
                </>
              ) : null}
              {renderCodePrelude()}
            </div>
          </div>
        </aside>
      </div>
    </PortfolioEasterEgg>
  );
}
