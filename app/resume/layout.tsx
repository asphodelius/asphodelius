import type { ReactNode } from "react";
import { baseMetadata, fontClass, themeScript } from "../shell";
import "../globals.css";

export const metadata = baseMetadata;

export default function ResumeLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={fontClass} suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
