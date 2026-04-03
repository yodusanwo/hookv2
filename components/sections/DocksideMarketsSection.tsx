"use client";

import { useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarouselArrow } from "@/components/ui/CarouselArrow";
import { urlForSizedImage } from "@/lib/sanityImage";
import { sanitizeCssCustomPropertyValue } from "@/lib/sanitizeCssCustomPropertyValue";
import { safeHref } from "@/lib/urlValidation";

type MarketItem = {
  label?: string;
  logo?: { asset?: { _ref?: string } };
  url?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoAspectRatio?: string;
  logoScalePercent?: number;
};

type DocksideMarketsBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  items?: MarketItem[];
};

const DEFAULT_TOP_PADDING = "clamp(9rem, 18vw, 13.5rem)";
const DEFAULT_MIN_HEIGHT = 662;

export function DocksideMarketsSection({
  block,
  topPadding,
  bottomPadding,
  minHeight,
  arrowColor,
}: {
  block: DocksideMarketsBlock;
  /** Optional top padding CSS value (e.g. reduced on /story page). */
  topPadding?: string;
  /** Optional bottom padding CSS value (e.g. reduced on /story page). */
  bottomPadding?: string;
  /** Optional min-height in px (e.g. half = 331 on /story to reduce bottom space). */
  minHeight?: number;
  /** Optional arrow color (e.g. #1E1E1E on /calendar page). */
  arrowColor?: string;
}) {
  const title = block.title ?? "Find us at these Chicagoland Farmers Markets";
  const description = block.description ?? "";
  const items = block.items ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mobilePage, setMobilePage] = useState(0);
  const bgColor = block.backgroundColor ?? "#FAFAFC";

  const ITEMS_PER_MOBILE_PAGE = 4;
  const mobileTotalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_MOBILE_PAGE));
  const mobilePageItems = items.length > 0
    ? items.slice(mobilePage * ITEMS_PER_MOBILE_PAGE, mobilePage * ITEMS_PER_MOBILE_PAGE + ITEMS_PER_MOBILE_PAGE)
    : [];

  function scrollByDir(dir: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.min(400, el.clientWidth);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  function renderMarketCell(item: MarketItem, idx: number, cellClassExtra = "") {
    const logoUrl = item.logo ? urlForSizedImage(item.logo, 400) : null;
    const logoW = item.logoWidth ?? 115;
    const logoH = item.logoHeight ?? 115;
    const logoAspect = item.logoAspectRatio ?? "1/1";
    const hasCustomSize = item.logoWidth != null || item.logoHeight != null;
    const maxLogoW = 700;
    const maxLogoH = hasCustomSize ? 200 : 75;
    const scale = Math.max(25, Math.min(200, item.logoScalePercent ?? 100)) / 100;
    const w = Math.min(logoW * scale, maxLogoW);
    const h = Math.min(logoH * scale, maxLogoH);
    const content = logoUrl ? (
      <div
        role="img"
        aria-label={item.label ?? ""}
        className="max-w-full shrink-0 rounded-none flex items-center justify-center"
        style={{
          width: w,
          height: h,
          maxWidth: "100%",
          aspectRatio: logoAspect,
          backgroundColor: "transparent",
        }}
      >
        <img
          src={logoUrl}
          alt=""
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ display: "block" }}
        />
      </div>
    ) : (
      <span className="text-xs font-semibold text-slate-700">{item.label}</span>
    );
    const safeUrl = safeHref(item.url);
    const cellClass = `flex shrink-0 items-center justify-center p-0 ${cellClassExtra}`.trim();
    const cellStyle = { backgroundColor: logoUrl ? bgColor : "#FAFAFC" };
    return safeUrl !== "#" ? (
      <a
        key={idx}
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cellClass} hover:opacity-80 transition-opacity`}
        style={cellStyle}
      >
        {content}
      </a>
    ) : (
      <div key={idx} className={cellClass} style={cellStyle}>
        {content}
      </div>
    );
  }

  const sectionPt = sanitizeCssCustomPropertyValue(
    topPadding,
    DEFAULT_TOP_PADDING,
  );
  const sectionPb = sanitizeCssCustomPropertyValue(bottomPadding, "0");
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@media (max-width: 767px) { #markets { --dockside-pt: 48px; --dockside-pb: 48px; } } @media (min-width: 768px) { #markets { --dockside-pt: ${sectionPt}; --dockside-pb: ${sectionPb}; } }`,
        }}
      />
      <section
        id="markets"
        className="relative z-0 -mt-1 mx-auto flex flex-col justify-start"
        style={{
          backgroundColor: bgColor,
          width: "100%",
          minHeight: minHeight ?? DEFAULT_MIN_HEIGHT,
          paddingTop: "var(--dockside-pt)",
          paddingBottom: "var(--dockside-pb)",
        }}
      >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-6 md:px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
          wideTitleOnDesktop
        />
        <div className="relative mt-8 pb-0">
          {/* Mobile: 2x2 grid with arrows and dot pagination */}
          <div className="relative md:hidden">
            <div className="grid grid-cols-2 gap-3 px-14 min-h-[200px] sm:px-16">
              {items.length > 0
                ? mobilePageItems.map((item, idx) => (
                    <div key={mobilePage * ITEMS_PER_MOBILE_PAGE + idx} className="aspect-square flex items-center justify-center p-2 rounded-none">
                      {renderMarketCell(item, mobilePage * ITEMS_PER_MOBILE_PAGE + idx, "w-full h-full")}
                    </div>
                  ))
                : ["Lincoln Park", "Uptown", "Lakeview", "South Loop"].map((name) => (
                    <div
                      key={name}
                      className="aspect-square flex items-center justify-center bg-[#FAFAFC] p-4 text-xs font-semibold text-slate-700 rounded-none"
                    >
                      {name}
                    </div>
                  ))}
            </div>
            <div className="absolute inset-y-0 left-0 right-0 flex pointer-events-none [&_button]:pointer-events-auto">
              <CarouselArrow
                direction="prev"
                onClick={() => setMobilePage((p) => Math.max(0, p - 1))}
                disabled={mobilePage <= 0}
                ariaLabel="Previous markets"
                theme="light"
                inset
                insetNoBackground
                showOnMobile
                arrowColor={arrowColor}
              />
              <CarouselArrow
                direction="next"
                onClick={() => setMobilePage((p) => Math.min(mobileTotalPages - 1, p + 1))}
                disabled={mobilePage >= mobileTotalPages - 1}
                ariaLabel="Next markets"
                theme="light"
                inset
                insetNoBackground
                showOnMobile
                arrowColor={arrowColor}
              />
            </div>
            {/* Dot pagination */}
            <div className="flex justify-center gap-1.5 mt-4 flex-wrap">
              {Array.from({ length: mobileTotalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMobilePage(i)}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={i === mobilePage ? "true" : undefined}
                  className={`h-2 rounded-full transition-colors ${
                    i === mobilePage ? "bg-gray-800 w-5" : "bg-gray-300 w-2 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: arrows in side gutters (inline) so they never overlap logo strip */}
          <div className="hidden md:flex w-full max-w-[1363px] mx-auto items-center gap-2 sm:gap-3 md:gap-4">
            <CarouselArrow
              direction="prev"
              onClick={() => scrollByDir(-1)}
              disabled={false}
              ariaLabel="Previous"
              theme="light"
              inset
              insetNoBackground
              arrowColor={arrowColor}
              inline
            />
            <div
              ref={scrollRef}
              className="scrollbar-hide min-w-0 flex-1 flex flex-nowrap gap-0.5 overflow-x-auto scroll-smooth px-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {items.length > 0
                  ? items.map((item, idx) => {
                      const logoUrl = item.logo ? urlForSizedImage(item.logo, 400) : null;
                      const logoW = item.logoWidth ?? 115;
                      const logoH = item.logoHeight ?? 115;
                      const logoAspect = item.logoAspectRatio ?? "1/1";
                      const hasCustomSize =
                        item.logoWidth != null || item.logoHeight != null;
                      const maxLogoW = 700;
                      const maxLogoH = hasCustomSize ? 200 : 75;
                      const scale =
                        Math.max(25, Math.min(200, item.logoScalePercent ?? 100)) / 100;
                      const w = Math.min(logoW * scale, maxLogoW);
                      const h = Math.min(logoH * scale, maxLogoH);
                      const content = logoUrl ? (
                        <div
                          role="img"
                          aria-label={item.label ?? ""}
                          className="max-w-full shrink-0 rounded-none flex items-center justify-center"
                          style={{
                            width: w,
                            height: h,
                            maxWidth: "100%",
                            aspectRatio: logoAspect,
                            backgroundColor: "transparent",
                          }}
                        >
                          <img
                            src={logoUrl}
                            alt=""
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                            style={{ display: "block" }}
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700">
                          {item.label}
                        </span>
                      );
                      const safeUrl = safeHref(item.url);
                      const cellClass =
                        "flex shrink-0 items-center justify-center p-0 w-[calc((100%-7*0.125rem)/8)] min-w-[72px]";
                      const cellStyle = { backgroundColor: logoUrl ? bgColor : "#FAFAFC" };
                      return safeUrl !== "#" ? (
                        <a
                          key={idx}
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${cellClass} hover:opacity-80 transition-opacity`}
                          style={cellStyle}
                        >
                          {content}
                        </a>
                      ) : (
                        <div key={idx} className={cellClass} style={cellStyle}>
                          {content}
                        </div>
                      );
                    })
                  : [
                      "Lincoln Park",
                      "Uptown",
                      "Lakeview",
                      "South Loop",
                      "Logan Square",
                      "Wicker Park",
                    ].map((name) => (
                      <div
                        key={name}
                        className="flex shrink-0 w-[calc((100%-7*0.125rem)/8)] min-w-[72px] items-center justify-center bg-[#FAFAFC] p-0 text-xs font-semibold text-slate-700"
                      >
                        {name}
                      </div>
                    ))}
              </div>
            <CarouselArrow
              direction="next"
              onClick={() => scrollByDir(1)}
              disabled={false}
              ariaLabel="Next"
              theme="light"
              inset
              insetNoBackground
              arrowColor={arrowColor}
              inline
            />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
