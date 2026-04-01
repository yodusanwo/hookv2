"use client";

import * as React from "react";
import { useProductVariant } from "@/app/components/ProductVariantContext";
import { trackViewItem } from "@/app/lib/ga4Ecommerce";

export function ProductViewTracker({
  productTitle,
  productType,
}: {
  productTitle: string;
  productType?: string;
}) {
  const { selectedVariant } = useProductVariant();
  const lastTrackedKey = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!selectedVariant?.id) return;
    const key = `${selectedVariant.id}:${selectedVariant.price.amount}:${selectedVariant.price.currencyCode}`;
    if (lastTrackedKey.current === key) return;
    lastTrackedKey.current = key;
    trackViewItem({
      productTitle,
      productType,
      variant: selectedVariant,
    });
  }, [productTitle, productType, selectedVariant]);

  return null;
}
