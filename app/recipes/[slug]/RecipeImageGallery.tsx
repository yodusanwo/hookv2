"use client";

import * as React from "react";

export function RecipeImageGallery({
  images,
  recipeTitle,
}: {
  images: Array<{ url: string; altText: string | null }>;
  recipeTitle: string;
}) {
  const validImages = images.filter((img) => img.url?.trim());
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const safeIndex =
    validImages.length > 0
      ? Math.max(0, Math.min(selectedIndex, validImages.length - 1))
      : 0;
  React.useEffect(() => {
    if (selectedIndex !== safeIndex) setSelectedIndex(safeIndex);
  }, [validImages.length, safeIndex, selectedIndex]);
  const main = validImages[safeIndex];

  if (validImages.length === 0) {
    return (
      <div
        className="max-w-full overflow-hidden rounded-[10px] bg-slate-200"
        style={{ width: "min(661px, 100%)", aspectRatio: "1/1" }}
        aria-label={recipeTitle}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="max-w-full overflow-hidden rounded-[10px]"
        style={{
          width: "min(661px, 100%)",
          aspectRatio: "1/1",
          background: main
            ? `url(${main.url}) lightgray 50% / cover no-repeat`
            : "lightgray",
        }}
        role="img"
        aria-label={main?.altText ?? recipeTitle}
      />
      {validImages.length > 1 && (
        <>
          <div
            className="grid grid-cols-3 gap-2"
            style={{ width: "min(661px, 100%)" }}
          >
            {validImages.slice(0, 6).map((img, i) => (
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
                    background: `url(${img.url}) lightgray 50% / cover no-repeat`,
                  }}
                  aria-hidden
                />
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1.5">
            {validImages.slice(0, 6).map((_, i) => (
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
