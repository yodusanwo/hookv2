/** Shopify Customer Account portal (orders, profile — hosted by Shopify). */
export const CUSTOMER_ACCOUNT_PORTAL_URL = "https://account.hookpointfish.com";
export const CUSTOMER_ACCOUNT_LOGOUT_URL =
  "https://account.hookpointfish.com/authentication/logout";

function normalizeSiteUrl(input: string | undefined): string {
  const t = (input ?? "").trim().replace(/\/+$/, "");
  if (!t) return "https://www.hookpointfish.com";
  return t.startsWith("http") ? t : `https://${t}`;
}

/**
 * Canonical headless storefront origin (no trailing slash). Set
 * `NEXT_PUBLIC_SITE_URL` in production (e.g. `https://www.hookpointfish.com`).
 *
 * **Shopify Admin:** For the logo / “return to store” on account.hookpointfish.com,
 * point links at this URL, not `*.myshopify.com`. That UI is not built in this app.
 */
export const HEADLESS_STOREFRONT_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
);
