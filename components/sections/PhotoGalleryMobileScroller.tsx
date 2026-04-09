"use client";

import * as React from "react";

/** Time between automatic slide advances (mobile only, below `md`). */
const INTERVAL_MS = 4500;

/**
 * Advance the carousel horizontally only — does not call `scrollIntoView`, so the
 * document/window does not jump when the user has scrolled past this section.
 */
function scrollSlideWithinContainer(
  container: HTMLElement,
  slide: HTMLElement,
  behavior: ScrollBehavior,
) {
  const cRect = container.getBoundingClientRect();
  const sRect = slide.getBoundingClientRect();
  const nextLeft = container.scrollLeft + (sRect.left - cRect.left);
  container.scrollTo({ left: Math.max(0, nextLeft), behavior });
}

/**
 * Horizontal snap carousel with optional auto-advance on touch / narrow viewports.
 * Pauses when `prefers-reduced-motion` is set or viewport is `md` and up.
 */
export function PhotoGalleryMobileScroller({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /** Browser `setInterval` id (`number`); avoid `NodeJS.Timeout` from global `setInterval` typings. */
    let timer: number | undefined;

    const start = () => {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
      if (window.matchMedia("(min-width: 768px)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const slideEls = Array.from(el.children) as HTMLElement[];
      if (slideEls.length <= 1) return;

      let idx = 0;
      timer = window.setInterval(() => {
        if (window.matchMedia("(min-width: 768px)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        idx = (idx + 1) % slideEls.length;
        const slide = slideEls[idx];
        if (slide) scrollSlideWithinContainer(el, slide, "smooth");
      }, INTERVAL_MS);
    };

    start();
    const mq = window.matchMedia("(min-width: 768px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", start);
    mqMotion.addEventListener("change", start);

    return () => {
      mq.removeEventListener("change", start);
      mqMotion.removeEventListener("change", start);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {children}
    </div>
  );
}
