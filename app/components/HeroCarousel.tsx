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
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-8">
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-slate-100 px-6 py-10">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="max-w-md">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                  {headline}
                </h1>
                <p className="mt-3 text-sm text-slate-600">{subline}</p>
                <a
                  href={ctaHref}
                  className="mt-6 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  {ctaLabel}
                </a>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-slate-200">
                  {active.src ? (
                    <img
                      key={active.src}
                      src={active.src}
                      alt={active.alt}
                      className="h-[260px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[260px] w-full items-center justify-center text-slate-400">
                      <div className="h-28 w-28 rounded-3xl bg-slate-300/60" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {safeItems.slice(0, 5).map((_, dotIdx) => {
                const isActive = dotIdx === idx;
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setIdx(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      isActive ? "bg-slate-500" : "bg-slate-300"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

