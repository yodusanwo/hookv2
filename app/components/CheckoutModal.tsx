"use client";

import * as React from "react";
import Image from "next/image";

const CHECKOUT_MODAL_OPEN_EVENT = "open-checkout-modal";

export function CheckoutModal() {
  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent<{ checkoutUrl: string }>).detail?.checkoutUrl;
      if (url && typeof url === "string") {
        setCheckoutUrl(url);
      }
    };
    window.addEventListener(CHECKOUT_MODAL_OPEN_EVENT, handler);
    return () => window.removeEventListener(CHECKOUT_MODAL_OPEN_EVENT, handler);
  }, []);

  const close = React.useCallback(() => setCheckoutUrl(null), []);

  if (!checkoutUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 z-0 bg-black/50"
        aria-label="Close"
      />
      <div className="relative z-10 flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[10px] bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2
            id="checkout-modal-title"
            className="text-lg font-bold text-slate-900"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Checkout
          </h2>
          <button
            type="button"
            onClick={close}
            className="hover:opacity-80 transition-opacity"
            aria-label="Close"
          >
            <Image src="/Exiticon.svg" alt="" width={28} height={28} />
          </button>
        </div>

        {/* Iframe */}
        <div className="relative flex-1 min-h-0">
          <iframe
            src={checkoutUrl}
            title="Checkout"
            className="absolute inset-0 h-full w-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>

        {/* Fallback: Open in new tab */}
        <div className="shrink-0 border-t border-slate-200 px-6 py-3 text-center">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-600 underline hover:text-slate-900"
          >
            Having trouble? Open checkout in a new tab
          </a>
        </div>
      </div>
    </div>
  );
}

export function openCheckoutModal(checkoutUrl: string) {
  if (typeof window !== "undefined" && checkoutUrl) {
    window.dispatchEvent(
      new CustomEvent(CHECKOUT_MODAL_OPEN_EVENT, {
        detail: { checkoutUrl },
      })
    );
  }
}
