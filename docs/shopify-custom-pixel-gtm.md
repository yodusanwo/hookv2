# Shopify checkout: GTM custom pixel (manual setup)

The headless storefront loads **Web GTM** via `NEXT_PUBLIC_GTM_ID` in this repo. **Shopify Checkout** runs on Shopify’s domain, so you also add a **Custom pixel** in Shopify admin so checkout events reach the same GTM / GA4.

**Web container ID (Hook Point):** `GTM-M8T55SL5`

## Steps

1. In **Shopify admin**: **Settings → Customer events → Custom pixels → Add custom pixel**.
2. Follow [Shopify: Create a Google Tag Manager custom pixel](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/gtm-tutorial):
   - In GTM **Admin → Install Google Tag Manager**, copy the **head** snippet’s inner JavaScript (no `<script>` tags).
   - Paste into the custom pixel, then add `analytics.subscribe(...)` handlers that `window.dataLayer.push(...)` for events you need (e.g. `checkout_completed`, `payment_info_submitted`).
3. Use the **same container ID** as the storefront (`GTM-M8T55SL5`) unless you intentionally use a checkout-only container.
4. Test with [Shopify Pixel Helper](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/testing#shopify-pixel-helper) and GTM Preview on a **test checkout**.
5. Configure **GA4 cross-domain / linker** as needed so storefront and `checkout.shopify.com` stitch sessions (see GA4 and Shopify docs).

This file is not executed by the app; it documents admin-only configuration.
