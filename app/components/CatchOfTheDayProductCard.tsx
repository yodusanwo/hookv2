"use client";

import Link from "next/link";
import * as React from "react";
import { AddToCartModal } from "./AddToCartModal";

async function ensureCartId(): Promise<string> {
  const existing =
    typeof window !== "undefined"
      ? window.localStorage.getItem("shopify_cart_id")
      : null;
  if (existing) return existing;

  const res = await fetch("/api/cart", { method: "POST" });
  if (!res.ok) throw new Error("Failed to create cart.");
  const json = (await res.json()) as { id: string };
  window.localStorage.setItem("shopify_cart_id", json.id);
  return json.id;
}

export type CatchOfTheDayProductCardProduct = {
  id: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  price: string;
  compareAtPrice?: string | null;
  currencyCode: string;
  variantId: string | null;
  availableForSale: boolean;
  sizeOrDescription?: string | null;
};

export function CatchOfTheDayProductCard({
  product,
}: {
  product: CatchOfTheDayProductCardProduct;
}) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const handleAddToCart = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!product.variantId || !product.availableForSale || adding) return;

      setAdding(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const cartId = await ensureCartId();
        const res = await fetch("/api/cart/lines", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            cartId,
            merchandiseId: product.variantId,
            quantity: 1,
          }),
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error ?? "Failed to add to cart.");
        if (!controller.signal.aborted) {
          setCheckoutUrl((json as { checkoutUrl?: string }).checkoutUrl ?? null);
          setModalOpen(true);
        }
      } catch {
        // Could show toast; for now ignore
      } finally {
        if (!controller.signal.aborted) setAdding(false);
      }
    },
    [product.variantId, product.availableForSale, adding]
  );

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const showCompareAt = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);

  const productHref = `/products/${product.handle}`;

  return (
    <>
      <div className="group relative flex min-w-[280px] max-w-[387px] flex-1 flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Image area: same dimensions and styling as RecipesSection (aspect-[331/190]) */}
        <div className="relative aspect-[331/190] min-w-0 w-full shrink-0 overflow-hidden bg-slate-100">
          <Link
            href={productHref}
            className="absolute inset-0 z-0"
            aria-label={`View ${product.title}`}
          />
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full max-w-full min-w-0 object-cover transition-transform group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
              </svg>
            </div>
          )}

          {/* Price overlay bottom-left */}
          <div
            className="absolute bottom-2 left-2 z-10 flex items-baseline gap-2 rounded px-2 py-1"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <span className="font-bold text-white" style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "18px" }}>
              ${Math.round(parseFloat(product.price)).toString()}
            </span>
            {showCompareAt && (
              <span className="text-sm text-slate-300 line-through" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
                ${Math.round(parseFloat(product.compareAtPrice!)).toString()}
              </span>
            )}
          </div>

          {/* Green circular add-to-cart button bottom-right */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.availableForSale || adding || !product.variantId}
            className="absolute bottom-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Add to cart"
          >
            {adding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex flex-1 flex-col px-4 py-3">
          <h3
            className="font-semibold text-slate-900"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "18px" }}
          >
            <Link href={productHref} className="hover:underline">
              {product.title}
            </Link>
          </h3>
          {product.sizeOrDescription && (
            <p
              className="mt-1 text-sm text-slate-600"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
            >
              {product.sizeOrDescription}
            </p>
          )}
          <Link
            href={productHref}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline"
          >
            <span className="text-lg leading-none">+</span>
            Show more
          </Link>
        </div>
      </div>

      <AddToCartModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        checkoutUrl={checkoutUrl}
      />
    </>
  );
}
