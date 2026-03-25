import type { MoneyBrief, SellingPlanBrief } from "@/lib/types";

/** True when `a` is strictly cheaper than `b` (same currency). */
export function unitPriceIsLowerThan(a: MoneyBrief, b: MoneyBrief): boolean {
  if (a.currencyCode !== b.currencyCode) return false;
  const na = Number(a.amount);
  const nb = Number(b.amount);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
  return na < nb - 1e-9;
}

/**
 * Unit price to display: variant base price for one-time, or `perDeliveryPrice` for the selected
 * selling plan when subscription applies (matches Shopify SellingPlanAllocation price adjustments).
 */
export function effectiveSubscriptionUnitPrice(
  base: MoneyBrief,
  options: {
    requiresSellingPlan?: boolean;
    sellingPlans?: SellingPlanBrief[];
    purchaseKind: "one-time" | "subscribe";
    planId: string;
  },
): MoneyBrief {
  const { requiresSellingPlan, sellingPlans = [], purchaseKind, planId } =
    options;
  const mustSub = Boolean(requiresSellingPlan) && sellingPlans.length > 0;
  const useSubscribe =
    sellingPlans.length > 0 && (mustSub || purchaseKind === "subscribe");
  if (!useSubscribe) return base;
  const plan =
    sellingPlans.find((p) => p.id === planId) ?? sellingPlans[0];
  const sub = plan?.perDeliveryPrice;
  if (sub?.amount != null && sub.currencyCode) return sub;
  return base;
}
