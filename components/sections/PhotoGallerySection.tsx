import { urlForSizedImage } from "@/lib/sanityImage";

type GalleryImage = {
  image?: { asset?: { _ref?: string } };
  alt?: string;
  caption?: string;
  badge?: string;
};

type PhotoGalleryBlock = {
  backgroundColor?: string;
  title?: string;
  galleryImages?: GalleryImage[];
};

/** Maps image index to grid area. Layout (per Figma):
 *   p1 p2 p4   p1,p4,p5 tall 350×467; p2,p6,p7,p8,p9 short 350×261; p3 tall 350×256
 *   p1 p3 p4   11px gap, 30px below last row. p3 has extra 50px (only image 3 taller)
 *   p5 p3 p8   (p5,p8 extend up to fill gap; p3 spans into this row)
 *   p5 p6 p8
 *   p5 p7 p9
 */
const GRID_AREAS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"] as const;

/** Per-image layout tweaks (margin/translate). Adjust translateY to move an image up (negative) or down (positive). */
const GRID_ITEM_OFFSETS: Partial<
  Record<number, { marginTop?: number; marginBottom?: number; translateY?: number }>
> = {
  4: { marginTop: -13 },
  5: { marginTop: -6, translateY: -4 },
  6: { marginTop: -6, translateY: 42 },
  7: { marginBottom: -11, translateY: -10 },
  8: { marginTop: -40, translateY: 18 },
};

/** Carousel slide groups for mobile: single tall or two stacked. [startIdx, count][] */
const CAROUSEL_SLIDES: [number, number][] = [
  [0, 1],
  [1, 2],
  [3, 1],
  [4, 1],
  [5, 2],
  [7, 2],
];

const WAVE_CLEARANCE_PADDING = "clamp(8rem, 16vw, 12rem)";

export function PhotoGallerySection({
  block,
  hasWaveAbove = false,
}: {
  block: PhotoGalleryBlock;
  /** When true, adds top padding so the wave above isn't covered. */
  hasWaveAbove?: boolean;
}) {
  const images = block.galleryImages ?? [];
  const title = (block.title ?? "").trim() || "Gallery";
  const gridImages = images.slice(0, 9);

  return (
    <section
      id="photo-gallery"
      className="relative z-10 overflow-hidden py-12 md:py-14"
      style={{
        backgroundColor: block.backgroundColor ?? "#E6F7FF",
        ...(hasWaveAbove ? { paddingTop: WAVE_CLEARANCE_PADDING } : {}),
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-4">
        <h2
          className="text-center capitalize"
          style={{
            color: "var(--Text-Color, #1E1E1E)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "3rem",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "normal",
          }}
        >
          {title}
        </h2>
        {gridImages.length > 0 && (
          <>
            {/* Mobile: carousel with stacked pairs */}
            <div className="mt-8 md:hidden">
              <div
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {CAROUSEL_SLIDES.map(([startIdx, count], slideIdx) => (
                  <div
                    key={slideIdx}
                    className="flex flex-col gap-3 shrink-0 w-[85vw] max-w-[360px] snap-center"
                  >
                    {Array.from({ length: count }).map((_, i) => {
                      const idx = startIdx + i;
                      const item = gridImages[idx];
                      if (!item) return null;
                      const imgUrl = item.image ? urlForSizedImage(item.image, 700) : null;
                      const alt = item.alt?.trim() || `Gallery image ${idx + 1}`;
                      const badge = item.badge?.trim();
                      const isTall = count === 1 && [0, 3, 4].includes(startIdx);
                      const isP3 = idx === 2;
                      const aspectClass = isTall
                        ? "aspect-[350/467]"
                        : isP3
                          ? "aspect-[350/256]"
                          : "aspect-[350/261]";
                      return (
                        <div
                          key={idx}
                          className={`relative overflow-hidden rounded-[10px] bg-white shadow-md ${aspectClass}`}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={alt}
                              className="w-full h-full object-cover block"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200" />
                          )}
                          {badge && (
                            <span
                              className="absolute bottom-2.5 left-2.5 font-bold text-sm px-2.5 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: "#e53935" }}
                            >
                              {badge}
                            </span>
                          )}
                          {item.caption?.trim() && !badge && (
                            <p className="absolute bottom-2.5 left-2.5 right-2.5 text-sm text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2">
                              {item.caption}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop: grid */}
            <div
              className="photo-gallery-wrapper mt-8 mx-auto w-full max-w-[1072px] overflow-hidden [container-type:inline-size] hidden md:block"
            style={{
              aspectRatio: "1072 / 1085",
              position: "relative",
            }}
          >
            <style>{`
              @container (max-width: 1071px) {
                .photo-gallery-wrapper .photo-gallery-grid {
                  transform: scale(calc(100cqw / 1072));
                  transform-origin: top center;
                }
              }
            `}</style>
            <div
              className="photo-gallery-grid absolute left-1/2 top-0 -translate-x-1/2 rounded-[12px] overflow-hidden pb-[30px]"
              style={{
                display: "grid",
                gap: 11,
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gridTemplateRows: "261px 206px 50px 211px 206px",
                gridTemplateAreas: `
                  "p1 p2 p4"
                  "p1 p3 p4"
                  "p5 p3 p8"
                  "p5 p6 p8"
                  "p5 p7 p9"
                `,
                width: 1072,
                aspectRatio: "1072 / 1085",
              }}
            >
            {gridImages.map((item, idx) => {
              const imgUrl = item.image ? urlForSizedImage(item.image, 700) : null;
              const alt = item.alt?.trim() || `Gallery image ${idx + 1}`;
              const badge = item.badge?.trim();
              const gridArea = GRID_AREAS[idx];
              const offsets = GRID_ITEM_OFFSETS[idx];
              const baseSize =
                [1, 5, 6, 7, 8].includes(idx)
                  ? { minWidth: 350, minHeight: 261, aspectRatio: "350 / 261" as const }
                  : idx === 2
                    ? { minWidth: 350, minHeight: 256, aspectRatio: "350 / 256" as const }
                    : [0, 3, 4].includes(idx)
                      ? { minWidth: 350, minHeight: 467, aspectRatio: "350 / 467" as const }
                      : {};
              const offsetStyle = offsets
                ? {
                    ...(offsets.marginTop !== undefined && { marginTop: offsets.marginTop }),
                    ...(offsets.marginBottom !== undefined && { marginBottom: offsets.marginBottom }),
                    ...(offsets.translateY !== undefined && {
                      transform: `translateY(${offsets.translateY}px)`,
                    }),
                  }
                : {};
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-[10px] bg-white shadow-md"
                  style={{
                    gridArea,
                    ...baseSize,
                    ...offsetStyle,
                  }}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={alt}
                      className="w-full h-full object-cover block"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200" />
                  )}
                  {badge && (
                    <span
                      className="absolute bottom-2.5 left-2.5 font-bold text-sm px-2.5 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: "#e53935" }}
                    >
                      {badge}
                    </span>
                  )}
                  {item.caption?.trim() && !badge && (
                    <p className="absolute bottom-2.5 left-2.5 right-2.5 text-sm text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              );
            })}
            </div>
          </div>
          </>
        )}
      </div>
    </section>
  );
}
