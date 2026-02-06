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
    <section className="relative w-full min-h-[60vh]">
      {/* Full-bleed background image */}
      {active.src ? (
        <img
          key={active.src}
          src={active.src}
          alt={active.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-200" />
      )}

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/10" />
      <div className="absolute inset-0 ring-1 ring-black/5" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {headline}
          </h1>
          <p className="mt-3 text-sm text-slate-700">{subline}</p>
          <a
            href={ctaHref}
            className="mt-7 inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-black/10 hover:bg-slate-50"
          >
            {ctaLabel}
          </a>
        </div>

        {/* Dots */}
        <div className="mt-10 flex items-center gap-2">
          {safeItems.slice(0, 6).map((_, dotIdx) => {
            const isActive = dotIdx === idx;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setIdx(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`h-2 w-2 rounded-full transition-colors ${
                  isActive ? "bg-slate-700" : "bg-slate-400/60"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

