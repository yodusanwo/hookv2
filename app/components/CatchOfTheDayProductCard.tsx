"use client";

/** Card for the Product Carousel section only. Sizing is independent of the first "Catch of the day" section. */
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

const SECTION_BG = "var(--brand-light-blue-bg)";

export function CatchOfTheDayProductCard({
  product,
  blendWhiteWithSectionBackground = false,
  darkSection = false,
}: {
  product: CatchOfTheDayProductCardProduct;
  /** When true, white areas in the image blend with the section background (for product images on white). */
  blendWhiteWithSectionBackground?: boolean;
  /** When true, card is on a dark/navy section; footer gets a light background so dark text remains readable. */
  darkSection?: boolean;
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

  const showCompareAt = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);

  const productHref = `/products/${product.handle}`;

  // Title: optional cleanup of trailing parentheses so "Name (8 oz)" shows as "Name"
  const titleSizeMatch = product.title.match(/\s*\(([^)]+)\)\s*$/);
  const displayTitle = titleSizeMatch ? product.title.slice(0, titleSizeMatch.index).trim() : product.title;
  // Subtitle beneath title: size/description from variant; never show Shopify's "Default Title" placeholder
  const subtitle =
    product.sizeOrDescription?.trim() && product.sizeOrDescription !== "Default Title"
      ? product.sizeOrDescription
      : null;

  return (
    <>
      <div className="group relative flex min-w-0 max-w-[387px] flex-1 flex-col overflow-hidden shadow-none w-full">
        {/* Image area: same as recipe cards — height 320px, cover */}
        <div
          className="relative min-w-0 w-full shrink-0 overflow-hidden transition-transform group-hover:scale-[1.03]"
          style={{
            height: 320,
            alignSelf: "stretch",
            background: product.imageUrl
              ? blendWhiteWithSectionBackground
                ? `url(${product.imageUrl}) ${SECTION_BG} 50% / cover no-repeat`
                : `url(${product.imageUrl}) transparent 50% / cover no-repeat`
              : "transparent",
            backgroundBlendMode: blendWhiteWithSectionBackground && product.imageUrl ? "multiply" : undefined,
          }}
          role={product.imageUrl ? "img" : undefined}
          aria-label={product.imageUrl ? product.title : undefined}
        >
          <Link
            href={productHref}
            className="absolute inset-0 z-0"
            aria-label={`View ${product.title}`}
          />
          {!product.imageUrl && (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
              </svg>
            </div>
          )}

          {/* Price overlay bottom-left – white box, compare-at (black + red strikethrough), current (white on orange-red) */}
          <div className="product-card-price-overlay">
            {showCompareAt && (
              <span className="product-card-price-compare">
                ${Math.round(parseFloat(product.compareAtPrice!)).toString()}
              </span>
            )}
            <span className={showCompareAt ? "product-card-price-current" : "product-card-price-single"}>
              ${Math.round(parseFloat(product.price)).toString()}
            </span>
          </div>

          {/* Green circular add-to-cart button bottom-right – matches globals .product-card-cart-badge */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.availableForSale || adding || !product.variantId}
            className="product-card-cart-badge disabled:opacity-50 disabled:pointer-events-none transition-colors"
            aria-label="Add to cart"
          >
            {adding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <img
                src="/add_shopping_cart_100dp_111827_FILL0_wght400_GRAD0_opsz48%201.svg"
                alt=""
                aria-hidden
                className="h-5 w-5 w-full object-contain"
              />
            )}
          </button>
        </div>

        <div
          className="flex flex-1 flex-col px-4 py-3"
          style={{ backgroundColor: "var(--section-bg)" }}
        >
          <h3
            style={{
              color: darkSection ? "rgba(255,255,255,0.95)" : "var(--Text-Color, #1E1E1E)",
              fontFamily: "Inter, var(--font-inter), sans-serif",
              fontSize: "1.25rem",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "150%",
              textTransform: "capitalize",
            }}
          >
            <Link href={productHref} className="hover:underline" style={{ color: "inherit" }}>
              {displayTitle}
            </Link>
          </h3>
          {subtitle && (
            <p
              className="mt-1"
              style={{
                color: darkSection ? "rgba(255,255,255,0.85)" : "var(--Text-Color, #1E1E1E)",
                fontFamily: "Inter, var(--font-inter), sans-serif",
                fontSize: "1rem",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "150%",
              }}
            >
              {subtitle}
            </p>
          )}
          <Link
            href={productHref}
            className="mt-2 inline-flex items-center gap-1 hover:underline"
            style={{
              color: darkSection ? "rgba(255,255,255,0.85)" : "var(--Text-Color, #1E1E1E)",
              fontFamily: "Inter, var(--font-inter), sans-serif",
              fontSize: "1rem",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "150%",
            }}
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
