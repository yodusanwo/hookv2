export const CHECKOUT_HOST = "hook-point-fisheries.myshopify.com";

/**
 * Normalizes checkout URLs: forces the canonical Shopify host and https. Pathname,
 * search (query), and hash are left as returned by Shopify.
 */
export function getCheckoutUrl(url: string | null | undefined): string {
  if (!url) return "";

  try {
    const u = new URL(url.trim());

    u.hostname = CHECKOUT_HOST;
    u.protocol = "https:";

    return u.toString();
  } catch (e) {
    console.error("Invalid checkout URL:", url);
    return url || "";
  }
}
