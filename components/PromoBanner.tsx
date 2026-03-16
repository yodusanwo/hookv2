"use client";

import Link from "next/link";
import { safeHref } from "@/lib/urlValidation";

export function PromoBanner({ text, href }: { text: string; href?: string | null }) {
  const defaultHeadline = "Subscribe to get 10% off your first order";
  const headline = (text?.trim() || defaultHeadline).replace(/\s*\n\s*/g, " ").trim();
  const resolvedHref = (href?.trim() && safeHref(href) !== "#") ? safeHref(href) : "/contact";

  return (
    <div
      className="relative z-30 flex w-full flex-col items-center justify-center gap-2 px-4 py-4 md:flex-row md:gap-3 md:px-12 md:py-5"
      style={{ backgroundColor: "var(--brand-green)", fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <Link href={resolvedHref} className="flex w-full flex-col items-center justify-center gap-2 md:flex-row md:gap-3 outline-none hover:opacity-95">
        <div className="text-center text-white md:flex md:items-center md:gap-3" style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)", fontWeight: 300, lineHeight: 1.3 }}>
          <span>{headline}</span>
          <img
            src="/Icon%20arrow%20right.svg"
            alt=""
            aria-hidden
            width={20.667}
            height={12}
            className="shrink-0 inline-block"
          />
        </div>
      </Link>
    </div>
  );
}
