"use client";

import * as React from "react";
import { useProductVariant } from "@/app/components/ProductVariantContext";
import { galleryUrlsMatch } from "@/lib/galleryUrlsMatch";

// Appends Shopify CDN sizing params. Keeps the preload in page.tsx and the
// actual <img> src in sync — same URL = browser cache hit, no double fetch.
function shopifyImageUrl(url: string, width: number, quality = 80): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${width}&quality=${quality}&format=webp`;
}

export function ProductImageGallery({
  images,
  productTitle,
  initialSelectedIndex = 0,
}: {
  images: Array<{ url: string; altText: string | null }>;
  productTitle: string;
  /** From server: gallery index for `?variant=` / default variant (matches Shopify variant image). */
  initialSelectedIndex?: number;
}) {
  const { selectedVariant } = useProductVariant();
  const [selectedIndex, setSelectedIndex] = React.useState(() =>
    Math.max(0, Math.min(initialSelectedIndex, Math.max(0, images.length - 1))),
  );
  const safeIndex = Math.max(0, Math.min(selectedIndex, images.length - 1));

  React.useEffect(() => {
    if (selectedIndex !== safeIndex) setSelectedIndex(safeIndex);
  }, [images.length, safeIndex, selectedIndex]);

  /** Main image follows selected variant when Shopify assigns an image per variant. */
  React.useEffect(() => {
    if (images.length === 0) return;
    const url = selectedVariant?.image?.url;
    if (!url) {
      setSelectedIndex(0);
      return;
    }
    const idx = images.findIndex((img) => galleryUrlsMatch(img.url, url));
    if (idx >= 0) setSelectedIndex(idx);
  }, [selectedVariant?.id, images]);

  const main = images[safeIndex] ?? images[0];
  if (!main) return null;

  return (
    <div className="space-y-3">
      {/* ── Main image ─────────────────────────────────────────────────────── */}
      <div
        className="max-w-full overflow-hidden rounded-card relative bg-[#d4f2ff]"
        style={{ width: "min(661px, 100%)", aspectRatio: "1/1" }}
      >
        <img
          key={main.url} // remount on image switch — avoids stale src flash
          src={shopifyImageUrl(main.url, 900)}
          alt={main.altText ?? productTitle}
          width={900}
          height={900}
          // FIX: fetchpriority="high" so the browser prioritises this for LCP.
          // This matches the <link rel="preload"> in page.tsx (same sized URL)
          // so the browser serves it from cache — no double fetch.
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      {/* ── Thumbnails ──────────────────────────────────────────────────────── */}
      {images.length > 1 && (
        <>
          <div
            className="grid grid-cols-3 gap-2"
            style={{ width: "min(661px, 100%)" }}
          >
            {images.slice(0, 6).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`aspect-square w-full overflow-hidden rounded-card border-2 transition-colors p-0 relative bg-[#d4f2ff] ${
                  safeIndex === i
                    ? "border-[var(--brand-navy)] ring-2 ring-[var(--brand-navy)] ring-offset-2"
                    : "border-transparent hover:border-slate-300"
                }`}
                aria-label={img.altText ?? `${productTitle} image ${i + 1}`}
                aria-pressed={safeIndex === i}
              >
                <img
                  src={shopifyImageUrl(img.url, 300)}
                  alt=""
                  aria-hidden
                  width={300}
                  height={300}
                  // FIX: thumbnails are below the fold on mobile — lazy load them.
                  // The first thumbnail (i === 0) is visible immediately so keep eager.
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover rounded-card"
                  style={{ mixBlendMode: "multiply" }}
                />
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-1.5">
            {images.slice(0, 6).map((_, i) => (
              <span
                key={i}
                role="presentation"
                className={`h-1.5 w-1.5 rounded-full ${
                  safeIndex === i ? "bg-[var(--brand-navy)]" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
