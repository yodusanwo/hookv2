/**
 * Open a Klaviyo popup/flyout by form ID (from the form editor URL, e.g. …/forms/VqBfhi).
 * Requires {@link https://developers.klaviyo.com/en/docs/installing-onsite-js Klaviyo.js} on the page
 * and the form set to display on a custom trigger in Klaviyo.
 */
export function openKlaviyoForm(formId: string): void {
  if (typeof window === "undefined" || !formId.trim()) return;
  const w = window as Window & { _klOnsite?: unknown[] };
  const q = w._klOnsite ?? [];
  w._klOnsite = q;
  q.push(["openForm", formId.trim()]);
}

export type KlaviyoPromoParse =
  | { mode: "klaviyo"; formId: string | null }
  | { mode: "link" };

/**
 * Sanity promo URL: `klaviyo` or `klaviyo:FormId` (ID from Klaviyo form editor URL).
 */
export function parseKlaviyoPromoUrl(href: string | null | undefined): KlaviyoPromoParse {
  const t = href?.trim();
  if (!t) return { mode: "link" };
  const lower = t.toLowerCase();
  const envFormId =
    typeof process.env.NEXT_PUBLIC_KLAVIYO_COUPON_FORM_ID === "string"
      ? process.env.NEXT_PUBLIC_KLAVIYO_COUPON_FORM_ID.trim()
      : null;
  if (lower === "klaviyo") {
    return { mode: "klaviyo", formId: envFormId };
  }
  if (lower.startsWith("klaviyo:")) {
    const id = t.slice(t.indexOf(":") + 1).trim();
    return { mode: "klaviyo", formId: id || envFormId };
  }
  return { mode: "link" };
}
