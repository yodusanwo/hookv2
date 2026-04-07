"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

type CarouselItem =
  | { type: "image"; src: string; alt: string; mobileSrc?: string }
  | { type: "video"; src: string; alt: string; poster?: string };

const IMAGE_LAYER = "absolute left-0 right-0 bottom-0 top-0 w-full h-full";
const IMAGE_LAYER_STYLE = { top: 0 } as const;
const FONT_INTER = "[font-family:var(--font-inter),Inter,sans-serif]";
/** Subline (tagline under headline): +0.25rem on viewports below `sm`, match prior fluid size from sm up */
const HERO_SUBLINE_TEXT =
  "max-sm:text-[calc(0.25rem+clamp(0.75rem,1.5vw+0.5rem,1.5rem))] sm:text-[clamp(0.75rem,1.5vw+0.5rem,1.5rem)]";

const HERO_PUSH_MS = 550;

type HeroSlideState =
  | { kind: "stable"; index: number }
  | { kind: "pushing"; from: number; to: number };

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
  const [slide, setSlide] = React.useState<HeroSlideState>({
    kind: "stable",
    index: 0,
  });
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const safeItems = items.length ? items : [{ type: "image" as const, src: "", alt: "" }];

  const currentIndex =
    slide.kind === "stable" ? slide.index : slide.to;

  React.useEffect(() => {
    if (safeItems.length <= 1) return;
    const id = window.setInterval(() => {
      setSlide((s) => {
        if (s.kind === "pushing") return s;
        const next = (s.index + 1) % safeItems.length;
        return { kind: "pushing", from: s.index, to: next };
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [safeItems.length, intervalMs]);

  React.useEffect(() => {
    if (slide.kind !== "pushing") return;
    const to = slide.to;
    const timer = window.setTimeout(() => {
      setSlide({ kind: "stable", index: to });
    }, HERO_PUSH_MS);
    return () => window.clearTimeout(timer);
  }, [slide]);

  const active = safeItems[currentIndex]!;

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

  /** Values live in `app/globals.css` (`--hero-media-translate-y-*`). */
  const heroMediaTransform =
    variant === "story"
      ? "var(--hero-media-translate-y-story)"
      : "var(--hero-media-translate-y-default)";

  function renderMediaLayer(
    item: CarouselItem,
    key: string,
    options: {
      zClass: string;
      anim: "in" | "out" | "none";
      priority: boolean;
      attachVideoRef: boolean;
    },
  ) {
    if (!item.src) return null;
    const animClass =
      options.anim === "in"
        ? "hero-carousel-slide-in"
        : options.anim === "out"
          ? "hero-carousel-slide-out"
          : "";

    const zoomWrap =
      options.anim === "none"
        ? "absolute inset-0 overflow-hidden hero-carousel-media-zoom"
        : "absolute inset-0 overflow-hidden";

    if (item.type === "video") {
      return (
        <div
          key={key}
          className={`${IMAGE_LAYER} ${options.zClass} overflow-hidden`}
          style={IMAGE_LAYER_STYLE}
        >
          <div
            className={animClass ? `${IMAGE_LAYER} ${animClass}` : IMAGE_LAYER}
            style={IMAGE_LAYER_STYLE}
          >
            <div className={zoomWrap}>
              <video
                ref={options.attachVideoRef ? videoRef : undefined}
                className={`${IMAGE_LAYER} object-cover`}
                style={{
                  ...IMAGE_LAYER_STYLE,
                  objectPosition: "center 100%",
                  transform: heroMediaTransform,
                }}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={item.poster}
                src={item.src}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={key}
        className={`${IMAGE_LAYER} ${options.zClass} overflow-hidden`}
        style={IMAGE_LAYER_STYLE}
      >
        <div
          className={animClass ? `${IMAGE_LAYER} ${animClass}` : IMAGE_LAYER}
          style={IMAGE_LAYER_STYLE}
        >
          <div className={zoomWrap}>
            {"mobileSrc" in item && item.mobileSrc ? (
              <picture className="absolute inset-0 block h-full w-full">
                <source media="(max-width: 767px)" srcSet={item.mobileSrc} />
                {/*
                  Native <img> as <picture> fallback: next/image adds its own srcSet on the img,
                  which breaks art-direction (mobile <source> is ignored). URLs are still sized via Sanity CDN.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className={`${IMAGE_LAYER} object-cover`}
                  style={{
                    ...IMAGE_LAYER_STYLE,
                    objectPosition: "center 100%",
                    transform: heroMediaTransform,
                  }}
                  fetchPriority={options.priority ? "high" : "auto"}
                  decoding="async"
                />
              </picture>
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                priority={options.priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1600px"
                className={`${IMAGE_LAYER} object-cover`}
                style={{
                  ...IMAGE_LAYER_STYLE,
                  objectPosition: "center 100%",
                  transform: heroMediaTransform,
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  const hasAnySrc = safeItems.some((it) => it.src);
  const showPush =
    slide.kind === "pushing" &&
    safeItems.length > 1 &&
    safeItems[slide.from]?.src &&
    safeItems[slide.to]?.src;

  /** Story: taller mobile column so headline + frosted panel are not clipped by overflow-hidden. */
  const mediaHeightsClass =
    variant === "story"
      ? "h-[min(78vh,620px)] sm:h-[min(70vh,580px)] md:h-[840px]"
      : "h-[min(75vh,560px)] sm:h-[min(70vh,580px)] md:h-[760px]";

  /** Same frosted gradient surface as the home hero; story only differs in position/size. */
  const headlinePanelSurface =
    "rounded-card bg-gradient-to-br from-black/30 via-black/15 to-transparent backdrop-blur-[2px]";

  /** Story: panel is sibling of overflow-hidden media; `55%+120` matches pre-refactor and scales with hero height (was wrongly reduced to `52%+96`). */
  const headlinePanelClass =
    variant === "story"
      ? `absolute z-20 flex flex-col gap-[29px] left-4 right-4 sm:left-8 md:left-[100px] lg:left-[164px] top-[calc(55%+120px)] -translate-y-1/2 md:top-[582px] md:translate-y-0 max-w-[740px] text-left items-start px-6 py-5 sm:px-8 sm:py-6 ${headlinePanelSurface}`
      : `absolute z-20 flex flex-col top-[calc(50%+120px)] -translate-y-1/2 left-4 right-4 sm:left-8 sm:right-8 md:left-12 md:right-auto lg:left-[245px] max-w-[1040px] text-left items-start px-6 py-5 sm:px-8 sm:py-6 ${headlinePanelSurface}`;

  const mediaColumn = (
    <>
      {hasAnySrc ? (
        showPush ? (
          <>
            {renderMediaLayer(safeItems[slide.from]!, `out-${slide.from}`, {
              zClass: "z-[1]",
              anim: "out",
              priority: false,
              attachVideoRef: false,
            })}
            {renderMediaLayer(safeItems[slide.to]!, `in-${slide.to}`, {
              zClass: "z-[2]",
              anim: "in",
              priority: false,
              attachVideoRef: true,
            })}
          </>
        ) : active.src ? (
          renderMediaLayer(active, active.src, {
            zClass: "z-[1]",
            anim: "none",
            priority: slide.kind === "stable" && slide.index === 0,
            attachVideoRef: true,
          })
        ) : null
      ) : (
        <div
          className={`${IMAGE_LAYER} bg-slate-200`}
          style={IMAGE_LAYER_STYLE}
        />
      )}
      {!active.src && hasAnySrc ? (
        <div
          className={`${IMAGE_LAYER} z-[2] bg-slate-200`}
          style={IMAGE_LAYER_STYLE}
        />
      ) : null}
      <div
        className={`${IMAGE_LAYER} z-[1] pointer-events-none ring-1 ring-black/5`}
        style={IMAGE_LAYER_STYLE}
      />
    </>
  );

  const headlinePanel = (
    <div className={headlinePanelClass}>
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
  );

  return (
    <section className="relative -mt-[40px] w-full min-w-0 max-w-full overflow-visible bg-[var(--brand-navy)]">
      {/* Hero image area: responsive height, 760px on desktop; story variant taller.
          Navy bg: media uses translateY + bottom anchoring so the top can briefly show parent bg;
          main is white — without this, mobile shows a hairline gap under the fixed header.
          Story: headline is a sibling of the overflow-hidden media column so the frosted panel is never clipped. */}
      {variant === "story" ? (
        <div className="relative w-full overflow-visible bg-[var(--brand-navy)]">
          <div
            className={`relative w-full overflow-hidden bg-[var(--brand-navy)] ${mediaHeightsClass}`}
          >
            {mediaColumn}
          </div>
          {headlinePanel}
        </div>
      ) : (
        <div
          className={`relative w-full overflow-hidden bg-[var(--brand-navy)] ${mediaHeightsClass}`}
        >
          {mediaColumn}
          {headlinePanel}
        </div>
      )}
    </section>
  );
}
