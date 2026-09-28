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
import type { ComponentType, SVGProps } from "react";

type Technology = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  key: string;
  label: string;
};

export const technologies: Technology[] = [
  {
    key: "javascript",
    label: "JavaScript (ES6+)",
    Icon: SiJavascript,
  },
  {
    key: "typescript",
    label: "TypeScript",
    Icon: SiTypescript,
  },
  {
    key: "react",
    label: "React",
    Icon: SiReact,
  },
  {
    key: "nextjs",
    label: "Next.js",
    Icon: SiNextdotjs,
  },
  {
    key: "redux",
    label: "Redux Toolkit / Context API",
    Icon: SiRedux,
  },
  {
    key: "html",
    label: "HTML5",
    Icon: SiHtml5,
  },
  {
    key: "css",
    label: "CSS",
    Icon: SiCss,
  },
  {
    key: "tailwind",
    label: "Tailwind CSS",
    Icon: SiTailwindcss,
  },
  {
    key: "shadcn",
    label: "Shadcn UI",
    Icon: SiShadcnui,
  },
  {
    key: "radix",
    label: "Radix UI",
    Icon: SiRadixui,
  },
  {
    key: "axios",
    label: "REST API / Axios",
    Icon: SiAxios,
  },
  {
    key: "git",
    label: "Git",
    Icon: SiGit,
  },
  {
    key: "github",
    label: "GitHub",
    Icon: SiGithub,
  },
  {
    key: "vite",
    label: "Vite",
    Icon: SiVite,
  },
  {
    key: "framer",
    label: "Framer Motion",
    Icon: SiFramer,
  },
];
