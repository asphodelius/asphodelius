import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, JetBrains_Mono, Unbounded } from "next/font/google";

const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-unbounded" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-jetbrains" });
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-mono" });

export const fontClass = `${unbounded.variable} ${jetbrains.variable} ${inter.variable} ${ibmPlexMono.variable}`;

export const baseMetadata: Metadata = {
  metadataBase: new URL("https://asphodelius.dev"),
  title: "asphodelius",
  description: "Frontend developer. I build interfaces with React, Next.js and TypeScript.",
  openGraph: { type: "website", siteName: "asphodelius" },
};

export const baseViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1d1d1f" },
    { media: "(prefers-color-scheme: light)", color: "#ebeae6" },
  ],
};

export const themeScript = `(function(){try{var m=localStorage.getItem("mode");if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.mode=m;document.documentElement.dataset.ink=m}catch(e){document.documentElement.dataset.mode="dark";document.documentElement.dataset.ink="dark"}})()`;
