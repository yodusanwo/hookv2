"use client";

import * as React from "react";
import {
  getInitialSelectedOptions,
  getVariantByOptions,
  type ProductVariantOption,
} from "@/lib/productVariantSelection";

export type ProductVariantContextValue = {
  selected: Record<string, string>;
  setSelected: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedVariant: ProductVariantOption | undefined;
  variants: ProductVariantOption[];
  options: Array<{ name: string; values: string[] }>;
};

const ProductVariantContext =
  React.createContext<ProductVariantContextValue | null>(null);

export function ProductVariantProvider({
  variants,
  options,
  children,
}: {
  variants: ProductVariantOption[];
  options: Array<{ name: string; values: string[] }>;
  children: React.ReactNode;
}) {
  const initialSelected = React.useMemo(
    () => getInitialSelectedOptions(variants),
    [variants],
  );
  const [selected, setSelected] =
    React.useState<Record<string, string>>(initialSelected);

  const selectedVariant = React.useMemo(
    () => getVariantByOptions(variants, selected) ?? variants[0],
    [variants, selected],
  );

  const value = React.useMemo(
    () => ({
      selected,
      setSelected,
      selectedVariant,
      variants,
      options,
    }),
    [selected, selectedVariant, variants, options],
  );

  return (
    <ProductVariantContext.Provider value={value}>
      {children}
    </ProductVariantContext.Provider>
  );
}

export function useOptionalProductVariant() {
  return React.useContext(ProductVariantContext);
}

export function useProductVariant() {
  const ctx = React.useContext(ProductVariantContext);
  if (!ctx) {
    throw new Error(
      "useProductVariant must be used within ProductVariantProvider",
    );
  }
  return ctx;
}
