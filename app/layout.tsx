import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Onest } from "next/font/google";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import "./globals.css";

// Onest is the site's face; Inter and IBM Plex Mono are kept for the /resume page.
const onest = Onest({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-onest" });
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://asphodelius.dev"),
  title: "asphodelius",
  description: "Frontend developer. I build interfaces with React, Next.js and TypeScript.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#141614" },
    { media: "(prefers-color-scheme: light)", color: "#e4e8e1" },
  ],
};

// Chooses the theme before the first paint: a saved choice, otherwise the system setting.
const themeScript = `(function(){try{var m=localStorage.getItem("mode");if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.mode=m}catch(e){document.documentElement.dataset.mode="dark"}})()`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-site-locale") ?? (await getLocale());
  return (
    <html lang={locale} className={`${onest.variable} ${inter.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
