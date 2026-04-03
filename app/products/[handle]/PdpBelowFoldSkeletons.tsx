/** Fallback while Klaviyo + Sanity stream for the reviews block. */
export function PdpReviewsSectionSkeleton() {
  return (
    <section
      className="flex min-h-0 flex-col justify-center pb-12 md:pb-14 pt-36 md:pt-[clamp(8rem,12vw,10rem)]"
      style={{ backgroundColor: "#F8F8F8" }}
      aria-hidden
    >
      <div className="mx-auto max-w-6xl px-6 md:px-4">
        <div className="h-10 max-w-xs animate-pulse rounded bg-slate-300/50" />
        <div className="mt-4 h-5 max-w-md animate-pulse rounded bg-slate-200/70" />
        <div className="mt-10 h-64 w-full animate-pulse rounded-lg bg-slate-200/60" />
      </div>
    </section>
  );
}

/** Fallback while recipe cards stream. */
export function PdpRecipesSectionSkeleton() {
  return (
    <section
      className="px-4 py-12 md:py-16"
      style={{
        backgroundColor: "var(--brand-light-blue-bg)",
        paddingTop: "clamp(8rem, 16vw, 12rem)",
        paddingBottom: "clamp(6rem, 14vw, 10rem)",
      }}
      aria-hidden
    >
      <div className="mx-auto max-w-6xl px-6 md:px-4">
        <div className="h-10 max-w-sm animate-pulse rounded bg-slate-300/50" />
        <div className="mt-4 h-5 max-w-lg animate-pulse rounded bg-slate-200/70" />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-slate-200/60"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
