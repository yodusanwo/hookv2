"use client";

import { pushEcommerceEvent } from "@/app/lib/dataLayer";

const ITEM_BRAND = "Hook Point Fisheries";

type Price = { amount: string; currencyCode: string };

type VariantLike = {
  id: string;
  title?: string;
  price: Price;
};

type CartLineLike = {
  quantity: number;
  cost?: {
    totalAmount?: { amount: string; currencyCode: string };
    amountPerQuantity?: { amount: string; currencyCode: string };
  };
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      productType?: string;
    };
    price: Price;
  };
};

function toAmount(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeVariantTitle(title: string | undefined): string | undefined {
  const trimmed = title?.trim();
  if (!trimmed || trimmed === "Default Title") return undefined;
  return trimmed;
}

function priceForCartLine(line: CartLineLike): Price {
  return (
    line.cost?.amountPerQuantity ?? line.cost?.totalAmount ?? line.merchandise.price
  );
}

export function buildGa4ItemFromVariant({
  productTitle,
  productType,
  variant,
  quantity = 1,
  index,
  itemListName,
}: {
  productTitle: string;
  productType?: string;
  variant: VariantLike;
  quantity?: number;
  index?: number;
  itemListName?: string;
}) {
  return {
    item_id: variant.id,
    item_name: productTitle,
    item_brand: ITEM_BRAND,
    ...(productType?.trim() ? { item_category: productType.trim() } : {}),
    ...(normalizeVariantTitle(variant.title)
      ? { item_variant: normalizeVariantTitle(variant.title) }
      : {}),
    ...(typeof index === "number" ? { index } : {}),
    ...(itemListName ? { item_list_name: itemListName } : {}),
    price: toAmount(variant.price.amount),
    quantity,
  };
}

export function buildGa4ItemsFromCartLines(lines: CartLineLike[]) {
  return lines.map((line) =>
    buildGa4ItemFromVariant({
      productTitle: line.merchandise.product.title,
      productType: line.merchandise.product.productType,
      variant: {
        id: line.merchandise.id,
        title: line.merchandise.title,
        price: priceForCartLine(line),
      },
      quantity: line.quantity,
    }),
  );
}

type ListItemLike = {
  id: string;
  title: string;
  productType?: string | null;
  variantId?: string | null;
  variantTitle?: string | null;
  price: string;
  currencyCode: string;
};

export function buildGa4ItemsFromListItems({
  items,
  itemListName,
}: {
  items: ListItemLike[];
  itemListName: string;
}) {
  return items.map((item, index) =>
    buildGa4ItemFromVariant({
      productTitle: item.title,
      productType: item.productType ?? undefined,
      variant: {
        id: item.variantId ?? item.id,
        title: item.variantTitle ?? undefined,
        price: {
          amount: item.price,
          currencyCode: item.currencyCode,
        },
      },
      quantity: 1,
      index,
      itemListName,
    }),
  );
}

export function trackViewItem({
  productTitle,
  productType,
  variant,
}: {
  productTitle: string;
  productType?: string;
  variant: VariantLike;
}) {
  const price = toAmount(variant.price.amount);
  pushEcommerceEvent({
    event: "view_item",
    ecommerce: {
      currency: variant.price.currencyCode,
      value: price,
      items: [
        buildGa4ItemFromVariant({
          productTitle,
          productType,
          variant,
          quantity: 1,
        }),
      ],
    },
  });
}

export function trackViewItemList({
  itemListName,
  items,
}: {
  itemListName: string;
  items: ListItemLike[];
}) {
  if (items.length === 0) return;
  pushEcommerceEvent({
    event: "view_item_list",
    ecommerce: {
      currency: items[0]?.currencyCode ?? "USD",
      items: buildGa4ItemsFromListItems({ items, itemListName }),
    },
  });
}

export function trackSelectItem({
  itemListName,
  item,
  index,
}: {
  itemListName: string;
  item: ListItemLike;
  index: number;
}) {
  pushEcommerceEvent({
    event: "select_item",
    ecommerce: {
      currency: item.currencyCode,
      items: [
        buildGa4ItemFromVariant({
          productTitle: item.title,
          productType: item.productType ?? undefined,
          variant: {
            id: item.variantId ?? item.id,
            title: item.variantTitle ?? undefined,
            price: {
              amount: item.price,
              currencyCode: item.currencyCode,
            },
          },
          quantity: 1,
          index,
          itemListName,
        }),
      ],
    },
  });
}

export function trackAddToCart({
  productTitle,
  productType,
  variant,
  quantity,
}: {
  productTitle: string;
  productType?: string;
  variant: VariantLike;
  quantity: number;
}) {
  const price = toAmount(variant.price.amount);
  pushEcommerceEvent({
    event: "add_to_cart",
    ecommerce: {
      currency: variant.price.currencyCode,
      value: price * quantity,
      items: [
        buildGa4ItemFromVariant({
          productTitle,
          productType,
          variant,
          quantity,
        }),
      ],
    },
  });
}

export function trackBeginCheckoutFromVariant({
  productTitle,
  productType,
  variant,
  quantity,
}: {
  productTitle: string;
  productType?: string;
  variant: VariantLike;
  quantity: number;
}) {
  const price = toAmount(variant.price.amount);
  pushEcommerceEvent({
    event: "begin_checkout",
    ecommerce: {
      currency: variant.price.currencyCode,
      value: price * quantity,
      items: [
        buildGa4ItemFromVariant({
          productTitle,
          productType,
          variant,
          quantity,
        }),
      ],
    },
  });
}

export function trackBeginCheckoutFromCart({
  currency,
  value,
  lines,
}: {
  currency: string;
  value: number;
  lines: CartLineLike[];
}) {
  pushEcommerceEvent({
    event: "begin_checkout",
    ecommerce: {
      currency,
      value,
      items: buildGa4ItemsFromCartLines(lines),
    },
  });
}

export function trackViewCart({
  currency,
  value,
  lines,
}: {
  currency: string;
  value: number;
  lines: CartLineLike[];
}) {
  pushEcommerceEvent({
    event: "view_cart",
    ecommerce: {
      currency,
      value,
      items: buildGa4ItemsFromCartLines(lines),
    },
  });
}

export function trackRemoveFromCart({
  line,
}: {
  line: CartLineLike;
}) {
  const price = priceForCartLine(line);
  const value = toAmount(price.amount) * line.quantity;
  pushEcommerceEvent({
    event: "remove_from_cart",
    ecommerce: {
      currency: price.currencyCode,
      value,
      items: [
        buildGa4ItemFromVariant({
          productTitle: line.merchandise.product.title,
          productType: line.merchandise.product.productType,
          variant: {
            id: line.merchandise.id,
            title: line.merchandise.title,
            price,
          },
          quantity: line.quantity,
        }),
      ],
    },
  });
}
