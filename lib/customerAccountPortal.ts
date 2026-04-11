/** Shopify Customer Account portal (orders, profile — hosted by Shopify). */
export const CUSTOMER_ACCOUNT_PORTAL_URL = "https://account.hookpointfish.com";
export const CUSTOMER_ACCOUNT_LOGOUT_URL =
  "https://account.hookpointfish.com/authentication/logout";

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

function normalizeSiteUrl(input: string | undefined): string {
  const t = (input ?? "").trim().replace(/\/+$/, "");
  if (!t) return "https://www.hookpointfish.com";
  return t.startsWith("http") ? t : `https://${t}`;
}

/** Set `NEXT_PUBLIC_SITE_URL` to your live storefront origin. Register `{origin}/auth/post-logout` in Shopify Customer Account API logout URIs. */
export const HEADLESS_STOREFRONT_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
);
