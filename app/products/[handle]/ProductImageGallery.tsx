"use client";

import * as React from "react";

export function ProductImageGallery({
  images,
  productTitle,
}: {
  images: Array<{ url: string; altText: string | null }>;
  productTitle: string;
}) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const safeIndex = Math.max(0, Math.min(selectedIndex, images.length - 1));
  React.useEffect(() => {
    if (selectedIndex !== safeIndex) setSelectedIndex(safeIndex);
  }, [images.length, safeIndex, selectedIndex]);
  const main = images[safeIndex] ?? images[0];

  if (!main) return null;

  const sectionBgHex = "#d4f2ff";
  return (
    <div className="space-y-3">
      <div
        className="max-w-full overflow-hidden rounded-[10px] relative bg-[#d4f2ff]"
        style={{
          width: "min(661px, 100%)",
          aspectRatio: "1/1",
          background: `url(${main.url}) #d4f2ff 50% / cover no-repeat`,
          backgroundBlendMode: "multiply",
        }}
        role="img"
        aria-label={main.altText ?? productTitle}
      />
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
                className={`aspect-square w-full overflow-hidden rounded-[10px] border-2 transition-colors p-0 ${
                  safeIndex === i
                    ? "border-[var(--brand-navy)] ring-2 ring-[var(--brand-navy)] ring-offset-2"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                <span
                  className="block h-full w-full overflow-hidden rounded-[10px]"
                  style={{
                    background: `url(${img.url}) ${sectionBgHex} 50% / cover no-repeat`,
                    backgroundBlendMode: "multiply",
                  }}
                  role="img"
                  aria-hidden
                />
              </button>
            ))}
          </div>
          {images.length > 1 && (
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
          )}
        </>
      )}
    </div>
  );
}
