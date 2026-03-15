"use client";

import * as React from "react";
import Image from "next/image";

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-cart-modal-title"
    >
      {/* Semi-transparent overlay */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 z-0 bg-black/50"
        aria-label="Close"
      />

      <div
        className="relative z-10 p-6 shadow-xl flex flex-col justify-center items-center"
        style={{
          width: 647,
          height: 288,
          borderRadius: 10,
          background: "var(--Grey-Background, #F2F2F5)",
        }}
      >
        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 hover:opacity-80 transition-opacity"
          aria-label="Close"
        >
          <Image src="/Exiticon.svg" alt="" width={28} height={28} />
        </button>

        <div className="flex flex-col items-center justify-center text-center max-w-[calc(100%-3rem)]">
          <p id="add-to-cart-modal-title" className="text-slate-700">
            The product has been added to your cart successfully.
          </p>
          <p className="mt-2 text-slate-700">Would you like to check out?</p>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
          <a
            href={checkoutUrl ?? "#"}
            className="inline-flex shrink-0 items-center justify-center text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{
              width: 163.777,
              height: 45.643,
              padding: "10.482px 22.929px",
              borderRadius: 6.551,
              background: "#069400",
              aspectRatio: "61/17",
            }}
          >
            Check Out
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 items-center justify-center bg-white hover:bg-slate-50 transition-colors whitespace-nowrap"
            style={{
              width: 165,
              height: 46,
              padding: "13px 18px 16px 17px",
              borderRadius: 6.551,
              border: "1px solid #069400",
              color: "var(--Green, #069400)",
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            Continue Shopping
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
