import Link from "next/link";

/**
 * Global 404 — matches Figma Website-Design node 873:404 (content block only;
 * header/footer come from SiteLayout in root layout).
 */
export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      className="main-below-site-header flex min-h-[min(60vh,800px)] flex-col items-center justify-center px-4 pb-16 md:pb-24"
      style={{ backgroundColor: "var(--section-bg-light, #f2f2f5)" }}
    >
      <div className="mx-auto flex w-full max-w-[486px] flex-col items-center gap-9 text-center">
        <h1
          className="font-normal text-[#1E1E1E]"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "36px",
            lineHeight: "50px",
            letterSpacing: "1px",
          }}
        >
          <span className="block">404</span>
          <span className="block">
            The page you were looking for does not exist.
          </span>
        </h1>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-[46px] min-h-[44px] w-full min-w-[164px] max-w-[220px] items-center justify-center rounded-md px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            style={{ backgroundColor: "var(--brand-green, #069400)" }}
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-[46px] min-h-[44px] w-full min-w-[164px] max-w-[220px] items-center justify-center rounded-md border border-solid bg-white px-6 text-sm font-semibold transition-colors hover:bg-emerald-50 sm:w-auto"
            style={{
              borderColor: "var(--brand-green, #069400)",
              color: "var(--brand-green, #069400)",
              fontFamily: "var(--font-inter), Inter, sans-serif",
            }}
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
