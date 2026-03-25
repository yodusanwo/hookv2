import type { MoneyBrief, SellingPlanBrief } from "./types";

type AllocationNode = {
  sellingPlan?: { id: string; name: string } | null;
  priceAdjustments?: Array<{
    perDeliveryPrice?: MoneyBrief | null;
  }> | null;
} | null;

/**
 * Maps Storefront API `sellingPlanAllocations` on a variant to plan list with optional per-delivery price.
 */
export function sellingPlansFromVariantNode(
  variant: {
    sellingPlanAllocations?: {
      edges?: Array<{
        node?: AllocationNode;
      }>;
    };
  } | null | undefined
): SellingPlanBrief[] | undefined {
  const edges = variant?.sellingPlanAllocations?.edges;
  if (!edges?.length) return undefined;
  const out: SellingPlanBrief[] = [];
  for (const e of edges) {
    const id = e.node?.sellingPlan?.id;
    if (!id) continue;
    const firstAdj = e.node?.priceAdjustments?.[0];
    const perDelivery = firstAdj?.perDeliveryPrice;
    const perDeliveryPrice: MoneyBrief | undefined =
      perDelivery?.amount != null &&
      perDelivery.amount !== "" &&
      perDelivery.currencyCode
        ? {
            amount: perDelivery.amount,
            currencyCode: perDelivery.currencyCode,
          }
        : undefined;
    out.push({
      id,
      name: e.node?.sellingPlan?.name?.trim() || "Subscription",
      ...(perDeliveryPrice ? { perDeliveryPrice } : {}),
    });
  }
  return out.length ? out : undefined;
}
