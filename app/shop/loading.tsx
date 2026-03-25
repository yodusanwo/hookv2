import {
  ROUTE_HERO_TOP_PADDING_CLASSES,
  ROUTE_LIGHT_BLUE_CSS_VAR,
  ROUTE_MAIN_MIN_HEIGHT_CLASSES,
} from "@/components/loading/routeLoadingShell";

/**
 * Shown while the /shop RSC payload streams. Tall min-height keeps the layout footer
 * below the fold so users don’t see the footer wave before shop content.
 */
export default function ShopLoading() {
  return (
    <main
      className={`pb-12 ${ROUTE_MAIN_MIN_HEIGHT_CLASSES} ${ROUTE_HERO_TOP_PADDING_CLASSES}`}
      style={{ backgroundColor: ROUTE_LIGHT_BLUE_CSS_VAR }}
      aria-busy="true"
      aria-label="Loading shop"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 h-6 max-w-[12rem] animate-pulse rounded bg-slate-300/60" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-11 min-w-[120px] flex-1 animate-pulse rounded-[20px] bg-slate-200/90 sm:max-w-[158px]"
            />
          ))}
        </div>
        <div className="mt-12 h-64 w-full animate-pulse rounded-lg bg-slate-200/60 sm:h-80" />
        <div className="mt-6 h-48 w-full animate-pulse rounded-lg bg-slate-200/50" />
      </div>
    </main>
  );
}
