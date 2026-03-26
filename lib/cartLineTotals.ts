/**
 * Line amount as shown in cart UI (matches Shopify line cost when present).
 * Use {@link sumCartLineDisplayAmounts} for subtotals so the footer always
 * matches row math — `cart.cost.totalAmount` can lag after optimistic updates
 * or diverge from line sums in edge cases.
 */
export function cartLineDisplayAmount(line: {
  quantity: number;
  cost?: { totalAmount?: { amount: string } | null } | null;
  merchandise: { price: { amount: string } };
}): number {
  return line.cost?.totalAmount?.amount != null
    ? parseFloat(line.cost.totalAmount.amount)
    : parseFloat(line.merchandise.price.amount) * line.quantity;
}

export function sumCartLineDisplayAmounts(
  lines: Array<{
    quantity: number;
    cost?: { totalAmount?: { amount: string } | null } | null;
    merchandise: { price: { amount: string } };
  }>
): number {
  return lines.reduce((sum, l) => sum + cartLineDisplayAmount(l), 0);
}

export function cartDisplayCurrencyCode(
  lines: Array<{
    cost?: { totalAmount?: { currencyCode?: string } | null } | null;
    merchandise: { price: { currencyCode: string } };
  }>,
  fallback: string
): string {
  const first = lines[0];
  return (
    first?.cost?.totalAmount?.currencyCode ??
    first?.merchandise?.price?.currencyCode ??
    fallback
  );
}
