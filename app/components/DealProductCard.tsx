"use client";

import Link from "next/link";
import * as React from "react";
import { AddToCartModal } from "./AddToCartModal";
import { trackSelectItem } from "@/app/lib/ga4Ecommerce";
import { getCheckoutUrl } from "@/lib/utils/checkout";

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

export type DealProductCardProduct = {
  id: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  price: string;
  currencyCode: string;
  productType?: string | null;
  availableForSale: boolean;
  variantId: string | null;
};

export function DealProductCard({
  product,
  size,
  itemListName,
  itemIndex,
}: {
  product: DealProductCardProduct;
  size: "top" | "bottom";
  itemListName?: string;
  itemIndex?: number;
}) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const width = size === "top" ? 385 : 285;
  const height = 221;

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
          const raw = (json as { checkoutUrl?: string }).checkoutUrl;
          setCheckoutUrl(raw ? getCheckoutUrl(raw) : null);
          setModalOpen(true);
          window.dispatchEvent(new CustomEvent("cart-updated"));
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          const msg = err.message.toLowerCase();
          if (msg.includes("cart not found") || msg.includes("expired")) {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("shopify_cart_id");
            }
          }
        }
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

  return (
    <>
      <Link
        href={`/products/${product.handle}`}
        prefetch
        onClick={() => {
          if (!itemListName || typeof itemIndex !== "number") return;
          trackSelectItem({
            itemListName,
            index: itemIndex,
            item: {
              id: product.id,
              title: product.title,
              productType: product.productType ?? undefined,
              variantId: product.variantId ?? undefined,
              price: product.price,
              currencyCode: product.currencyCode,
            },
          });
        }}
        className="group relative block rounded-card border border-black/5 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 w-full min-w-0 overflow-hidden"
      >
        <div
          className="overflow-hidden rounded-t-xl w-full bg-[#EEF1F6] relative"
          style={{ aspectRatio: `${width}/${height}` }}
        >
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full max-w-full object-cover"
              loading="lazy"
            />
          )}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.availableForSale || adding || !product.variantId}
            className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm hover:bg-white hover:text-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Add to cart"
          >
            {adding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </button>
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-semibold text-slate-900">{product.title}</h3>
          <p className="mt-2 text-sm text-slate-700">
            ${Math.round(parseFloat(product.price)).toString()} {product.currencyCode}
          </p>
          {product.availableForSale ? (
            <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              In stock
            </span>
          ) : (
            <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              Sold out
            </span>
          )}
        </div>
      </Link>

      <AddToCartModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        checkoutUrl={checkoutUrl}
      />
    </>
  );
}
