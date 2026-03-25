/**
 * PDP shell while product + reviews + Sanity data resolve. Min-height avoids an empty
 * main region that makes the footer jump into view during load.
 */
export default function ProductLoading() {
  return (
    <main
      className="min-h-[calc(100dvh-7rem)] mx-auto max-w-6xl px-4 py-10 sm:py-14"
      style={{ backgroundColor: "#F2F2F5" }}
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
