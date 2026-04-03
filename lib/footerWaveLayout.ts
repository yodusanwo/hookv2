import { cache } from "react";
import { client, PAGE_LAYOUT_SETTINGS_QUERY } from "@/lib/sanity";

const SHOP_PAGE_STRIP_BG = "#F2F2F5";
const SHOP_PAGE_SEARCH_STRIP_BG = "#D4F2FF";
const PRODUCT_PAGE_STRIP_BG = "#D4F2FF";
const CART_PAGE_STRIP_BG = "#FFFFFF";

export type FooterWaveLayoutSettings = {
  color: string | null;
  hideHeaderWave: boolean;
};

/**
 * Footer strip color + header wave visibility for a pathname. Mirrors
 * `app/api/footer-wave-color/route.ts` so the root layout can SSR the same
 * values and avoid CLS when the client fetch used to flip `hideHeaderWave`.
 */
export const getFooterWaveLayoutSettings = cache(
  async function getFooterWaveLayoutSettings(
    pathname: string,
    hasShopSearch: boolean,
  ): Promise<FooterWaveLayoutSettings> {
    if (!client) {
      return { color: null, hideHeaderWave: false };
    }

    const slug =
      pathname.replace(/^\//, "").trim().split("?")[0] || "home";

    try {
      const data = await client.fetch<{
        color?: string | null;
        hideHeaderWave?: boolean;
      } | null>(PAGE_LAYOUT_SETTINGS_QUERY, { slug });

      const isShopRoute = slug === "shop" || slug.startsWith("shop/");
      const color =
        slug === "cart"
          ? CART_PAGE_STRIP_BG
          : isShopRoute
            ? hasShopSearch
              ? SHOP_PAGE_SEARCH_STRIP_BG
              : SHOP_PAGE_STRIP_BG
            : slug.startsWith("products/")
              ? PRODUCT_PAGE_STRIP_BG
              : (data?.color ?? null);

      /** Shop routes: keep wave margin stable (see API route comment). */
      const hideHeaderWave = isShopRoute
        ? false
        : data?.hideHeaderWave === true;

      return { color, hideHeaderWave };
    } catch {
      return { color: null, hideHeaderWave: false };
    }
  },
);
