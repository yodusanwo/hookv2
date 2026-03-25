/** Minimal cart line shape for subscription messaging (full cart + cart popup). */
export type CartLineForSubscriptionNote = {
  quantity: number;
  merchandise: {
    price: { amount: string; currencyCode: string };
    product?: {
      /** From Storefront `Product.requiresSellingPlan` — subscription-only when true. */
      requiresSellingPlan?: boolean;
    };
  };
  cost?: {
    totalAmount?: { amount: string; currencyCode: string };
  };
  sellingPlanAllocation?: { sellingPlan?: { name: string } } | null;
};

/**
 * Shopify/Appstle plan names often include a leading "Subscribe:"; strip repeats so we
 * don't show "Subscribe: Subscribe: Deliver Every Month".
 */
function sellingPlanDisplayLabel(raw: string): string {
  let s = raw.trim();
  while (/^subscribe\s*:\s*/i.test(s)) {
    s = s.replace(/^subscribe\s*:\s*/i, "").trim();
  }
  return s.trim();
}

/** Ends with a single period for cart line display. */
function withClosingPeriod(label: string): string {
  const t = label.trim();
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function formatSavingsAmount(amount: number, currencyCode: string): string {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Line note when a cart line has a selling plan.
 * Subscription-only products: short line — delivery frequency only (e.g. "Deliver Every Month.").
 * Optional subscribe: show savings vs list price when applicable.
 */
export function subscriptionCartLineNote(
  line: CartLineForSubscriptionNote,
): string | null {
  const planName = line.sellingPlanAllocation?.sellingPlan?.name?.trim();
  if (!planName) return null;

  const subscriptionOnly =
    line.merchandise.product?.requiresSellingPlan === true;

  if (subscriptionOnly) {
    const label = sellingPlanDisplayLabel(planName);
    if (!label) return null;
    return withClosingPeriod(label);
  }

  const qty = Math.max(1, line.quantity);
  const oneTimeTotal = parseFloat(line.merchandise.price.amount) * qty;
  const subscriptionTotal =
    line.cost?.totalAmount?.amount != null
      ? parseFloat(line.cost.totalAmount.amount)
      : oneTimeTotal;
  const savings = Math.max(0, oneTimeTotal - subscriptionTotal);
  const currency =
    line.cost?.totalAmount?.currencyCode ??
    line.merchandise.price.currencyCode;
  const savingsStr = formatSavingsAmount(savings, currency);
  if (savings > 0.005 && savingsStr) {
    return `Subscribe & Save · ${planName}. Your subscription price is applied — enjoy ${savingsStr} in savings vs. one-time purchase.`;
  }
  return `Subscribe & Save · ${planName}. Your subscription price is applied vs. one-time purchase.`;
}
