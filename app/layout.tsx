import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, JetBrains_Mono, Unbounded } from "next/font/google";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import "./globals.css";

const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-unbounded" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-jetbrains" });
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://asphodelius.dev"),
  title: "asphodelius",
  description: "Frontend developer. I build interfaces with React, Next.js and TypeScript.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1d1d1f" },
    { media: "(prefers-color-scheme: light)", color: "#ebeae6" },
  ],
};

const themeScript = `(function(){try{var m=localStorage.getItem("mode");if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.mode=m}catch(e){document.documentElement.dataset.mode="dark"}})()`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-site-locale") ?? (await getLocale());
  return (
    <html lang={locale} className={`${unbounded.variable} ${jetbrains.variable} ${inter.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
