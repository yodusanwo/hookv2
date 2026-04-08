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

### is_frozen (frozen product detection, optional)

- **Namespace:** `custom`
- **Key:** `is_frozen`
- **Type:** Boolean
- **Purpose:** When `true`, the product uses frozen delivery logic. If unset, the app uses **product tags** and **product type** (see §2).

**Setup in Shopify Admin**

1. Go to **Settings** → **Custom data** → **Products**
2. Add definition(s): `estimated_delivery` (single line text), `is_frozen` (boolean)
3. Enable **Storefront API access** for both

Reference: [Shopify metafields](https://help.shopify.com/en/manual/custom-data/metafields)

---

## 2. Frozen vs Ambient Logic

Detection uses this **order** (see `productIsFrozenForEstimatedDelivery` in `lib/productFrozenForEstimatedDelivery.ts`):

1. **Tag `ambient`** (case-insensitive) → **ambient** — always uses non-frozen settings, even if other signals conflict.
2. **`custom.is_frozen` metafield** `"true"` → **frozen**.
3. **Tags `frozen` or `frozenseafood`** (case-insensitive) → **frozen**.
4. **`productType` contains `"frozen"`** (case-insensitive substring) → **frozen**.
5. Otherwise → **ambient**.

- **Frozen products** – Use `estimatedDeliveryFrozenProcessingDays` and `estimatedDeliveryFrozenTransitDays`.
- **Ambient products** – Use `estimatedDeliveryProcessingDays` and `estimatedDeliveryTransitDays`.

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

### Calendar rules (optional)

These mirror common Shopify “estimated delivery” apps: you choose **which weekdays count** for processing vs transit, and **blocked dates** (holidays) where neither phase advances.

- **`estimatedDeliveryBlockedDates`** – list of calendar dates (YYYY-MM-DD). On these days, neither processing nor transit days are counted.
- **`estimatedDeliveryProcessingWeekdaysAmbient`** / **`estimatedDeliveryProcessingWeekdaysFrozen`** – weekdays (0 = Sunday … 6 = Saturday) that count toward **processing** time. **Empty** means Mon–Fri (`1`–`5`).
- **`estimatedDeliveryTransitWeekdaysAmbient`** / **`estimatedDeliveryTransitWeekdaysFrozen`** – weekdays that count toward **in-transit** time (after processing). **Empty** means Mon–Fri.

Implementation: `lib/estimatedDeliveryCalendar.ts` (`addCountedDays`, `buildDeliveryCalendarConfig`). UI: `app/components/EstimatedDeliveryDisplay.tsx`.

The transit format is `"min-max"` (space around `-` is optional).

---

## 4. Logic

1. If `custom.estimated_delivery` has non-empty text → show that text (no frozen/ambient distinction).
2. Else:
   - Detect frozen/ambient using tags, metafield, and product type (§2).
   - Use frozen or ambient processing/transit **day counts** and transit min–max from Sanity.
   - Build a calendar config: processing weekdays, transit weekdays, blocked dates (ambient vs frozen as above).
   - **Processing end:** start from **today** (local midnight), advance day by day; each day that is a **processing weekday** and **not blocked** counts once, until `processingDays` counts are used.
   - **Delivery window:** from **processing end**, advance similarly using **transit weekdays** and the same blocked dates until `transitDaysMin` / `transitDaysMax` counts are used for the start and end of the delivery range.
3. Display countdown + tracker or message as configured.

If all weekday lists are empty, behavior matches the previous **Mon–Fri only** weekend skip. Blocked dates are skipped in both phases.
