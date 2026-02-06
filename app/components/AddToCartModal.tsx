"use client";

import * as React from "react";

export function AddToCartModal({
  isOpen,
  onClose,
  checkoutUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-cart-modal-title"
    >
      {/* Semi-transparent overlay */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
      />

      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-800"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p id="add-to-cart-modal-title" className="pr-8 text-center text-slate-700">
          The product has been added to your cart successfully.
        </p>
        <p className="mt-2 text-center text-slate-700">Would you like to check out?</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={checkoutUrl ?? "#"}
            className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-lg bg-slate-200 px-5 text-sm font-semibold text-slate-800 hover:bg-slate-300"
          >
            Check Out
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
