"use client";

/**
 * Catches errors in the product route segment (outside the page try/catch).
 */
export default function ProductRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-2xl font-semibold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        We couldn&apos;t load this product. Please try again.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        Try again
      </button>
      {process.env.NODE_ENV === "development" && error?.message ? (
        <pre className="mt-6 max-h-48 overflow-auto rounded-md bg-slate-100 p-3 text-xs text-slate-700">
          {error.message}
        </pre>
      ) : null}
    </main>
  );
}
