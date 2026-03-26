"use client";

import Link from "next/link";
import { openKlaviyoForm, parseKlaviyoPromoUrl } from "@/lib/klaviyoOnsite";
import { isValidHref, safeHref } from "@/lib/urlValidation";

export function PromoBanner({ text, href }: { text: string; href?: string | null }) {
  const defaultHeadline = "Subscribe to get 10% off your first order";
  const headline = (text?.trim() || defaultHeadline).replace(/\s*\n\s*/g, " ").trim();

  const explicit = href?.trim() ?? "";
  const parsed = parseKlaviyoPromoUrl(href);
  const envCompany = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID?.trim();
  const envFormId = process.env.NEXT_PUBLIC_KLAVIYO_COUPON_FORM_ID?.trim();
  const envReady = !!envCompany && !!envFormId;

  /**
   * Use Klaviyo when env is set and: URL is `klaviyo` / `klaviyo:Id`, empty (default popup),
   * or non-empty but not a valid path/URL (e.g. accidental label text in Sanity — otherwise
   * `safeHref` becomes `#` and the banner “does nothing”).
   */
  const useKlaviyoButton =
    envReady &&
    (parsed.mode === "klaviyo" ||
      explicit === "" ||
      (explicit !== "" && !isValidHref(explicit)));

  const formId =
    parsed.mode === "klaviyo"
      ? (parsed.formId?.trim() || envFormId || "")
      : envFormId || "";

  const canOpenKlaviyoForm = useKlaviyoButton && !!envCompany && !!formId.trim();

  if (canOpenKlaviyoForm) {
    return (
      <div
        className="relative z-30 flex w-full flex-col items-center justify-center gap-2 px-4 py-4 md:flex-row md:gap-3 md:px-12 md:py-5"
        style={{ backgroundColor: "var(--brand-green)", fontFamily: "var(--font-inter), Inter, sans-serif" }}
      >
        <button
          type="button"
          onClick={() => openKlaviyoForm(formId)}
          aria-label={`${headline} — open signup`}
          className="flex w-full flex-col items-center justify-center gap-2 md:flex-row md:gap-3 outline-none hover:opacity-95 cursor-pointer text-left bg-transparent border-0 p-0"
        >
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
        </button>
      </div>
    );
  }

  const resolvedHref = (explicit && safeHref(href) !== "#") ? safeHref(href) : "/contact";

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
