export const CHECKOUT_HOST = "hook-point-fisheries.myshopify.com";

/**
 * Forces ALL checkout URLs to use Shopify's domain.
 * Prevents redirect loops in headless setups.
 */
export function getCheckoutUrl(url: string | null | undefined): string {
  if (!url) return "";

  try {
    const u = new URL(url.trim());

    // 🔥 Always force Shopify domain (no conditions)
    u.hostname = CHECKOUT_HOST;
    u.protocol = "https:";

    return u.toString();
  } catch (e) {
    console.error("Invalid checkout URL:", url);
    return url || "";
  }
}
