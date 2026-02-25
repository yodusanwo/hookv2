"use client";

import * as React from "react";
import Link from "next/link";

type CarouselItem = { src: string; alt: string };

const IMAGE_LAYER = "absolute left-0 right-0 bottom-0 top-0 w-full h-full";
const IMAGE_LAYER_STYLE = { top: 0 } as const;
const FONT_INTER = "[font-family:var(--font-inter),Inter,sans-serif]";

export function HeroCarousel({
  headlineLine1,
  headlineLine2,
  subline,
  ctaLabel,
  ctaHref,
  items,
  intervalMs = 5000,
}: {
  headlineLine1: string;
  headlineLine2: string;
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
    <section className="relative -mt-[100px] w-full min-w-0 min-h-screen max-w-full overflow-visible">
      {/* Full-bleed background image */}
      {active.src ? (
        <img
          key={active.src}
          src={active.src}
          alt={active.alt}
          className={`${IMAGE_LAYER} max-w-full min-w-0 object-cover`}
          style={IMAGE_LAYER_STYLE}
        />
      ) : (
        <div className={`${IMAGE_LAYER} bg-slate-200`} style={IMAGE_LAYER_STYLE} />
      )}
      <div className={`${IMAGE_LAYER} ring-1 ring-black/5`} style={IMAGE_LAYER_STYLE} />
      <div
        className={`${IMAGE_LAYER} z-10 bg-gradient-to-b from-black/50 via-black/25 to-black/5 pointer-events-none`}
        style={IMAGE_LAYER_STYLE}
      />

      <div
        className="absolute z-20 flex flex-col top-1/2 -translate-y-1/2 left-4 right-4 sm:left-8 sm:right-8 md:left-12 md:right-auto lg:left-[245px] max-w-[920px] text-left items-start px-6 py-5 sm:px-8 sm:py-6 rounded-xl bg-gradient-to-br from-black/30 via-black/15 to-transparent backdrop-blur-[2px]"
      >
        <h1
          className={`${FONT_INTER} max-w-full`}
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "clamp(1.5rem, 6vw, 56px)",
            fontWeight: 300,
            lineHeight: "120%",
            letterSpacing: "-0.02em",
            color: "var(--gray-content-background-text-icon-0, #F2F6EF)",
            fontStyle: "normal",
          }}
        >
          <span className="block">{headlineLine1}</span>
          <span className="block">{headlineLine2}</span>
        </h1>
        <p
          className={`${FONT_INTER} mt-3 sm:mt-6 max-w-[920px]`}
          style={{
            color: "#FFF",
            fontFamily: "Inter, var(--font-inter), sans-serif",
            fontSize: "24px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
          }}
        >
          {subline}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center mt-4 sm:mt-6 rounded-2xl text-white font-semibold w-full max-w-[200px] sm:max-w-[250px] h-12 sm:h-[70px] text-base sm:text-2xl border border-transparent transition-all duration-300 ease-out bg-[var(--brand-green)] hover:bg-white/20 hover:border-white/40 hover:backdrop-blur-sm"
          style={{ lineHeight: "normal", fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}

