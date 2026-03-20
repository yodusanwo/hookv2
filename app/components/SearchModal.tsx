"use client";

import * as React from "react";
import Link from "next/link";
import { IconSearch } from "./Icons";
import type { SearchProduct } from "@/app/api/search/route";

const RECENTLY_VIEWED_KEY = "hookv2_recently_viewed";
const MAX_RECENT = 10;

export type RecentProduct = {
  handle: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  image: string | null;
};

function loadRecentlyViewed(): RecentProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecentlyViewed(items: RecentProduct[]) {
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

export function addToRecentlyViewed(product: RecentProduct) {
  const list = loadRecentlyViewed();
  const filtered = list.filter((p) => p.handle !== product.handle);
  saveRecentlyViewed([product, ...filtered]);
}

/** Call from product page to record view in "Recently viewed". Renders nothing. */
export function RecentlyViewedTracker({
  handle,
  title,
  image,
  price,
  compareAtPrice = null,
}: RecentProduct) {
  React.useEffect(() => {
    addToRecentlyViewed({ handle, title, image, price, compareAtPrice });
  }, [handle, title, image, price, compareAtPrice]);
  return null;
}

function formatPrice(amount: string, currencyCode: string): string {
  const n = parseFloat(amount);
  if (Number.isNaN(n)) return amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function ProductCard({
  handle,
  title,
  price,
  compareAtPrice,
  image,
  currencyCode = "USD",
  onClick,
}: {
  handle: string;
  title: string;
  price: string;
  compareAtPrice?: string | null;
  image: string | null;
  currencyCode?: string;
  onClick?: () => void;
}) {
  const href = `/products/${handle}`;
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex flex-col rounded-lg border border-transparent bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-[#f5f5f5]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#999]" aria-hidden>
            —
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <span className="line-clamp-2 text-sm font-medium text-[#1E1E1E] [font-family:var(--font-inter)]">
          {title}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) ? (
            <>
              <span className="text-sm text-[#888] line-through">
                {formatPrice(compareAtPrice, currencyCode)}
              </span>
              <span className="font-semibold text-[#1E1E1E]">
                {formatPrice(price, currencyCode)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-[#1E1E1E]">
              {formatPrice(price, currencyCode)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

type ApiProductFromList = {
  id?: string;
  title: string;
  handle: string;
  price?: string;
  currencyCode?: string;
  compareAtPrice?: string | null;
  images?: { edges?: Array<{ node?: { url?: string; altText?: string | null } }> };
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchProduct[]>([]);
  const [searchTotal, setSearchTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [initialProducts, setInitialProducts] = React.useState<ApiProductFromList[]>([]);
  const [recentlyViewed, setRecentlyViewed] = React.useState<RecentProduct[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasQuery = query.trim().length > 0;

  // Load recently viewed and initial products when modal opens
  React.useEffect(() => {
    if (!open) return;
    setRecentlyViewed(loadRecentlyViewed());
    setQuery("");
    setSearchResults([]);
    setSearchTotal(0);
    fetch("/api/products?first=8")
      .then((res) => res.json())
      .then((data) => setInitialProducts(data?.products ?? []))
      .catch(() => setInitialProducts([]));
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Debounced search
  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setSearchTotal(0);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}&first=12`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data?.products ?? []);
          setSearchTotal(data?.totalCount ?? 0);
        })
        .catch(() => {
          setSearchResults([]);
          setSearchTotal(0);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Escape to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const suggestions = React.useMemo(() => {
    if (!hasQuery || searchResults.length === 0) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of searchResults) {
      const t = p.title.trim();
      if (t && !seen.has(t.toLowerCase())) {
        seen.add(t.toLowerCase());
        out.push(t);
        if (out.length >= 4) break;
      }
    }
    return out;
  }, [hasQuery, searchResults]);

  const productsToShow = hasQuery ? searchResults : [];
  const showInitialProducts = !hasQuery && initialProducts.length > 0;
  const showRecent = !hasQuery && recentlyViewed.length > 0;

  const handleClearRecent = () => {
    saveRecentlyViewed([]);
    setRecentlyViewed([]);
  };

  const handleProductClick = (product: RecentProduct | SearchProduct) => {
    addToRecentlyViewed({
      handle: product.handle,
      title: product.title,
      price: "price" in product ? product.price : "",
      compareAtPrice: "compareAtPrice" in product ? product.compareAtPrice ?? null : null,
      image: "image" in product ? product.image : null,
    });
    onClose();
  };

  if (!open) return null;

  const normalizedProducts = initialProducts.map((p) => ({
    handle: p.handle,
    title: p.title,
    price: p.price ?? "0",
    currencyCode: p.currencyCode ?? "USD",
    compareAtPrice: p.compareAtPrice ?? null,
    image: p.images?.edges?.[0]?.node?.url ?? null,
  }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[min(10vh,80px)] pb-20"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white shadow-xl [font-family:var(--font-inter)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b border-[#eee] p-4">
          <span className="flex shrink-0 text-[#666]" aria-hidden>
            <IconSearch className="h-5 w-5" />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[#1E1E1E] placeholder:text-[#999] focus:outline-none focus:ring-0"
            autoComplete="off"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="shrink-0 text-sm text-[#498CCB] hover:underline"
            >
              Clear
            </button>
          )}
          <span className="h-5 w-px shrink-0 bg-[#ddd]" aria-hidden />
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#666] hover:bg-[#f0f0f0]"
            aria-label="Close search"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {/* Suggested terms (when searching) */}
          {hasQuery && suggestions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {suggestions.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => setQuery(text)}
                  className="rounded-full bg-[#f0f0f0] px-3 py-1.5 text-sm text-[#1E1E1E] hover:bg-[#e5e5e5]"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Recently viewed (when no query) */}
          {showRecent && (
            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1E1E1E]">Recently viewed</h3>
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="text-sm text-[#498CCB] hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {recentlyViewed.map((p) => (
                  <div key={p.handle} className="w-[140px] shrink-0">
                    <ProductCard
                      handle={p.handle}
                      title={p.title}
                      price={p.price}
                      compareAtPrice={p.compareAtPrice}
                      image={p.image}
                      onClick={() => handleProductClick(p)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Products section */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#1E1E1E]">Products</h3>
            {loading ? (
              <p className="py-8 text-center text-sm text-[#666]">Searching…</p>
            ) : productsToShow.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {productsToShow.map((p) => (
                    <ProductCard
                      key={p.id}
                      handle={p.handle}
                      title={p.title}
                      price={p.price}
                      compareAtPrice={p.compareAtPrice}
                      image={p.image}
                      currencyCode={p.currencyCode}
                      onClick={() => handleProductClick(p)}
                    />
                  ))}
                </div>
                {searchTotal > productsToShow.length && (
                  <div className="mt-4 flex justify-center">
                    <Link
                      href={`/shop?q=${encodeURIComponent(query.trim())}`}
                      onClick={onClose}
                      className="inline-block rounded-lg bg-[#1E1E1E] px-6 py-3 font-medium text-white hover:opacity-90"
                    >
                      View all
                    </Link>
                  </div>
                )}
              </>
            ) : showInitialProducts ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {normalizedProducts.map((p) => (
                  <ProductCard
                    key={p.handle}
                    handle={p.handle}
                    title={p.title}
                    price={p.price}
                    compareAtPrice={p.compareAtPrice}
                    image={p.image}
                    currencyCode={p.currencyCode}
                    onClick={() =>
                      handleProductClick({
                        handle: p.handle,
                        title: p.title,
                        price: p.price,
                        compareAtPrice: p.compareAtPrice,
                        image: p.image,
                      })
                    }
                  />
                ))}
              </div>
            ) : hasQuery && !loading ? (
              <p className="py-8 text-center text-sm text-[#666]">No products found.</p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
