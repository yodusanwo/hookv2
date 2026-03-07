# Estimated Delivery on Product Page

Estimated delivery is shown below the free shipping message on product pages. Two mechanisms are supported:

1. **Metafield (static)** – optional per-product text from Shopify
2. **Dynamic calculation** – date range derived from Sanity site settings (processing + transit days)

When the metafield is set, it takes precedence. Otherwise the dynamic calculation is displayed.

Separate logic applies for **frozen** vs **ambient** products: frozen products use different processing and transit day settings.

---

## 1. Shopify Metafield Setup

### estimated_delivery (static override)

- **Namespace:** `custom`
- **Key:** `estimated_delivery`
- **Type:** Single line text
- **Purpose:** Static text per product (e.g. "3–5 business days", "Ships Mar 10–12"). When present, this overrides the dynamic calculation.

### is_frozen (frozen product detection)

- **Namespace:** `custom`
- **Key:** `is_frozen`
- **Type:** Boolean
- **Purpose:** When `true`, the product uses frozen delivery logic (different processing/transit days). If not set, the app also checks if `productType` contains "frozen" (case-insensitive).

**Setup in Shopify Admin**

1. Go to **Settings** → **Custom data** → **Products**
2. Add definition(s): `estimated_delivery` (single line text), `is_frozen` (boolean)
3. Enable **Storefront API access** for both

Reference: [Shopify metafields](https://help.shopify.com/en/manual/custom-data/metafields)

---

## 2. Frozen vs Ambient Logic

- **Frozen products** – Detected when `custom.is_frozen` is `true` or `productType` contains "frozen" (case-insensitive). Uses `estimatedDeliveryFrozenProcessingDays` and `estimatedDeliveryFrozenTransitDays`.
- **Ambient products** – All other products. Uses `estimatedDeliveryProcessingDays` and `estimatedDeliveryTransitDays`.

---

## 3. Sanity Site Settings

In Sanity site settings, under the shipping group:

### Ambient (non-frozen)

- **`estimatedDeliveryProcessingDays`** (number, default 2) – days from order to ship
- **`estimatedDeliveryTransitDays`** (string, default `"2-4"`) – min–max transit days

### Frozen

- **`estimatedDeliveryFrozenProcessingDays`** (number, default 1) – days from order to ship for frozen products
- **`estimatedDeliveryFrozenTransitDays`** (string, default `"1-2"`) – min–max transit days for frozen products

### Shared

- **`estimatedDeliveryCutoffTime`** – 24h time (e.g. `"17:00"`) for countdown. Leave empty for end-of-day.

The transit format is `"min-max"` (space around `-` is optional).

---

## 4. Logic

1. If `custom.estimated_delivery` has non-empty text → show that text (no frozen/ambient distinction).
2. Else:
   - Detect frozen: `custom.is_frozen === true` or `productType` includes "frozen"
   - Use frozen or ambient processing/transit days from Sanity
   - Compute: `earliestDate = today + processingDays + transitDaysMin`, `latestDate = today + processingDays + transitDaysMax` (business days)
3. Display countdown + tracker or message as configured.

Business days skip weekends. Holiday exclusions are not implemented.
