"use client";

import * as React from "react";
import Link from "next/link";
import {
  getInitialSelectedOptions,
  getVariantByOptions,
  type ProductVariantOption,
} from "@/lib/productVariantSelection";
import { useOptionalProductVariant } from "@/app/components/ProductVariantContext";

type Variant = ProductVariantOption;

function formatMoney(amount: string, currency: string) {
  const n = Math.round(Number(amount));
  if (!Number.isFinite(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${amount} ${currency}`;
  }
}

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

export function AddToCart({
  productTitle,
  options,
  variants,
  variant = "default",
}: {
  productTitle: string;
  options: Array<{ name: string; values: string[] }>;
  variants: Variant[];
  /** "productPage" = inline quantity stepper, price beside it, green Add to cart button, no card wrapper */
  /** "recipeIngredient" = single compact green "Add to cart" button (e.g. next to recipe ingredients) */
  variant?: "default" | "productPage" | "recipeIngredient";
}) {
  const shared = useOptionalProductVariant();
  const initialSelected = React.useMemo(
    () => getInitialSelectedOptions(variants),
    [variants],
  );
  const [localSelected, setLocalSelected] =
    React.useState<Record<string, string>>(initialSelected);
  const selected = shared?.selected ?? localSelected;
  const setSelected = shared?.setSelected ?? setLocalSelected;
  const selectedVariant = React.useMemo(() => {
    if (shared) return shared.selectedVariant;
    return getVariantByOptions(variants, selected) ?? variants[0];
  }, [shared, variants, selected]);

  const [qty, setQty] = React.useState(1);
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);
  const [buyNowLoading, setBuyNowLoading] = React.useState(false);
  const [buyNowError, setBuyNowError] = React.useState<string | null>(null);

  const onAdd = React.useCallback(async () => {
    if (!selectedVariant?.id) return;
    setStatus("loading");
    setError(null);
    try {
      const cartId = await ensureCartId();
      const res = await fetch("/api/cart/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          merchandiseId: selectedVariant.id,
          quantity: qty,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        checkoutUrl?: string;
      };
      if (!res.ok) throw new Error(json?.error ?? "Failed to add to cart.");
      setCheckoutUrl(json.checkoutUrl ?? null);
      setStatus("success");
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (e) {
      setStatus("error");
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      if (
        typeof message === "string" &&
        (message.toLowerCase().includes("cart not found") ||
          message.toLowerCase().includes("expired"))
      ) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("shopify_cart_id");
        }
      }
    }
  }, [selectedVariant, qty]);

  // Reset to idle when user changes qty or variant so they can add again
  React.useEffect(() => {
    if (status === "success" || status === "error") {
      setStatus("idle");
    }
  }, [qty, selectedVariant?.id]);

  React.useEffect(() => {
    setBuyNowError(null);
  }, [selectedVariant?.id]);

  const onBuyNow = React.useCallback(async () => {
    if (!selectedVariant?.id || !selectedVariant.availableForSale || buyNowLoading)
      return;
    setBuyNowError(null);
    setBuyNowLoading(true);
    try {
      const res = await fetch("/api/checkout/buy-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchandiseId: selectedVariant.id,
          quantity: qty,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Could not start checkout.");
      }
      if (json.checkoutUrl) {
        window.location.assign(json.checkoutUrl);
        return;
      }
      throw new Error("No checkout URL returned.");
    } catch (e) {
      setBuyNowError(
        e instanceof Error ? e.message : "Could not start checkout.",
      );
    } finally {
      setBuyNowLoading(false);
    }
  }, [selectedVariant, qty, buyNowLoading]);

  if (!selectedVariant) {
    return (
      <div className="rounded-card border border-black/5 bg-white p-5 shadow-sm text-center text-sm text-slate-600">
        No variants available for this product.
      </div>
    );
  }

  const priceDisplay = formatMoney(
    selectedVariant.price.amount,
    selectedVariant.price.currencyCode
  );

  if (variant === "recipeIngredient") {
    return (
      <span className="inline-flex shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onAdd();
          }}
          disabled={!selectedVariant.availableForSale || status === "loading"}
          className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor:
              selectedVariant.availableForSale ? "var(--brand-green)" : "var(--brand-navy, #1e3a5f)",
          }}
        >
          {status === "loading" ? "Adding…" : status === "success" ? "Added!" : "Add to cart"}
        </button>
      </span>
    );
  }

  if (variant === "productPage") {
    return (
      <div className="space-y-6 bg-[#d4f2ff]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              void onBuyNow();
            }}
            disabled={
              !selectedVariant.availableForSale ||
              buyNowLoading ||
              status === "loading"
            }
            className="inline-flex h-12 w-full min-w-0 items-center justify-center rounded-md border-2 border-[var(--brand-navy)] bg-white px-4 text-sm font-semibold text-[var(--brand-navy)] transition-opacity hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buyNowLoading ? "Redirecting…" : "Buy now"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onAdd();
            }}
            disabled={
              !selectedVariant.availableForSale || status === "loading"
            }
            className="inline-flex h-12 w-full min-w-0 items-center justify-center rounded-md px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor:
                selectedVariant.availableForSale
                  ? "var(--brand-green)"
                  : "var(--brand-navy, #1e3a5f)",
            }}
          >
            {status === "loading"
              ? "Adding…"
              : status === "success"
                ? "Added!"
                : !selectedVariant.availableForSale
                  ? "Sold out"
                  : "Add to cart"}
          </button>
        </div>

        {buyNowError ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {buyNowError}
          </p>
        ) : null}

        {options.length > 0 ? (
          <div className="space-y-3">
            {options.map((opt) => (
              <div key={opt.name}>
                <div className="text-xs font-semibold tracking-wide text-slate-600">
                  {opt.name}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSelected = selected[opt.name] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setSelected((s) => ({ ...s, [opt.name]: val }))
                        }
                        className={`h-9 rounded-full px-3 text-sm ring-1 transition-colors ${
                          isSelected
                            ? "bg-[var(--brand-navy)] text-white ring-[var(--brand-navy)]"
                            : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                        }`}
                        aria-pressed={isSelected}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-md border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setQty((n) => Math.max(1, n - 1))}
              className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              id="qty"
              type="number"
              min={1}
              max={50}
              value={qty}
              onChange={(e) =>
                setQty(
                  Math.min(50, Math.max(1, Math.floor(Number(e.target.value) || 1)))
                )
              }
              className="h-10 w-14 border-0 bg-transparent text-center text-sm outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQty((n) => Math.min(50, n + 1))}
              className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-lg font-semibold text-[var(--brand-navy)]">
            {priceDisplay}
          </span>
        </div>

        {status === "success" ? (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cart"
              className="inline-flex h-10 min-w-[100px] items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View cart
            </Link>
            {checkoutUrl ? (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 min-w-[100px] items-center justify-center rounded-md px-4 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: "var(--brand-green)" }}
              >
                Checkout
              </a>
            ) : null}
          </div>
        ) : null}

        {status === "error" && error ? (
          <p className="mt-2 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-card border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Price</div>
          <div className="mt-1 text-lg font-semibold text-sky-900">
            {priceDisplay}
          </div>
        </div>
        <div
          className={`mt-1 rounded-full px-2 py-1 text-xs font-semibold ${
            selectedVariant.availableForSale
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {selectedVariant.availableForSale ? "In stock" : "Sold out"}
        </div>
      </div>

      {options.length > 0 ? (
        <div className="mt-5 space-y-4">
          {options.map((opt) => (
            <div key={opt.name}>
              <div className="text-xs font-semibold tracking-wide text-slate-600">
                {opt.name}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {opt.values.map((val) => {
                  const isSelected = selected[opt.name] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setSelected((s) => ({ ...s, [opt.name]: val }))
                      }
                      className={`h-9 rounded-full px-3 text-sm ring-1 transition-colors ${
                        isSelected
                          ? "bg-slate-900 text-white ring-slate-900"
                          : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-3">
        <label className="text-sm text-slate-700" htmlFor="qty">
          Qty
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={50}
          value={qty}
          onChange={(e) => setQty(Math.min(50, Math.max(1, Math.floor(Number(e.target.value) || 1))))}
          className="h-10 w-20 rounded-md border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-700"
        />
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={!selectedVariant.availableForSale || status === "loading"}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading"
          ? "Adding…"
          : status === "success"
            ? "Added!"
            : `Add ${productTitle} to cart`}
      </button>

      {status === "error" && error ? (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      ) : null}
    </div>
  );
}

