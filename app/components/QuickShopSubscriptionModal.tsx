"use client";

import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { trackAddToCart } from "@/app/lib/ga4Ecommerce";
import type { MoneyBrief, SellingPlanBrief } from "@/lib/types";
import {
  effectiveSubscriptionUnitPrice,
  unitPriceIsLowerThan,
} from "@/lib/effectiveSubscriptionUnitPrice";
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productType?: string | null;
  variantTitle?: string | null;
  /** Variant one-time (base) price; subscription uses per-plan `perDeliveryPrice` when present. */
  basePrice: MoneyBrief;
  variantId: string;
  requiresSellingPlan: boolean;
  sellingPlans: SellingPlanBrief[];
  onSuccess: (checkoutUrl: string | null) => void;
};

/**
 * Quick shop for carousel/collection cards: choose one-time vs subscription (when applicable)
 * and selling plan, then add to cart. Parent typically shows AddToCartModal after success.
 */
export function QuickShopSubscriptionModal({
  isOpen,
  onClose,
  productTitle,
  productType,
  variantTitle,
  basePrice,
  variantId,
  requiresSellingPlan,
  sellingPlans,
  onSuccess,
}: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [purchaseKind, setPurchaseKind] = React.useState<"one-time" | "subscribe">(
    "one-time",
  );
  const [planIdForSubscribe, setPlanIdForSubscribe] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSubmitting(false);
    const first = sellingPlans[0]?.id ?? "";
    setPlanIdForSubscribe(first);
    if (requiresSellingPlan && sellingPlans.length > 0) {
      setPurchaseKind("subscribe");
    } else {
      setPurchaseKind("one-time");
    }
  }, [isOpen, requiresSellingPlan, sellingPlans]);

  const unitForDisplay = effectiveSubscriptionUnitPrice(basePrice, {
    requiresSellingPlan,
    sellingPlans,
    purchaseKind,
    planId: planIdForSubscribe,
  });
  const priceLabel = formatMoney(
    unitForDisplay.amount,
    unitForDisplay.currencyCode,
  );
  const basePriceLabel = formatMoney(
    basePrice.amount,
    basePrice.currencyCode,
  );
  const subscriptionPriceActive =
    sellingPlans.length > 0 &&
    (requiresSellingPlan || purchaseKind === "subscribe");
  const showSubscriptionDiscount =
    subscriptionPriceActive &&
    unitPriceIsLowerThan(unitForDisplay, basePrice);

  const handleAdd = React.useCallback(async () => {
    if (!variantId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const mustUseSellingPlan =
        requiresSellingPlan && sellingPlans.length > 0;
      let sellingPlanId: string | undefined;
      if (
        sellingPlans.length > 0 &&
        (mustUseSellingPlan || purchaseKind === "subscribe")
      ) {
        sellingPlanId =
          sellingPlans.length === 1
            ? sellingPlans[0]!.id
            : planIdForSubscribe || sellingPlans[0]!.id;
      }
      const cartId = await ensureCartId();
      const res = await fetch("/api/cart/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          merchandiseId: variantId,
          quantity: 1,
          ...(sellingPlanId ? { sellingPlanId } : {}),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        checkoutUrl?: string;
      };
      if (!res.ok) throw new Error(json?.error ?? "Failed to add to cart.");
      trackAddToCart({
        productTitle,
        productType: productType ?? undefined,
        variant: {
          id: variantId,
          title: variantTitle ?? undefined,
          price: unitForDisplay,
        },
        quantity: 1,
      });
      onSuccess(
        json.checkoutUrl ? getCheckoutUrl(json.checkoutUrl) : null,
      );
      onClose();
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not add to cart.";
      setError(message);
      if (
        typeof message === "string" &&
        (message.toLowerCase().includes("cart not found") ||
          message.toLowerCase().includes("expired"))
      ) {
        window.localStorage.removeItem("shopify_cart_id");
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    productTitle,
    productType,
    variantTitle,
    unitForDisplay,
    variantId,
    submitting,
    requiresSellingPlan,
    sellingPlans,
    purchaseKind,
    planIdForSubscribe,
    onSuccess,
    onClose,
  ]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-shop-title"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 z-0 bg-black/50"
        aria-label="Close"
      />
      <div
        className="relative z-10 w-full max-w-md rounded-[10px] bg-[#F2F2F5] p-6 shadow-xl"
        style={{ fontFamily: "Inter, var(--font-inter), sans-serif" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 hover:opacity-80 transition-opacity"
          aria-label="Close"
        >
          <Image src="/Exiticon.svg" alt="" width={28} height={28} />
        </button>

        <h2
          id="quick-shop-title"
          className="pr-10 text-lg font-semibold text-slate-900"
        >
          {productTitle}
        </h2>
        <div
          className="mt-1 flex flex-wrap items-baseline gap-2"
          {...(showSubscriptionDiscount
            ? {
                "aria-label": `Sale price ${priceLabel}, was ${basePriceLabel}`,
              }
            : {})}
        >
          {showSubscriptionDiscount ? (
            <>
              <span
                className="text-base font-medium text-slate-500 line-through decoration-slate-400"
                aria-hidden
              >
                {basePriceLabel}
              </span>
              <span className="text-lg font-bold text-[var(--brand-green,#069400)]">
                {priceLabel}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-[var(--brand-navy,#171730)]">
              {priceLabel}
            </span>
          )}
        </div>

        <div className="mt-5 space-y-3 rounded-lg border border-slate-200 bg-white/90 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {requiresSellingPlan ? "Subscription" : "Purchase type"}
          </div>
          {requiresSellingPlan ? (
            <p className="text-sm text-slate-700">
              Choose a delivery frequency for this subscription.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-800">
                <input
                  type="radio"
                  name="quick-shop-kind"
                  checked={purchaseKind === "one-time"}
                  onChange={() => setPurchaseKind("one-time")}
                  className="mt-1"
                />
                <span>One-time purchase</span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-800">
                <input
                  type="radio"
                  name="quick-shop-kind"
                  checked={purchaseKind === "subscribe"}
                  onChange={() => setPurchaseKind("subscribe")}
                  className="mt-1"
                />
                <span>Subscribe &amp; save</span>
              </label>
            </div>
          )}
          {(requiresSellingPlan || purchaseKind === "subscribe") &&
          sellingPlans.length > 1 ? (
            <div>
              <label htmlFor="quick-shop-plan" className="sr-only">
                Frequency
              </label>
              <select
                id="quick-shop-plan"
                value={planIdForSubscribe}
                onChange={(e) => setPlanIdForSubscribe(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {sellingPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {requiresSellingPlan && sellingPlans.length === 1 ? (
            <p className="text-sm font-medium text-slate-800">
              {sellingPlans[0]!.name}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={submitting}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: "var(--brand-green, #069400)" }}
          >
            {submitting ? "Adding…" : "Add to cart"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
