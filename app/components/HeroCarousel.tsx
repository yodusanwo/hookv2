"use client";

import * as React from "react";

type CarouselItem = { src: string; alt: string };

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
    <section className="relative w-full min-h-[60vh] overflow-visible">
      {/* Full-bleed background - image removed for now */}
      <div className="absolute left-0 right-0 bottom-0 h-full bg-slate-200" style={{ top: "50px" }} />

      {/* Overlay for readability - matches background offset (hidden when no image) */}

      {/* 7 1.png overlay - in front of hero image, aligned with top */}
      <div
        className="absolute left-1/2 z-10"
        style={{ top: "-173px", width: "110%", transform: "translateX(calc(-50% - 50px))", aspectRatio: "644/171", minHeight: "380px" }}
        aria-hidden
      >
        <img
          src="/7 1.png"
          alt=""
          className="h-full w-full object-cover object-top"
        />
      </div>

      {/* wavy 1.png overlay - in front of 7 1.png */}
      <div
        className="absolute left-1/2 z-[15]"
        style={{ top: "-183px", width: "110%", transform: "translateX(calc(-50% - 50px))", aspectRatio: "612/133", minHeight: "380px" }}
        aria-hidden
      >
        <img
          src="/wavy 1.png"
          alt=""
          className="h-full w-full object-cover object-top"
        />
      </div>

    </section>
  );
}

