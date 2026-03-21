"use client";

import { formatVariantSubtitle } from "@/lib/productVariantSelection";
import { useProductVariant } from "./ProductVariantContext";

export function ProductVariantSubtitle({
  productTitle,
}: {
  productTitle: string;
}) {
  const { selectedVariant } = useProductVariant();
  const line = formatVariantSubtitle(productTitle, selectedVariant);

  return (
    <p
      style={{
        marginTop: 21,
        marginBottom: 27,
        color: "#374151",
        fontFamily: "Inter, sans-serif",
        fontSize: "1.5rem",
        fontStyle: "normal",
        fontWeight: 300,
        lineHeight: "normal",
      }}
    >
      {line}
    </p>
  );
}
