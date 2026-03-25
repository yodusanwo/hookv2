"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { subscriptionCartLineNote } from "@/lib/cartSubscriptionLineNote";

const CART_ID_KEY = "shopify_cart_id";
const CART_POPUP_OPEN_EVENT = "open-cart-popup";

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
  cost?: {
    totalAmount: { amount: string; currencyCode: string };
    amountPerQuantity: { amount: string; currencyCode: string };
  };
  sellingPlanAllocation?: { sellingPlan: { name: string } } | null;
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
  note?: string | null;
  lines: { edges: Array<{ node: CartLine }> };
  cost: { totalAmount: { amount: string; currencyCode: string } };
};

export function CartPopup() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [cartId, setCartId] = React.useState<string | null>(null);
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = React.useState<Set<string>>(new Set());
  const [discountInput, setDiscountInput] = React.useState("");
  const [discountLoading, setDiscountLoading] = React.useState(false);
  const [discountError, setDiscountError] = React.useState<string | null>(null);
  const [discountSuccess, setDiscountSuccess] = React.useState(false);
  const [orderNote, setOrderNote] = React.useState("");
  const [noteSaving, setNoteSaving] = React.useState(false);
  const noteSyncedFromCart = React.useRef(false);

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
    setDiscountError(null);
    setDiscountSuccess(false);
    if (data.note != null) {
      setOrderNote(data.note);
      noteSyncedFromCart.current = true;
    }
  }, []);

  React.useEffect(() => {
    if (cart?.note != null && !noteSyncedFromCart.current) {
      setOrderNote(cart.note);
      noteSyncedFromCart.current = true;
    }
    if (!cart) noteSyncedFromCart.current = false;
  }, [cart?.note, cart]);

  React.useEffect(() => {
    const handler = () => {
      const id =
        typeof window !== "undefined" ? window.localStorage.getItem(CART_ID_KEY) : null;
      setCartId(id);
      setIsOpen(true);
      if (id) {
        setLoading(true);
        fetchCart(id).finally(() => setLoading(false));
      } else {
        setCart(null);
      }
    };
    window.addEventListener(CART_POPUP_OPEN_EVENT, handler);
    return () => window.removeEventListener(CART_POPUP_OPEN_EVENT, handler);
  }, [fetchCart]);

  const close = React.useCallback(() => setIsOpen(false), []);

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
      totalAmount: { amount: total.toFixed(2), currencyCode },
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
      const optimisticLines = cart.lines.edges.map((e) =>
        e.node.id === lineId
          ? {
              ...e,
              node: scaleLineCostForQuantity(e.node, quantity),
            }
          : e
      );
      setCart({
        ...cart,
        lines: { edges: optimisticLines },
        cost: recomputeCost(optimisticLines.map((e) => e.node)),
      });
      setError(null);
      setUpdatingIds((prev) => new Set(prev).add(lineId));
      try {
        const res = await fetch("/api/cart/lines", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId, lines: [{ id: lineId, quantity }] }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          await fetchCart(cartId);
          setError(data?.error ?? "Failed to update.");
          return;
        }
        await fetchCart(cartId);
        window.dispatchEvent(new CustomEvent("cart-updated"));
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
      setCart({
        ...cart,
        lines: { edges: optimisticEdges },
        cost: recomputeCost(optimisticEdges.map((e) => e.node)),
      });
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
        window.dispatchEvent(new CustomEvent("cart-updated"));
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

  const applyDiscount = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = discountInput.trim();
      if (!code || !cartId || !cart) return;
      setDiscountError(null);
      setDiscountSuccess(false);
      setDiscountLoading(true);
      try {
        const res = await fetch("/api/cart/discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId, discountCodes: [code] }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setDiscountError(data?.error ?? "Could not apply code.");
          return;
        }
        if (data.cart && cartId) {
          await fetchCart(cartId);
          setDiscountSuccess(true);
          setDiscountInput("");
          window.dispatchEvent(new CustomEvent("cart-updated"));
        }
      } catch {
        setDiscountError("Network error. Please try again.");
      } finally {
        setDiscountLoading(false);
      }
    },
    [cartId, cart, discountInput, fetchCart]
  );

  const saveNote = React.useCallback(
    async (noteValue: string) => {
      if (!cartId) return;
      setNoteSaving(true);
      try {
        const res = await fetch("/api/cart/note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId, note: noteValue }),
        });
        if (!res.ok) return;
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } finally {
        setNoteSaving(false);
      }
    },
    [cartId]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-popup-title"
    >
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 z-0 bg-black/50"
        aria-label="Close"
      />
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[10px] bg-white shadow-xl"
        style={{ minHeight: 400 }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2
            id="cart-popup-title"
            className="text-2xl font-bold uppercase tracking-wide text-slate-900"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Your Cart
          </h2>
          <button
            type="button"
            onClick={close}
            className="hover:opacity-80 transition-opacity"
            aria-label="Close"
          >
            <Image src="/Exiticon.svg" alt="" width={28} height={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          {loading ? (
            <p className="py-8 text-center text-slate-600">Loading cart…</p>
          ) : !cartId || lines.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-600">
                {!cartId ? "You don't have any items in your cart yet." : "Your cart is empty."}
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-4 text-sm font-medium text-slate-800 underline hover:no-underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              {error && (
                <p className="mb-4 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              {/* Table headers */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-200 pb-3 text-xs font-medium uppercase tracking-wide text-slate-500 max-sm:sr-only overflow-visible">
                <div>Product</div>
                <div className="text-left" style={{ transform: "translateX(-90px)" }}>
                  Quantity
                </div>
                <div className="text-right">Total</div>
              </div>
              {/* Line items */}
              <ul className="divide-y divide-slate-200">
                {lines.map((line) => {
                  const lineTotal =
                    line.cost?.totalAmount?.amount != null
                      ? parseFloat(line.cost.totalAmount.amount)
                      : parseFloat(line.merchandise.price.amount) *
                        line.quantity;
                  const subNote = subscriptionCartLineNote(line);
                  return (
                    <li
                      key={line.id}
                      className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                    >
                      <div className="flex gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
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
                            className="font-semibold text-slate-900 hover:underline"
                            onClick={close}
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
                      <div className="flex items-center justify-center gap-2 sm:justify-start">
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
                            className="flex h-9 min-w-[2.5rem] items-center justify-center px-2 text-sm font-medium text-slate-900"
                            aria-live="polite"
                          >
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
                      <div className="text-right font-medium text-slate-900 sm:text-right">
                        ${lineTotal.toFixed(2)}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Summary + Check out */}
              {cart && (
              <div className="mt-6 flex flex-col border-t border-slate-200 pt-6">
                {/* Order special instructions */}
                <div className="mb-4 w-full">
                  <label
                    htmlFor="cart-order-instructions"
                    className="block text-left text-sm font-medium text-slate-900"
                  >
                    Order special instructions
                  </label>
                  <textarea
                    id="cart-order-instructions"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    onBlur={(e) => saveNote(e.target.value)}
                    placeholder=""
                    rows={3}
                    disabled={noteSaving}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-60"
                    aria-label="Order special instructions"
                  />
                </div>
                {/* Discount code / gift card — half width */}
                <form
                  onSubmit={applyDiscount}
                  className="mb-4 flex w-full max-w-[50%] flex-wrap items-center gap-2 sm:flex-nowrap"
                >
                  <input
                    type="text"
                    value={discountInput}
                    onChange={(e) => {
                      setDiscountInput(e.target.value);
                      setDiscountError(null);
                    }}
                    placeholder="Discount Code or Gift Card"
                    disabled={discountLoading}
                    className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-60"
                    aria-label="Discount code or gift card"
                  />
                  <button
                    type="submit"
                    disabled={discountLoading || !discountInput.trim()}
                    className="shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#069400" }}
                  >
                    {discountLoading ? "Applying…" : "Apply"}
                  </button>
                </form>
                {discountError && (
                  <p className="mb-2 text-sm text-red-600" role="alert">
                    {discountError}
                  </p>
                )}
                {discountSuccess && (
                  <p className="mb-2 text-sm text-green-700" role="status">
                    Discount applied.
                  </p>
                )}
                <div className="flex flex-col items-end">
                {lines.some((l) => l.sellingPlanAllocation?.sellingPlan?.name) ? (
                  <p className="mb-2 max-w-md text-right text-xs leading-relaxed text-slate-600">
                    Estimated total includes{" "}
                    <span className="font-medium text-green-800">
                      subscribe &amp; save
                    </span>{" "}
                    pricing on subscription items.
                  </p>
                ) : null}
                <p className="text-sm text-slate-600">Estimated total</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  $
                  {parseFloat(cart.cost.totalAmount.amount).toFixed(2)}{" "}
                  {cart.cost.totalAmount.currencyCode}
                </p>
                <a
                  href={cart.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex shrink-0 items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    borderRadius: 6.551,
                    background: "#069400",
                  }}
                  aria-label="Check out (opens in new tab)"
                >
                  Check Out
                </a>
                </div>
              </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function openCartPopup() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_POPUP_OPEN_EVENT));
  }
}
