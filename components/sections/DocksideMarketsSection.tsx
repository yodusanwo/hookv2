"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlFor } from "@/lib/sanityImage";
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
  title?: string;
  description?: string;
  items?: MarketItem[];
};

export function DocksideMarketsSection({ block }: { block: DocksideMarketsBlock }) {
  const title = block.title ?? "Find us at these Chicagoland Farmers Markets";
  const description = block.description ?? "";
  const items = block.items ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.min(400, el.clientWidth);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <section
      id="markets"
      className="flex min-h-[420px] flex-col justify-start border-4 border-green-500 bg-[#FAFAFC] pt-10 pb-10 md:min-h-[650px] md:justify-end md:pt-20 md:pb-14"
    >
      <div
        className="mx-auto flex w-full min-h-0 flex-1 flex-col justify-start px-4 md:justify-end md:px-12"
        style={{ maxWidth: 1440 }}
      >
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />
        <div className="relative mt-8">
          <div
            ref={scrollRef}
            className="mx-14 flex flex-nowrap gap-0.5 overflow-x-auto scroll-smooth [-webkit-overflow-scrolling:touch] md:mx-16"
          >
          {items.length > 0
            ? items.map((item, idx) => {
                const img = urlFor(item.logo);
                const logoW = item.logoWidth ?? 115;
                const logoH = item.logoHeight ?? 115;
                const logoAspect = item.logoAspectRatio ?? "1/1";
                const hasCustomSize = item.logoWidth != null || item.logoHeight != null;
                const maxLogoW = 700;
                const maxLogoH = hasCustomSize ? 200 : 75;
                const scale = Math.max(25, Math.min(200, item.logoScalePercent ?? 100)) / 100;
                const w = Math.min(logoW * scale, maxLogoW);
                const h = Math.min(logoH * scale, maxLogoH);
                const content = img ? (
                  <div
                    role="img"
                    aria-label={item.label ?? ""}
                    className="max-w-full shrink-0 rounded-none"
                    style={{
                      width: w,
                      height: h,
                      maxWidth: "100%",
                      aspectRatio: logoAspect,
                      background: `url(${img.url()}) #FAFAFC 50% / contain no-repeat`,
                    }}
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                );
                const safeUrl = safeHref(item.url);
                const cellClass =
                  "flex shrink-0 items-center justify-center bg-[#FAFAFC] p-0 w-[calc((100%-7*0.125rem)/8)] min-w-[72px]";
                return safeUrl !== "#" ? (
                  <a
                    key={idx}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${cellClass} hover:opacity-80 transition-opacity`}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={idx} className={cellClass}>
                    {content}
                  </div>
                );
              })
            : ["Lincoln Park", "Uptown", "Lakeview", "South Loop", "Logan Square", "Wicker Park"].map(
                (name) => (
                  <div
                    key={name}
                    className="flex shrink-0 w-[calc((100%-7*0.125rem)/8)] min-w-[72px] items-center justify-center bg-[#FAFAFC] p-0 text-xs font-semibold text-slate-700"
                  >
                    {name}
                  </div>
                )
              )}
          </div>
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 -translate-x-1 items-center justify-center rounded-full bg-transparent hover:opacity-80 md:inline-flex"
            aria-label="Previous"
          >
            <img
              src="/arrow_forward_ios_50dp_111827_FILL0_wght400_GRAD0_opsz48%204.svg"
              alt=""
              aria-hidden
              className="h-5 w-5 max-w-full rotate-180"
            />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 translate-x-1 items-center justify-center rounded-full bg-transparent hover:opacity-80 md:inline-flex"
            aria-label="Next"
          >
            <img
              src="/arrow_forward_ios_50dp_111827_FILL0_wght400_GRAD0_opsz48%204.svg"
              alt=""
              aria-hidden
              className="h-5 w-5 max-w-full"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
