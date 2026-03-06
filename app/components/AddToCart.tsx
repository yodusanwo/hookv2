"use client";

import * as React from "react";

type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  price: { amount: string; currencyCode: string };
};

function formatMoney(amount: string, currency: string) {
  const n = Math.round(Number(amount));
  if (!Number.isFinite(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${amount} ${currency}`;
  }
}

function getVariantByOptions(
  variants: Variant[],
  selected: Record<string, string>
) {
  return variants.find((v) =>
    v.selectedOptions.every((o) => selected[o.name] === o.value)
  );
}

async function ensureCartId(): Promise<string> {
  const existing =
    typeof window !== "undefined"
      ? window.localStorage.getItem("shopify_cart_id")
      : null;
  if (existing) return existing;

  const res = await fetch("/api/cart", { method: "POST" });
  if (!res.ok) throw new Error("Failed to create cart.");
  const json = (await res.json()) as { id: string };
  window.localStorage.setItem("shopify_cart_id", json.id);
  return json.id;
}

export function AddToCart({
  productTitle,
  options,
  variants,
  variant = "default",
}: {
  productTitle: string;
  options: Array<{ name: string; values: string[] }>;
  variants: Variant[];
  /** "productPage" = inline quantity stepper, price beside it, green Add to cart button, no card wrapper */
  variant?: "default" | "productPage";
}) {
  const initialSelected = React.useMemo(() => {
    const first = variants.find((v) => v.availableForSale) ?? variants[0];
    const s: Record<string, string> = {};
    for (const o of first?.selectedOptions ?? []) s[o.name] = o.value;
    return s;
  }, [variants]);

  const [selected, setSelected] = React.useState<Record<string, string>>(
    initialSelected
  );
  const selectedVariant = React.useMemo(
    () => getVariantByOptions(variants, selected) ?? variants[0],
    [variants, selected]
  );

  const [qty, setQty] = React.useState(1);
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);

  if (!selectedVariant) {
    return (
      <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm text-center text-sm text-slate-600">
        No variants available for this product.
      </div>
    );
  }

  async function onAdd() {
    setStatus("loading");
    setError(null);
    try {
      const cartId = await ensureCartId();
      const res = await fetch("/api/cart/lines", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cartId,
          merchandiseId: selectedVariant.id,
          quantity: qty,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Failed to add to cart.");
      setStatus("success");
      window.setTimeout(() => setStatus("idle"), 1500);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  const priceDisplay = formatMoney(
    selectedVariant.price.amount,
    selectedVariant.price.currencyCode
  );

  if (variant === "productPage") {
    return (
      <div className="space-y-6">
        {options.length > 0 ? (
          <div className="space-y-3">
            {options.map((opt) => (
              <div key={opt.name}>
                <div className="text-xs font-semibold tracking-wide text-slate-600">
                  {opt.name}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSelected = selected[opt.name] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setSelected((s) => ({ ...s, [opt.name]: val }))
                        }
                        className={`h-9 rounded-full px-3 text-sm ring-1 transition-colors ${
                          isSelected
                            ? "bg-[var(--brand-navy)] text-white ring-[var(--brand-navy)]"
                            : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                        }`}
                        aria-pressed={isSelected}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-md border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setQty((n) => Math.max(1, n - 1))}
              className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              id="qty"
              type="number"
              min={1}
              max={50}
              value={qty}
              onChange={(e) =>
                setQty(
                  Math.min(50, Math.max(1, Math.floor(Number(e.target.value) || 1)))
                )
              }
              className="h-10 w-14 border-0 bg-transparent text-center text-sm outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQty((n) => Math.min(50, n + 1))}
              className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-lg font-semibold text-[var(--brand-navy)]">
            {priceDisplay}
          </span>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={!selectedVariant.availableForSale || status === "loading"}
          className="inline-flex h-12 w-full min-w-[200px] items-center justify-center rounded-md px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: "var(--brand-green)" }}
        >
          {status === "loading"
            ? "Adding…"
            : status === "success"
              ? "Added!"
              : "Add to cart"}
        </button>

        {status === "error" && error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Price</div>
          <div className="mt-1 text-lg font-semibold text-sky-900">
            {priceDisplay}
          </div>
        </div>
        <div
          className={`mt-1 rounded-full px-2 py-1 text-xs font-semibold ${
            selectedVariant.availableForSale
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {selectedVariant.availableForSale ? "In stock" : "Sold out"}
        </div>
      </div>

      {options.length > 0 ? (
        <div className="mt-5 space-y-4">
          {options.map((opt) => (
            <div key={opt.name}>
              <div className="text-xs font-semibold tracking-wide text-slate-600">
                {opt.name}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {opt.values.map((val) => {
                  const isSelected = selected[opt.name] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setSelected((s) => ({ ...s, [opt.name]: val }))
                      }
                      className={`h-9 rounded-full px-3 text-sm ring-1 transition-colors ${
                        isSelected
                          ? "bg-slate-900 text-white ring-slate-900"
                          : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-3">
        <label className="text-sm text-slate-700" htmlFor="qty">
          Qty
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={50}
          value={qty}
          onChange={(e) => setQty(Math.min(50, Math.max(1, Math.floor(Number(e.target.value) || 1))))}
          className="h-10 w-20 rounded-md border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-700"
        />
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={!selectedVariant.availableForSale || status === "loading"}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading"
          ? "Adding…"
          : status === "success"
            ? "Added!"
            : `Add ${productTitle} to cart`}
      </button>

      {status === "error" && error ? (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      ) : null}
    </div>
  );
}

