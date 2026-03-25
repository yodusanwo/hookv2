import {
  ROUTE_HERO_TOP_PADDING_CLASSES,
  ROUTE_LIGHT_BLUE_CSS_VAR,
  ROUTE_MAIN_MIN_HEIGHT_CLASSES,
} from "@/components/loading/routeLoadingShell";

/**
 * PDP shell while product + below-the-fold data stream. Matches hero padding/background
 * (see app/products/[handle]/page.tsx) to reduce CLS; min-height keeps the footer below the fold.
 */
export default function ProductLoading() {
  return (
    <main
      className={`mx-auto max-w-6xl px-4 ${ROUTE_MAIN_MIN_HEIGHT_CLASSES} ${ROUTE_HERO_TOP_PADDING_CLASSES}`}
      style={{ backgroundColor: ROUTE_LIGHT_BLUE_CSS_VAR }}
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square w-full max-w-xl animate-pulse rounded-lg bg-slate-200/80 mx-auto lg:mx-0" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-slate-300/70" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200/80" />
          <div className="mt-4 h-12 w-40 animate-pulse rounded-md bg-slate-200/90" />
          <div className="mt-6 h-24 w-full animate-pulse rounded bg-slate-200/60" />
        </div>
      </div>
    </main>
  );
}
