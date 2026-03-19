"use client";

/** Card for the first "Catch of the day" (Explore Products) section only. Sizing is independent of Product Carousel. */
import Link from "next/link";

export type ExploreProductCardProduct = {
  id: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  price: string;
  currencyCode: string;
  rating?: number;
};

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

export function ExploreProductCard({
  product,
  priority = false,
}: {
  product: ExploreProductCardProduct;
  /** When true, load image with high priority (eager + fetchPriority high) for LCP. Use for first visible card. */
  priority?: boolean;
}) {
  const rating = product.rating ?? 5;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col items-center w-full shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
      style={{ backgroundColor: "var(--brand-navy)" }}
    >
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: "331px",
          height: "226px",
          maxWidth: "100%",
          aspectRatio: "145 / 99",
          ...(!priority && product.imageUrl
            ? {
                background: `url(${product.imageUrl}) lightgray 0.681px -55.209px / 99.891% 146.507% no-repeat`,
              }
            : product.imageUrl ? {} : { backgroundColor: "lightgray" }),
        }}
        role={product.imageUrl && !priority ? "img" : undefined}
        aria-label={product.imageUrl && !priority ? product.title : undefined}
      >
        {priority && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "0.681px -55.209px" }}
            loading="eager"
            fetchPriority="high"
          />
        ) : null}
        {!product.imageUrl && (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
            </svg>
          </div>
        )}
        <div
          className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm"
          aria-hidden
        >
          <BagIcon className="h-5 w-5" />
        </div>
      </div>
      <div className="p-4">
        <h3
          className="font-normal text-[#FFF]"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "1.125rem",
          }}
        >
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="font-semibold text-[#FFF]"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "1.25rem",
            }}
          >
            ${Math.round(parseFloat(product.price)).toString()}
          </span>
          <span className="flex items-center gap-0.5 text-amber-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon key={i} filled={i <= Math.round(rating)} />
            ))}
          </span>
          <span
            className="text-[#FFF]"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "0.875rem",
            }}
          >
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
