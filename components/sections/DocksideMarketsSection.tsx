"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarouselArrow } from "@/components/ui/CarouselArrow";
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
  backgroundColor?: string;
  title?: string;
  description?: string;
  items?: MarketItem[];
};

export function DocksideMarketsSection({
  block,
}: {
  block: DocksideMarketsBlock;
}) {
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

  const bgColor = block.backgroundColor ?? "#FAFAFC";
  return (
    <section
      id="markets"
      className="relative z-0 -mt-1 mx-auto flex flex-col justify-start"
      style={{
        backgroundColor: bgColor,
        width: "100%",
        minHeight: 662,
        paddingTop: "clamp(9rem, 18vw, 13.5rem)",
      }}
    >
      <div className="mx-auto flex w-full flex-col px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
          wideTitleOnDesktop
        />
        <div className="relative mt-8 pb-0">
          <div className="relative flex items-center justify-center border border-black">
            <div className="mx-auto w-full max-w-[1363px]">
              <div
                ref={scrollRef}
                className="scrollbar-hide flex flex-nowrap gap-0.5 overflow-x-auto scroll-smooth pl-14 pr-14 [-webkit-overflow-scrolling:touch]"
              >
              {items.length > 0
                ? items.map((item, idx) => {
                    const img = urlFor(item.logo);
                    const logoW = item.logoWidth ?? 115;
                    const logoH = item.logoHeight ?? 115;
                    const logoAspect = item.logoAspectRatio ?? "1/1";
                    const hasCustomSize =
                      item.logoWidth != null || item.logoHeight != null;
                    const maxLogoW = 700;
                    const maxLogoH = hasCustomSize ? 200 : 75;
                    const scale =
                      Math.max(
                        25,
                        Math.min(200, item.logoScalePercent ?? 100),
                      ) / 100;
                    const w = Math.min(logoW * scale, maxLogoW);
                    const h = Math.min(logoH * scale, maxLogoH);
                    const content = img ? (
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
                          src={img.url()}
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
                    const cellStyle = { backgroundColor: img ? bgColor : "#FAFAFC" };
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
            </div>
            <CarouselArrow
              direction="prev"
              onClick={() => scrollByDir(-1)}
              disabled={false}
              ariaLabel="Previous"
              theme="light"
              inset
              insetNoBackground
            />
            <CarouselArrow
              direction="next"
              onClick={() => scrollByDir(1)}
              disabled={false}
              ariaLabel="Next"
              theme="light"
              inset
              insetNoBackground
            />
          </div>
        </div>
      </div>
    </section>
  );
}
