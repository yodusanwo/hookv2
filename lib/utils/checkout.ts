export const CHECKOUT_HOST = "hook-point-fisheries.myshopify.com";

const SHOPIFY_ORIGIN = `https://${CHECKOUT_HOST}`;

/** When Storefront API returns no usable URL, send buyers to the hosted cart. */
export const SHOPIFY_CART_FALLBACK_URL = `${SHOPIFY_ORIGIN}/cart`;

/**
 * Resolves Storefront `Cart.checkoutUrl` (or similar) to a full URL on the
 * canonical Shopify host. Handles absolute URLs and root-relative paths
 * (`/cart/c/...`, `/checkout`, …) so we never leave a bare `/checkout` that
 * would hit a non-existent Next.js route.
 */
export function getCheckoutUrl(url: string | null | undefined): string {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) return SHOPIFY_CART_FALLBACK_URL;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed);
      u.hostname = CHECKOUT_HOST;
      u.protocol = "https:";
      return u.toString();
    }
    if (trimmed.startsWith("/")) {
      return new URL(trimmed, `${SHOPIFY_ORIGIN}/`).toString();
    }
  } catch (e) {
    console.error("Invalid checkout URL:", url, e);
  }
  return SHOPIFY_CART_FALLBACK_URL;
}
