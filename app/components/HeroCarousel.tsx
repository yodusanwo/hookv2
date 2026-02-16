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
    <section className="relative -mt-[100px] w-full min-h-[90vh] overflow-visible">
      {/* Full-bleed background image */}
      {active.src ? (
        <img
          key={active.src}
          src={active.src}
          alt={active.alt}
          className="absolute left-0 right-0 bottom-0 h-full w-full object-cover"
          style={{ top: "115px" }}
        />
      ) : (
        <div className="absolute left-0 right-0 bottom-0 h-full bg-slate-200" style={{ top: "115px" }} />
      )}
      <div className="absolute left-0 right-0 bottom-0 ring-1 ring-black/5" style={{ top: "115px" }} />

      {/* Overlays anchored to top – do not move when section height changes */}
      <div className="absolute top-0 left-0 right-0 h-0 overflow-visible pointer-events-none">
        <div
          className="absolute left-1/2 z-10"
          style={{ top: "-90px", width: "105%", transform: "translateX(calc(-50% - 25px))", aspectRatio: "644/171", minHeight: "360px" }}
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
          style={{ top: "-95px", width: "105%", transform: "translateX(calc(-50% - 25px))", aspectRatio: "612/133", minHeight: "350px" }}
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

