export const CHECKOUT_HOST = "hook-point-fisheries.myshopify.com";

const CART_C_PREFIX = "/cart/c/";

/**
 * Normalizes checkout URLs: canonical Shopify host, https, and when the path is
 * `/cart/c/{id}` (from Shopify at runtime), rewrites to `/checkouts/c/{id}`. Query string
 * is preserved via the URL object.
 */
export function getCheckoutUrl(url: string | null | undefined): string {
  if (!url) return "";

  try {
    const u = new URL(url.trim());

    u.hostname = CHECKOUT_HOST;
    u.protocol = "https:";

    const pathname = u.pathname;
    if (pathname.startsWith(CART_C_PREFIX)) {
      const id = pathname.slice(CART_C_PREFIX.length);
      u.pathname = `/checkouts/c/${id}`;
    }

    return u.toString();
  } catch (e) {
    console.error("Invalid checkout URL:", url);
    return url || "";
  }
}
