import { urlFor } from "@/lib/sanityImage";

type GalleryImage = {
  image?: { asset?: { _ref?: string } };
  alt?: string;
  caption?: string;
  badge?: string;
};

type PhotoGalleryBlock = {
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

/** Carousel slide groups for mobile: single tall or two stacked. [startIdx, count][] */
const CAROUSEL_SLIDES: [number, number][] = [
  [0, 1],
  [1, 2],
  [3, 1],
  [4, 1],
  [5, 2],
  [7, 2],
];

export function PhotoGallerySection({ block }: { block: PhotoGalleryBlock }) {
  const images = block.galleryImages ?? [];
  const title = (block.title ?? "").trim();
  const gridImages = images.slice(0, 9);

  return (
    <section
      id="photo-gallery"
      className="relative z-10 overflow-hidden py-12 md:py-14"
      style={{ backgroundColor: "#E6F7FF" }}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        {title && (
          <h2
            className="text-center capitalize"
            style={{
              color: "var(--Text-Color, #1E1E1E)",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "48px",
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "normal",
            }}
          >
            {title}
          </h2>
        )}
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
                      const img = item.image ? urlFor(item.image) : null;
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
                          {img ? (
                            <img
                              src={img.url()}
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
              aspectRatio: "1072 / 1008",
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
                aspectRatio: "1072 / 1008",
              }}
            >
            {gridImages.map((item, idx) => {
              const img = item.image ? urlFor(item.image) : null;
              const alt = item.alt?.trim() || `Gallery image ${idx + 1}`;
              const badge = item.badge?.trim();
              const gridArea = GRID_AREAS[idx];
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-[10px] bg-white shadow-md"
                  style={{
                    gridArea,
                    ...([1, 5, 6, 7, 8].includes(idx)
                      ? { minWidth: 350, minHeight: 261, aspectRatio: "350 / 261" }
                      : {}),
                    ...(idx === 2
                      ? { minWidth: 350, minHeight: 256, aspectRatio: "350 / 256" }
                      : {}),
                    ...([0, 3, 4].includes(idx)
                      ? { minWidth: 350, minHeight: 467, aspectRatio: "350 / 467" }
                      : {}),
                    ...(idx === 4 ? { marginTop: -13 } : {}),
                    ...([5, 6].includes(idx) ? { marginTop: -6 } : {}),
                    ...(idx === 7 ? { marginBottom: -11 } : {}),
                    ...(idx === 8 ? { marginTop: -60 } : {}),
                  }}
                >
                  {img ? (
                    <img
                      src={img.url()}
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
        {images.length > 9 && (
          <p className="mt-4 text-center text-sm text-slate-500">
            +{images.length - 9} more images (max 9 shown in grid)
          </p>
        )}
      </div>
    </section>
  );
}
