/** Shopify Customer Account portal (orders, profile — hosted by Shopify). */
export const CUSTOMER_ACCOUNT_PORTAL_URL = "https://account.hookpointfish.com";
/** Default landing when linking to hosted portal (avoids extra SSO hops vs account root). */
export const CUSTOMER_ACCOUNT_ORDERS_URL = `${CUSTOMER_ACCOUNT_PORTAL_URL}/orders`;
export const CUSTOMER_ACCOUNT_LOGOUT_URL =
  "https://account.hookpointfish.com/authentication/logout";

function stripTrailingSlashes(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/** Header + fallback sign-in when Customer Account API env is not set. */
export function getCustomerAccountNavUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL?.trim();
  if (explicit) return explicit;
  const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  if (domain) return CUSTOMER_ACCOUNT_PORTAL_URL;
  return null;
}

/**
 * Same as {@link getCustomerAccountNavUrl} unless the URL is the bare portal root —
 * then returns {@link CUSTOMER_ACCOUNT_ORDERS_URL} so Account opens on Orders first.
 * Custom `NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL` values are unchanged.
 */
export function getCustomerAccountPortalEntryUrl(): string | null {
  const nav = getCustomerAccountNavUrl();
  if (!nav) return null;
  if (stripTrailingSlashes(nav) === stripTrailingSlashes(CUSTOMER_ACCOUNT_PORTAL_URL)) {
    return CUSTOMER_ACCOUNT_ORDERS_URL;
  }
  return nav;
}

function normalizeSiteUrl(input: string | undefined): string {
  const t = (input ?? "").trim().replace(/\/+$/, "");
  if (!t) return "https://www.hookpointfish.com";
  return t.startsWith("http") ? t : `https://${t}`;
}

/** Set `NEXT_PUBLIC_SITE_URL` to your live storefront origin. Register `{origin}/auth/post-logout` in Shopify Customer Account API logout URIs. */
export const HEADLESS_STOREFRONT_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
);
