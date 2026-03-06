"use client";

import * as React from "react";
import Link from "next/link";

const CART_ID_KEY = "shopify_cart_id";

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

type CartLine = {
  id: string;
  quantity: number;
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

export default function CartPage() {
  const [cartId, setCartId] = React.useState<string | null>(null);
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = React.useState<Set<string>>(() => new Set());

  const fetchCart = React.useCallback(async (id: string) => {
    const res = await fetch(`/api/cart?cartId=${encodeURIComponent(id)}`);
    if (res.status === 404) {
      setCart(null);
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

  const updateQuantity = React.useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId || !cart) return;
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
          setError(data?.error ?? "Failed to update.");
          return;
        }
        await fetchCart(cartId);
        setError(null);
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(lineId);
          return next;
        });
      }
    },
    [cartId, cart, fetchCart]
  );

  const removeLine = React.useCallback(
    async (lineId: string) => {
      if (!cartId || !cart) return;
      setUpdatingIds((prev) => new Set(prev).add(lineId));
      try {
        const res = await fetch("/api/cart/lines", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId, lineIds: [lineId] }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error ?? "Failed to remove.");
          return;
        }
        await fetchCart(cartId);
        setError(null);
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(lineId);
          return next;
        });
      }
    },
    [cartId, cart, fetchCart]
  );

  const lines = cart?.lines?.edges?.map((e) => e.node) ?? [];

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 pt-[140px] pb-14 sm:pt-[170px] lg:pt-[230px]">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-600">Loading cart…</p>
        </div>
      </main>
    );
  }

  if (!cartId || !cart || lines.length === 0) {
    return (
      <main className="min-h-screen bg-white px-4 pt-[140px] pb-14 sm:pt-[170px] lg:pt-[230px]">
        <div className="mx-auto max-w-4xl">
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

  return (
    <main className="min-h-screen bg-white px-4 pt-[140px] pb-14 sm:pt-[170px] lg:pt-[230px]">
      <div className="mx-auto max-w-4xl">
        {/* Header: title left, continue shopping right */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-black">Your cart</h1>
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

        {/* Table headers */}
        <div className="mt-10 grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-200 pb-3 text-xs font-medium uppercase tracking-wide text-slate-500 max-sm:sr-only">
          <div>Product</div>
          <div className="text-center">Quantity</div>
          <div className="text-right">Total</div>
        </div>

        {/* Line items */}
        <ul className="divide-y divide-slate-200">
          {lines.map((line) => {
            const unitPrice = parseFloat(line.merchandise.price.amount);
            const lineTotal = unitPrice * line.quantity;
            return (
              <li
                key={line.id}
                className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                {/* Product: image + name + unit price */}
                <div className="flex gap-4">
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
                    <p className="mt-1 text-sm text-black">
                      ${unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Quantity + remove */}
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <div className="flex items-center rounded border border-slate-300 bg-white">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="h-9 w-9 flex items-center justify-center border-r border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
                      className="h-9 w-9 flex items-center justify-center px-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
                  <button
                    type="button"
                    aria-label="Remove item"
                    className="p-2 text-slate-500 hover:text-slate-800 disabled:opacity-50"
                    disabled={updatingIds.has(line.id)}
                    onClick={() => removeLine(line.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
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

        {/* Summary: estimated total, disclaimer, checkout */}
        <div className="mt-10 flex flex-col items-end border-t border-slate-200 pt-8">
          <p className="text-sm text-slate-600">Estimated total</p>
          <p className="mt-1 text-lg font-semibold text-black">
            $
            {parseFloat(cart.cost.totalAmount.amount).toFixed(2)}{" "}
            {cart.cost.totalAmount.currencyCode}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Taxes, discounts and shipping calculated at checkout.
          </p>
          <a
            href={cart.checkoutUrl}
            className="mt-4 inline-block w-full max-w-xs bg-black px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:w-auto"
          >
            Check out
          </a>
        </div>
      </div>
    </main>
  );
}
