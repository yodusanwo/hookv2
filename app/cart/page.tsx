"use client";

import * as React from "react";
import Link from "next/link";
import { subscriptionCartLineNote } from "@/lib/cartSubscriptionLineNote";

const CART_ID_KEY = "shopify_cart_id";

function CloseXIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MedalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15l4.24 2.83a1 1 0 0 0 1.52-1.06l-1.02-4.35 3.42-2.97a1 1 0 0 0-.56-1.74l-4.5-.39-1.76-4.2a1 1 0 0 0-1.88 0l-1.76 4.2-4.5.39a1 1 0 0 0-.56 1.74l3.42 2.97-1.02 4.35a1 1 0 0 0 1.52 1.06L12 15z" />
      <circle cx="12" cy="8" r="5" />
    </svg>
  );
}

function ReturnIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

type CartLine = {
  id: string;
  quantity: number;
  /** Actual line totals from Shopify (includes subscription / selling-plan pricing). */
  cost?: {
    totalAmount: { amount: string; currencyCode: string };
    amountPerQuantity: { amount: string; currencyCode: string };
  };
  /** Present when the line was added with a subscription selling plan. */
  sellingPlanAllocation: { sellingPlan: { name: string } } | null;
  merchandise: {
    id: string;
    title: string;
    product: { title: string; handle: string };
    price: { amount: string; currencyCode: string };
    image: { url: string; altText: string | null } | null;
  };
};

type Cart = {
  id: string;
  checkoutUrl: string;
  lines: { edges: Array<{ node: CartLine }> };
  cost: { totalAmount: { amount: string; currencyCode: string } };
};

type ShippingSettings = {
  freeShippingThreshold: number | null;
  freeShippingMessage: string | null;
};

type RecommendationProduct = {
  id: string;
  title: string;
  handle: string;
  productType?: string | null;
  price: string;
  currencyCode?: string;
  sizeOrDescription?: string | null;
  images?: { edges?: Array<{ node?: { url?: string; altText?: string | null } }> };
};

export default function CartPage() {
  const [cartId, setCartId] = React.useState<string | null>(null);
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = React.useState<Set<string>>(() => new Set());
  const [shippingSettings, setShippingSettings] = React.useState<ShippingSettings | null>(null);
  const [recommendations, setRecommendations] = React.useState<RecommendationProduct[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = React.useState(false);

  const fetchCart = React.useCallback(async (id: string) => {
    const res = await fetch(`/api/cart?cartId=${encodeURIComponent(id)}`);
    if (res.status === 404) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(CART_ID_KEY);
      }
      setCart(null);
      setCartId(null);
      setError("Cart not found or expired.");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to load cart.");
      setCart(null);
      return;
    }
    const data = await res.json();
    setCart(data);
    setError(null);
  }, []);

  React.useEffect(() => {
    const id =
      typeof window !== "undefined" ? window.localStorage.getItem(CART_ID_KEY) : null;
    setCartId(id);
    if (id) {
      setLoading(true);
      fetchCart(id).finally(() => setLoading(false));
    } else {
      setLoading(false);
      setCart(null);
    }
  }, [fetchCart]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/shipping-settings");
        if (cancelled) return;
        const data = await res.json().catch(() => ({}));
        setShippingSettings({
          freeShippingThreshold: data.freeShippingThreshold ?? null,
          freeShippingMessage: data.freeShippingMessage ?? null,
        });
      } catch {
        if (!cancelled) setShippingSettings(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!cart || cart.lines.edges.length === 0) return;
    let cancelled = false;
    setRecommendationsLoading(true);
    const cartHandles = new Set(
      cart.lines.edges.map((e) => e.node.merchandise.product.handle)
    );
    const firstProductHandle = cart.lines.edges[0]?.node.merchandise.product
      .handle as string | undefined;
    (async () => {
      try {
        let products: RecommendationProduct[] = [];
        if (firstProductHandle) {
          const res = await fetch(
            `/api/recommendations?productHandle=${encodeURIComponent(firstProductHandle)}`
          );
          if (cancelled) return;
          const json = await res.json().catch(() => ({}));
          products = json.products ?? [];
        }
        if (products.length < 4) {
          const res = await fetch("/api/products?first=12");
          if (cancelled) return;
          const json = await res.json().catch(() => ({}));
          const more = json.products ?? [];
          const combined = [...products];
          for (const p of more) {
            if (combined.length >= 4) break;
            if (!combined.some((x) => x.id === p.id) && !cartHandles.has(p.handle)) {
              combined.push(p);
            }
          }
          products = combined;
        }
        const filtered = products
          .filter((p) => !cartHandles.has(p.handle))
          .slice(0, 4);
        setRecommendations(filtered);
      } catch {
        if (!cancelled) setRecommendations([]);
      } finally {
        if (!cancelled) setRecommendationsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cart?.id, cart?.lines.edges.length]);

  const recomputeCost = React.useCallback((lines: CartLine[]) => {
    const currencyCode =
      lines[0]?.cost?.totalAmount?.currencyCode ??
      lines[0]?.merchandise?.price?.currencyCode ??
      "USD";
    const total = lines.reduce((sum, l) => {
      if (l.cost?.totalAmount?.amount) {
        return sum + parseFloat(l.cost.totalAmount.amount);
      }
      return sum + parseFloat(l.merchandise.price.amount) * l.quantity;
    }, 0);
    return {
      totalAmount: {
        amount: total.toFixed(2),
        currencyCode,
      },
    };
  }, []);

  const scaleLineCostForQuantity = React.useCallback(
    (line: CartLine, newQty: number): CartLine => {
      const q = Math.max(1, line.quantity);
      const listUnit = parseFloat(line.merchandise.price.amount);
      const cc =
        line.cost?.totalAmount?.currencyCode ??
        line.merchandise.price.currencyCode;
      if (!line.cost?.totalAmount?.amount) {
        return {
          ...line,
          quantity: newQty,
          cost: {
            totalAmount: {
              amount: (listUnit * newQty).toFixed(2),
              currencyCode: cc,
            },
            amountPerQuantity: {
              amount: listUnit.toFixed(2),
              currencyCode: cc,
            },
          },
        };
      }
      const perUnit =
        line.cost.amountPerQuantity?.amount != null
          ? parseFloat(line.cost.amountPerQuantity.amount)
          : parseFloat(line.cost.totalAmount.amount) / q;
      const newTotal = (perUnit * newQty).toFixed(2);
      return {
        ...line,
        quantity: newQty,
        cost: {
          totalAmount: { amount: newTotal, currencyCode: cc },
          amountPerQuantity: {
            amount: perUnit.toFixed(2),
            currencyCode: cc,
          },
        },
      };
    },
    [],
  );

  const updateQuantity = React.useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId || !cart) return;
      const optimisticLines = cart.lines.edges.map((e) => {
        if (e.node.id === lineId) {
          return {
            ...e,
            node: scaleLineCostForQuantity(e.node, quantity),
          };
        }
        return e;
      });
      const optimisticCart: Cart = {
        ...cart,
        lines: { edges: optimisticLines },
        cost: recomputeCost(optimisticLines.map((e) => e.node)),
      };
      setCart(optimisticCart);
      setError(null);
      setUpdatingIds((prev) => new Set(prev).add(lineId));
      try {
        const res = await fetch("/api/cart/lines", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartId,
            lines: [{ id: lineId, quantity }],
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          await fetchCart(cartId);
          setError(data?.error ?? "Failed to update.");
          return;
        }
        await fetchCart(cartId);
        setError(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart-updated"));
        }
      } catch {
        await fetchCart(cartId);
        setError("Network error. Please try again.");
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(lineId);
          return next;
        });
      }
    },
    [cartId, cart, fetchCart, recomputeCost, scaleLineCostForQuantity]
  );

  const removeLine = React.useCallback(
    async (lineId: string) => {
      if (!cartId || !cart) return;
      const optimisticEdges = cart.lines.edges.filter((e) => e.node.id !== lineId);
      const optimisticLines = optimisticEdges.map((e) => e.node);
      const optimisticCart: Cart = {
        ...cart,
        lines: { edges: optimisticEdges },
        cost: recomputeCost(optimisticLines),
      };
      setCart(optimisticCart);
      setError(null);
      setUpdatingIds((prev) => new Set(prev).add(lineId));
      try {
        const res = await fetch("/api/cart/lines", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId, lineIds: [lineId] }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          await fetchCart(cartId);
          setError(data?.error ?? "Failed to remove.");
          return;
        }
        await fetchCart(cartId);
        setError(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart-updated"));
        }
      } catch {
        await fetchCart(cartId);
        setError("Network error. Please try again.");
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(lineId);
          return next;
        });
      }
    },
    [cartId, cart, fetchCart, recomputeCost]
  );

  const lines = cart?.lines?.edges?.map((e) => e.node) ?? [];

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 pt-[140px] pb-14 sm:pt-[170px] lg:pt-[230px]">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-600">Loading cart…</p>
        </div>
      </main>
    );
  }

  if (!cartId || !cart || lines.length === 0) {
    return (
      <main className="min-h-screen bg-white px-4 pt-[140px] pb-14 sm:pt-[170px] lg:pt-[230px]">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-black">Your cart</h1>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-4 text-slate-600">
            {!cartId
              ? "You don't have any items in your cart yet."
              : "Your cart is empty."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-black underline hover:no-underline"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = parseFloat(cart.cost.totalAmount.amount);
  const currencyCode = cart.cost.totalAmount.currencyCode ?? "USD";
  const threshold = shippingSettings?.freeShippingThreshold ?? null;
  const amountLeft = threshold != null ? Math.max(0, threshold - subtotal) : 0;
  const progressPercent =
    threshold != null && threshold > 0
      ? Math.min(100, (subtotal / threshold) * 100)
      : 100;

  return (
    <main className="min-h-screen bg-white px-4 pt-[140px] pb-14 sm:pt-[170px] lg:pt-[230px]">
      <div className="mx-auto max-w-6xl">
        {/* Header: title left, continue shopping right */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-black">
            Shopping cart
          </h1>
          <Link
            href="/"
            className="text-sm text-black underline hover:no-underline"
          >
            Continue shopping
          </Link>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Two-column: Cart (left) + Order summary (right) */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* Left: Shopping cart table */}
          <div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-200 pb-3 text-xs font-medium uppercase tracking-wide text-slate-500 max-sm:sr-only">
              <div>Product</div>
              <div className="text-left" style={{ transform: "translateX(-90px)" }}>
                Quantity
              </div>
              <div className="text-right">Total</div>
            </div>

            <ul className="divide-y divide-slate-200">
              {lines.map((line) => {
                const lineTotal =
                  line.cost?.totalAmount?.amount != null
                    ? parseFloat(line.cost.totalAmount.amount)
                    : parseFloat(line.merchandise.price.amount) * line.quantity;
                const subNote = subscriptionCartLineNote(line);
                return (
                  <li
                    key={line.id}
                    className="relative grid grid-cols-1 gap-4 py-6 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    {/* Remove: top-right of row */}
                    <button
                      type="button"
                      aria-label="Remove item"
                      className="absolute right-0 top-6 p-2 text-slate-500 hover:text-slate-800 disabled:opacity-50"
                      disabled={updatingIds.has(line.id)}
                      onClick={() => removeLine(line.id)}
                    >
                      <CloseXIcon className="h-4 w-4" />
                    </button>

                    {/* Product: image + name + variant */}
                    <div className="flex gap-4 pr-10 sm:pr-0">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-slate-100">
                        {line.merchandise.image?.url ? (
                          <img
                            src={line.merchandise.image.url}
                            alt={
                              line.merchandise.image.altText ??
                              line.merchandise.product.title
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-200" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/products/${line.merchandise.product.handle}`}
                          className="font-semibold text-black hover:underline"
                        >
                          {line.merchandise.product.title}
                        </Link>
                        {line.merchandise.title !== "Default Title" && (
                          <p className="mt-0.5 text-sm text-slate-600">
                            {line.merchandise.title}
                          </p>
                        )}
                        {subNote ? (
                          <p className="mt-2 max-w-md text-sm leading-snug text-green-800">
                            {subNote}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center rounded border border-slate-300 bg-white">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center border-r border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        disabled={
                          updatingIds.has(line.id) || line.quantity <= 1
                        }
                        onClick={() =>
                          updateQuantity(
                            line.id,
                            Math.max(1, line.quantity - 1)
                          )
                        }
                      >
                        −
                      </button>
                      <span
                        className="flex h-9 min-w-[2.5rem] items-center justify-center px-2 text-sm font-medium text-black"
                        aria-live="polite"
                      >
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center border-l border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        disabled={
                          updatingIds.has(line.id) || line.quantity >= 50
                        }
                        onClick={() =>
                          updateQuantity(
                            line.id,
                            Math.min(50, line.quantity + 1)
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right font-medium text-black sm:text-right">
                      ${lineTotal.toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Estimated total (mobile only, below table) */}
            <div className="mt-6 border-t border-slate-200 pt-6 lg:sr-only">
              <p className="text-sm text-slate-600">Estimated total</p>
              <p className="mt-1 text-lg font-semibold text-black">
                ${subtotal.toFixed(2)} {currencyCode}
              </p>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="rounded-card border border-slate-200 bg-slate-50/50 p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-black">Order Summary</h2>
            <div className="mt-4 space-y-2">
              {lines.some((l) => l.sellingPlanAllocation?.sellingPlan?.name) ? (
                <p className="text-xs leading-relaxed text-slate-600">
                  Subtotal includes{" "}
                  <span className="font-medium text-green-800">
                    subscribe &amp; save
                  </span>{" "}
                  pricing on subscription items.
                </p>
              ) : null}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-black">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Free shipping message + progress bar */}
              {threshold != null && threshold > 0 && (
                <div className="pt-2">
                  {amountLeft > 0 ? (
                    <>
                      <p className="text-sm font-medium text-green-700">
                        Spend ${amountLeft.toFixed(2)} more to get free shipping
                      </p>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-green-600 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-green-700">
                      You&apos;ve got free shipping
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between text-sm pt-2">
                <span className="text-slate-600">Shipping</span>
                <span className="text-slate-600">Calculated at checkout</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
              <span className="font-bold text-black">Total</span>
              <span className="text-lg font-bold text-black">
                ${subtotal.toFixed(2)} {currencyCode}
              </span>
            </div>

            <a
              href={cart.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--brand-green)" }}
              aria-label="Secure checkout (opens in new tab)"
            >
              <LockIcon className="h-5 w-5 shrink-0" />
              Secure Checkout
            </a>
            <p className="mt-2 text-center text-xs text-slate-500">
              Express checkout available on the next page.
            </p>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <LockIcon className="h-6 w-6 text-slate-600" />
                <span className="mt-1 text-xs font-medium text-slate-700">
                  Secure Checkout
                </span>
                <span className="text-xs text-slate-500">256-bit SSL</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <MedalIcon className="h-6 w-6 text-slate-600" />
                <span className="mt-1 text-xs font-medium text-slate-700">
                  Satisfaction Guaranteed
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <ReturnIcon className="h-6 w-6 text-slate-600" />
                <span className="mt-1 text-xs font-medium text-slate-700">
                  Easy Returns
                </span>
                <span className="text-xs text-slate-500">30-day policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* You might also like */}
        {(recommendationsLoading || recommendations.length > 0) && (
          <section
            className="mt-16 border-t border-slate-200 pt-12"
            style={{ ["--section-bg" as string]: "#ffffff" }}
          >
            <h2 className="section-title">You might also like</h2>
            {recommendationsLoading ? (
              <p className="mt-4 text-sm text-slate-500">Loading…</p>
            ) : (
              <ul className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
                {recommendations.map((product) => {
                  const img = product.images?.edges?.[0]?.node;
                  const subtitle = product.sizeOrDescription ?? product.productType ?? "";
                  return (
                    <li key={product.id} className="group">
                      <Link href={`/products/${product.handle}`} className="section-card block overflow-hidden transition-all duration-200 hover:scale-[1.02]" style={{ backgroundColor: "var(--section-bg)" }}>
                        <div className="rounded-card relative aspect-square overflow-hidden bg-slate-100">
                          {img?.url ? (
                            <img
                              src={img.url}
                              alt={img.altText ?? product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-200" />
                          )}
                          <div className="product-card-price-overlay product-card-price-overlay--figma" style={{ ["--product-card-price-bg" as string]: "#fff" }}>
                            <span className="product-card-price-single">${Math.round(parseFloat(product.price)).toString()}</span>
                          </div>
                          <span className="product-card-cart-badge" aria-hidden>
                            <img
                              src="/add_shopping_cart_100dp_111827_FILL0_wght400_GRAD0_opsz48%201.svg"
                              alt=""
                            />
                          </span>
                        </div>
                        <div className="rounded-card-b p-4" style={{ backgroundColor: "var(--section-bg)" }}>
                          <h3 className="font-semibold text-black">
                            {product.title}
                          </h3>
                          {subtitle && (
                            <p className="mt-0.5 text-sm text-slate-600">
                              {subtitle}
                            </p>
                          )}
                          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#498CCB] hover:underline">
                            Show more
                            <span aria-hidden>+</span>
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
