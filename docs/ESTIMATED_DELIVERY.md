# Estimated Delivery on Product Page

Estimated delivery is shown below the free shipping message on product pages. Two mechanisms are supported:

1. **Metafield (static)** – optional per-product text from Shopify
2. **Dynamic calculation** – date range derived from Sanity site settings (processing + transit days)

When the metafield is set, it takes precedence. Otherwise the dynamic calculation is displayed.

---

## 1. Shopify Metafield Setup

- **Namespace:** `custom`
- **Key:** `estimated_delivery`
- **Type:** Single line text
- **Purpose:** Static text per product (e.g. "3–5 business days", "Ships Mar 10–12"). When present, this overrides the dynamic calculation.

**Setup in Shopify Admin**

1. Go to **Settings** → **Custom data** → **Products**
2. Add definition
3. Namespace: `custom`, key: `estimated_delivery`
4. Type: Single line text
5. Enable **Storefront API access**

Reference: [Shopify metafields](https://help.shopify.com/en/manual/custom-data/metafields)

---

## 2. Sanity Site Settings

In Sanity site settings, under the shipping group:

- **`estimatedDeliveryProcessingDays`** (number, default 2) – days from order to ship
- **`estimatedDeliveryTransitDays`** (string, default `"2-4"`) – min–max transit days, e.g. `"2-4"` or `"3-5"`

The transit format is `"min-max"` (space around `-` is optional). If missing or invalid, fallback is `2` and `4`.

---

## 3. Logic

1. If `custom.estimated_delivery` has non-empty text → show that text.
2. Else compute:
   - `earliestDate = today + processingDays + transitDaysMin` (business days)
   - `latestDate = today + processingDays + transitDaysMax` (business days)
3. Display e.g. "Order today, receive Mar 10–Mar 12".

Business days skip weekends. Holiday exclusions are not implemented.
