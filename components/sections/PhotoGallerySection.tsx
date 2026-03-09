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

/** Maps image index to grid area. Layout:
 *   p1 p2 p4   (p1, p4 tall)
 *   p1 p3 p4
 *   p5 p6 p8   (p5, p8 tall)
 *   p5 p7 p9   (p9 short)
 */
const GRID_AREAS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"] as const;

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
          <div
            className="mt-8 mx-auto rounded-[12px] overflow-hidden"
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "repeat(4, clamp(120px, 25vw, 200px))",
              gridTemplateAreas: `
                "p1 p2 p4"
                "p1 p3 p4"
                "p5 p6 p8"
                "p5 p7 p9"
              `,
              maxWidth: 600,
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
                  style={{ gridArea }}
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
