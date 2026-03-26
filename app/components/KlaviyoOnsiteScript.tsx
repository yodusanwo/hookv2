import Script from "next/script";

/**
 * Loads Klaviyo onsite JavaScript (forms, tracking). Public company ID from
 * Klaviyo → Settings → Account → API keys (6-character public key) or the embed snippet.
 *
 * **Vercel:** Set `NEXT_PUBLIC_KLAVIYO_COMPANY_ID` (and banner form:
 * `NEXT_PUBLIC_KLAVIYO_COUPON_FORM_ID`) in Project → Environment Variables for
 * Production (and Preview if needed), then redeploy — `NEXT_PUBLIC_*` is baked in at build time.
 *
 * **Klaviyo:** For the coupon form, use “Show on custom trigger”, add your production
 * domain under form targeting, and if you use a public API key domain allowlist, add
 * `yourdomain.com` and `*.yourdomain.com` per Klaviyo’s API key settings.
 */
export function KlaviyoOnsiteScript() {
  const id = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID?.trim();
  if (!id) return null;
  return (
    <Script
      src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${encodeURIComponent(id)}`}
      strategy="afterInteractive"
    />
  );
}
