"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

type CarouselItem =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; alt: string; poster?: string };

const IMAGE_LAYER = "absolute left-0 right-0 bottom-0 top-0 w-full h-full";
const IMAGE_LAYER_STYLE = { top: 0 } as const;
const FONT_INTER = "[font-family:var(--font-inter),Inter,sans-serif]";
/** Subline (tagline under headline): +0.25rem on viewports below `sm`, match prior fluid size from sm up */
const HERO_SUBLINE_TEXT =
  "max-sm:text-[calc(0.25rem+clamp(0.75rem,1.5vw+0.5rem,1.5rem))] sm:text-[clamp(0.75rem,1.5vw+0.5rem,1.5rem)]";

export function HeroCarousel({
  variant = "default",
  headlineLine1,
  headlineLine2,
  subline,
  ctaLabel,
  ctaHref,
  items,
  intervalMs = 5000,
}: {
  variant?: "default" | "story";
  headlineLine1: string;
  headlineLine2: string;
  subline: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: CarouselItem[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = React.useState(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const safeItems = items.length ? items : [{ type: "image" as const, src: "", alt: "" }];

  React.useEffect(() => {
    if (safeItems.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % safeItems.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [safeItems.length, intervalMs]);

  const active = safeItems[idx]!;

  React.useEffect(() => {
    if (active.type !== "video") return;
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    const playPromise = el.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // If autoplay is blocked, the poster/first frame still renders safely.
      });
    }
  }, [active]);

  return (
    <section className="relative -mt-[40px] w-full min-w-0 max-w-full overflow-visible">
      {/* Hero image area: responsive height, 760px on desktop; story variant taller */}
      <div
        className={
          variant === "story"
            ? "relative w-full overflow-hidden h-[min(75vh,520px)] sm:h-[min(68vh,560px)] md:h-[840px]"
            : "relative w-full overflow-hidden h-[min(75vh,560px)] sm:h-[min(70vh,580px)] md:h-[760px]"
        }
      >
        {/* One hero media item at a time (mobile LCP: avoid loading every slide’s full-res asset up front). */}
        {safeItems.some((it) => it.src) ? (
          active.src ? (
            active.type === "video" ? (
              <video
                key={active.src}
                ref={videoRef}
                className={`${IMAGE_LAYER} z-[1] object-cover`}
                style={
                  variant === "story"
                    ? {
                        ...IMAGE_LAYER_STYLE,
                        objectPosition: "center 100%",
                        transform: "translateY(calc(12% - 16px))",
                      }
                    : {
                        ...IMAGE_LAYER_STYLE,
                        objectPosition: "center 100%",
                        transform: "translateY(calc(12% - 16px))",
                      }
                }
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={active.poster}
                src={active.src}
              >
              </video>
            ) : (
            <Image
              key={active.src}
              src={active.src}
              alt={active.alt}
              fill
              priority={idx === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1600px"
              className={`${IMAGE_LAYER} z-[1] object-cover transition-opacity duration-500 opacity-100`}
              style={
                variant === "story"
                  ? {
                      ...IMAGE_LAYER_STYLE,
                      objectPosition: "center 100%",
                      transform: "translateY(calc(12% - 16px))",
                    }
                  : {
                      ...IMAGE_LAYER_STYLE,
                      objectPosition: "center 100%",
                      transform: "translateY(calc(12% - 16px))",
                    }
              }
            />
            )
          ) : null
        ) : (
          <div
            className={`${IMAGE_LAYER} bg-slate-200`}
            style={IMAGE_LAYER_STYLE}
          />
        )}
        {/* Active slide has no image URL: show placeholder (e.g. mixed empty and filled slides). */}
        {!active.src && safeItems.some((it) => it.src) ? (
          <div
            className={`${IMAGE_LAYER} z-[2] bg-slate-200`}
            style={IMAGE_LAYER_STYLE}
          />
        ) : null}
        <div
          className={`${IMAGE_LAYER} ring-1 ring-black/5`}
          style={IMAGE_LAYER_STYLE}
        />
        <div
          className={`${IMAGE_LAYER} z-10 pointer-events-none`}
          style={
            variant === "story"
              ? {
                  background:
                    "linear-gradient(-0.64deg, rgba(0,0,0,0.4) 61.281%, rgba(255,255,255,0) 87.677%)",
                  ...IMAGE_LAYER_STYLE,
                }
              : {
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.25), rgba(0,0,0,0.05))",
                  ...IMAGE_LAYER_STYLE,
                }
          }
        />

        <div
          className={
            variant === "story"
              ? "absolute z-20 flex flex-col gap-[29px] left-4 right-4 sm:left-8 md:left-[100px] lg:left-[164px] top-[calc(55%+120px)] -translate-y-1/2 md:top-[582px] md:translate-y-0 max-w-[740px] text-left items-start"
              : "absolute z-20 flex flex-col top-[calc(50%+120px)] -translate-y-1/2 left-4 right-4 sm:left-8 sm:right-8 md:left-12 md:right-auto lg:left-[245px] max-w-[1040px] text-left items-start px-6 py-5 sm:px-8 sm:py-6 rounded-card bg-gradient-to-br from-black/30 via-black/15 to-transparent backdrop-blur-[2px]"
          }
        >
          <h1
            className={`${FONT_INTER} max-w-full ${
              variant === "default"
                ? "text-[24px] md:text-[clamp(1.5rem,4vw+1rem,3rem)] xl:whitespace-nowrap"
                : ""
            }`}
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 600,
              letterSpacing: "0%",
              color: "var(--gray-content-background-text-icon-0, #F2F6EF)",
              fontStyle: "normal",
              ...(variant === "story"
                ? { fontSize: "clamp(1.75rem, 4.5vw, 3rem)", lineHeight: 1.3 }
                : { lineHeight: "auto" }),
            }}
          >
            <span className="block">{headlineLine1}</span>
            {headlineLine2 ? (
              <span className="block">{headlineLine2}</span>
            ) : null}
          </h1>
          <p
            className={`${FONT_INTER} font-semibold sm:font-medium ${HERO_SUBLINE_TEXT} ${
              variant === "story" ? "max-w-[740px]" : "max-w-[920px]"
            }`}
            style={{
              color: "#FFF",
              fontFamily: "Inter, var(--font-inter), sans-serif",
              fontStyle: "normal",
              lineHeight: "normal",
              ...(variant === "default"
                ? { marginTop: "clamp(0.75rem, 2vw + 0.5rem, 1.5rem)" }
                : {}),
            }}
          >
            {subline}
          </p>
          {ctaLabel && ctaHref && variant !== "story" && (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-2xl text-white font-semibold w-full border border-transparent transition-all duration-300 ease-out bg-[var(--brand-green)] hover:bg-white/20 hover:border-white/40 hover:backdrop-blur-sm"
              style={{
                marginTop: "clamp(1rem, 2vw + 0.5rem, 1.5rem)",
                maxWidth: "min(100%, clamp(200px, 20vw + 120px, 250px))",
                height: "clamp(3rem, 6vw + 2rem, 4.375rem)",
                fontSize: "clamp(1rem, 1.25vw + 0.75rem, 1.5rem)",
                lineHeight: "normal",
                fontFamily: "var(--font-inter), Inter, sans-serif",
              }}
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
