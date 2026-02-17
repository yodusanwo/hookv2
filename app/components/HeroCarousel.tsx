"use client";

import * as React from "react";
import Link from "next/link";

type CarouselItem = { src: string; alt: string };

const IMAGE_TOP = "100px";
const IMAGE_LAYER = "absolute left-0 right-0 bottom-0 w-full h-full";
const IMAGE_LAYER_STYLE = { top: IMAGE_TOP } as const;
const OVERLAY_BASE = { width: "105%", transform: "translateX(calc(-50% - 25px))" } as const;
const CONTENT_BLOCK = { top: "438px", left: "245px", width: "740px", maxWidth: "calc(100% - 245px)" } as const;
const FONT_INTER = "[font-family:var(--font-inter),Inter,sans-serif]";

export function HeroCarousel({
  headline,
  subline,
  ctaLabel,
  ctaHref,
  items,
  intervalMs = 5000,
}: {
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
  items: CarouselItem[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = React.useState(0);
  const safeItems = items.length ? items : [{ src: "", alt: "" }];

  React.useEffect(() => {
    if (safeItems.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % safeItems.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [safeItems.length, intervalMs]);

  const active = safeItems[idx]!;

  return (
    <section className="relative -mt-[100px] w-full min-h-screen overflow-visible">
      {/* Full-bleed background image */}
      {active.src ? (
        <img
          key={active.src}
          src={active.src}
          alt={active.alt}
          className={`${IMAGE_LAYER} object-cover`}
          style={IMAGE_LAYER_STYLE}
        />
      ) : (
        <div className={`${IMAGE_LAYER} bg-slate-200`} style={IMAGE_LAYER_STYLE} />
      )}
      <div className={`${IMAGE_LAYER} ring-1 ring-black/5`} style={IMAGE_LAYER_STYLE} />
      <div
        className={`${IMAGE_LAYER} z-10 bg-gradient-to-b from-blue-800/85 via-blue-700/55 to-blue-800/10 pointer-events-none`}
        style={IMAGE_LAYER_STYLE}
      />

      <div className="absolute z-20 flex flex-col px-6" style={CONTENT_BLOCK}>
        <h1
          className={`text-white ${FONT_INTER}`}
          style={{ fontSize: "48px", fontWeight: 600, lineHeight: "130%" }}
        >
          {headline}
        </h1>
        <p
          className={`text-white ${FONT_INTER} mt-[25px]`}
          style={{ width: "740px", fontSize: "24px", fontWeight: 500, lineHeight: "normal" }}
        >
          {subline}
        </p>
        <Link
          href={ctaHref}
          className={`flex items-center justify-center mt-[25px] rounded-2xl text-white ${FONT_INTER} font-semibold transition-opacity hover:opacity-90`}
          style={{ width: "250px", height: "70px", fontSize: "24px", lineHeight: "normal", backgroundColor: "#069400" }}
        >
          {ctaLabel}
        </Link>
      </div>

      {/* Overlays anchored to top – do not move when section height changes */}
      <div className="absolute top-0 left-0 right-0 h-0 overflow-visible pointer-events-none">
        <div
          className="absolute left-1/2 z-10"
          style={{ ...OVERLAY_BASE, top: "-90px", aspectRatio: "644/171", minHeight: "360px" }}
          aria-hidden
        >
          <img
            src="/7 1.png"
            alt=""
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div
          className="absolute left-1/2 z-[15]"
          style={{ ...OVERLAY_BASE, top: "-95px", aspectRatio: "612/133", minHeight: "350px" }}
          aria-hidden
        >
          <img
            src="/wavy 1.png"
            alt=""
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>
    </section>
  );
}

