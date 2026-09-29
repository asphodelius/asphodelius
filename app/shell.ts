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

export const themeScript = `(function(){try{var m=localStorage.getItem("mode");if(m!=="light"&&m!=="dark")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.mode=m;document.documentElement.dataset.ink=m}catch(e){document.documentElement.dataset.mode="dark";document.documentElement.dataset.ink="dark"}})()(function(){if(location.search.indexOf("debug")<0)return;var t0=performance.now(),L=[],last="";function m(s){L.push(Math.round(performance.now()-t0)+" "+s)}var nv=performance.getEntriesByType("navigation")[0];m("start "+location.href+" nav="+(nv&&nv.type)+" ua="+navigator.userAgent);var d=document.documentElement;new MutationObserver(function(ms){ms.forEach(function(x){m("html@"+x.attributeName+"="+d.getAttribute(x.attributeName))})}).observe(d,{attributes:true});function tick(){var l=document.querySelector('[class*="__loader"]');var s=l?(+getComputedStyle(l).opacity).toFixed(1)+getComputedStyle(l).visibility[0]:"none";s+=" n="+document.querySelectorAll('[class*="__loader"]').length+" c="+document.querySelectorAll("canvas").length;if(s!==last)m("loader "+s);last=s;if(performance.now()-t0<9000)requestAnimationFrame(tick);else show()}requestAnimationFrame(tick);function watch(){if(!document.body)return setTimeout(watch,5);new MutationObserver(function(ms){ms.forEach(function(x){[].forEach.call(x.addedNodes,function(n){var c=String(n.className||n.nodeName);if(/site|loader|BODY|canvas|CANVAS/.test(c))m("+ "+c.slice(0,60)+" in "+String(x.target.className||x.target.nodeName).slice(0,40))});[].forEach.call(x.removedNodes,function(n){var c=String(n.className||n.nodeName);if(/site|loader|BODY|canvas|CANVAS/.test(c))m("- "+c.slice(0,60))})})}).observe(d,{childList:true,subtree:true})}watch();addEventListener("error",function(e){m("error "+e.message)});var ce=console.error;console.error=function(){m("console.error "+[].map.call(arguments,function(a){return String(a&&a.message||a)}).join(" ").slice(0,200));return ce.apply(console,arguments)};addEventListener("pageshow",function(e){m("pageshow persisted="+e.persisted)});addEventListener("visibilitychange",function(){m("vis "+document.visibilityState)});addEventListener("load",function(){m("load")});function show(){var p=document.createElement("pre");p.textContent=L.join("\\n");p.style.cssText="position:fixed;inset:8px;z-index:99999;overflow:auto;background:#fff;color:#000;font:12px/1.35 monospace;padding:10px;white-space:pre-wrap;margin:0";document.body.appendChild(p)}})();`;
