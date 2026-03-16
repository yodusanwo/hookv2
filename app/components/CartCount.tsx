"use client";

import * as React from "react";
import Link from "next/link";
import { IconCart } from "./Icons";

const CART_ID_KEY = "shopify_cart_id";

type CartCountProps = {
  /** "header" = icon + badge inline; "bottomNav" = icon + badge + label below */
  variant?: "header" | "bottomNav";
};

export function CartCount({ variant = "header" }: CartCountProps) {
  const [count, setCount] = React.useState<number | null>(null);

  const fetchCount = React.useCallback(() => {
    const cartId =
      typeof window !== "undefined"
        ? window.localStorage.getItem(CART_ID_KEY)
        : null;
    if (!cartId) {
      setCount(null);
      return;
    }
    fetch(`/api/cart/count?cartId=${encodeURIComponent(cartId)}`)
      .then((res) => {
        if (res.status === 404) {
          window.localStorage.removeItem(CART_ID_KEY);
          setCount(null);
          return null;
        }
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: { totalQuantity?: number } | null) => {
        if (!data) return;
        const qty = typeof data.totalQuantity === "number" ? data.totalQuantity : null;
        setCount(qty ?? 0);
      })
      .catch(() => setCount(null));
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    fetchCount();
    const handler = () => fetchCount();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [fetchCount]);

  const badgeCount = count != null && count > 0 ? count : null;

  const baseClass =
    variant === "bottomNav"
      ? "relative flex flex-col items-center gap-1 text-xs font-medium text-white/90 hover:text-white"
      : "relative flex min-h-[44px] min-w-[44px] items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-colors";

  return (
    <Link
      href="/cart"
      aria-label={badgeCount != null ? `Cart (${badgeCount} items)` : "Cart"}
      className={baseClass}
    >
      <span className="relative inline-block">
        <IconCart className="h-5 w-5" aria-hidden={variant === "bottomNav"} />
        {badgeCount != null ? (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-slate-900"
            aria-hidden
          >
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        ) : null}
      </span>
      {variant === "bottomNav" ? <span>Cart</span> : null}
    </Link>
  );
}
