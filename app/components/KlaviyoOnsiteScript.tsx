import Script from "next/script";

/**
 * Loads Klaviyo onsite JavaScript (forms, tracking). Public company ID from
 * Klaviyo → Settings → Account → API keys (6-character public key) or the embed snippet.
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
