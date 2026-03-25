/**
 * Shown during RSC resolution for /shop and /shop/[category] (same segment layout).
 * Does not reduce TTFB; gives immediate feedback while Sanity + Shopify data loads.
 */
export default function ShopLoading() {
  return (
    <main
      className="pt-[140px] pb-16 sm:pt-[170px] md:pt-[230px]"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
      aria-busy="true"
      aria-label="Loading shop"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 h-6 max-w-[12rem] animate-pulse rounded bg-slate-300/60" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-16 min-h-[3.5rem] min-w-[140px] flex-1 animate-pulse rounded-xl bg-slate-200/90 sm:min-w-[100px] sm:max-w-[180px]"
            />
          ))}
        </div>
        <div className="mt-10 h-48 w-full animate-pulse rounded-lg bg-slate-200/70" />
      </div>
    </main>
  );
}
