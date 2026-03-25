/** Minimal cart line shape for subscription messaging (full cart + cart popup). */
export type CartLineForSubscriptionNote = {
  quantity: number;
  merchandise: {
    price: { amount: string; currencyCode: string };
  };
  cost?: {
    totalAmount?: { amount: string; currencyCode: string };
  };
  sellingPlanAllocation?: { sellingPlan?: { name: string } } | null;
};

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
 * Line note when a cart line has a selling plan: Subscribe & Save · {plan}. … enjoy {savings} …
 */
export function subscriptionCartLineNote(
  line: CartLineForSubscriptionNote,
): string | null {
  const planName = line.sellingPlanAllocation?.sellingPlan?.name?.trim();
  if (!planName) return null;
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
