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

- **Frozen products** – Use frozen processing/transit **ranges** (and weekdays); legacy single `estimatedDeliveryFrozenProcessingDays` only if the range field is empty.
- **Ambient products** – Use ambient processing/transit **ranges**; legacy `estimatedDeliveryProcessingDays` only if the range field is empty.

---

## 3. Sanity Site Settings

In Sanity site settings, under the shipping group:

### Ambient (non-frozen)

- **`estimatedDeliveryProcessingDaysRange`** (string, e.g. `"0-1"` or `"2-2"`) – shortest–longest **processing** day counts. If empty, **`estimatedDeliveryProcessingDays`** (legacy number) is used.
- **`estimatedDeliveryTransitDays`** (string, e.g. `"0-4"` or `"2-4"`) – shortest–longest **transit** day counts after processing.

### Frozen

- **`estimatedDeliveryFrozenProcessingDaysRange`** – shortest–longest processing for frozen; if empty, legacy **`estimatedDeliveryFrozenProcessingDays`**.
- **`estimatedDeliveryFrozenTransitDays`** – transit range for frozen.

### Shared

- **`estimatedDeliveryCutoffTime`** – 24h time (e.g. `"17:00"`) for countdown. Leave empty for end-of-day.

### Calendar rules (optional)

These mirror common Shopify “estimated delivery” apps: you choose **which weekdays count** for processing vs transit, and **blocked dates** (holidays) where neither phase advances.

- **`estimatedDeliveryBlockedDates`** – list of calendar dates (YYYY-MM-DD). On these days, neither processing nor transit days are counted.
- **`estimatedDeliveryProcessingWeekdaysAmbient`** / **`estimatedDeliveryProcessingWeekdaysFrozen`** – weekdays (0 = Sunday … 6 = Saturday) that count toward **processing** time. The app picks **branch-specific first** (frozen vs ambient from §2), then **falls back to the other branch** if that array is empty. If both are empty: **Mon–Fri** when the product is treated as ambient, **Mon–Tue** when treated as frozen (see `normalizeProcessingWeekdays`). The tracker **Processing** row shows **order date through the end of the longest processing** (aligned with Essential Estimated).
- **`estimatedDeliveryTransitWeekdaysAmbient`** / **`estimatedDeliveryTransitWeekdaysFrozen`** – transit weekdays; same **prefer branch, then other branch**; if both empty, Mon–Fri.

**Important:** Frozen vs ambient on the PDP follows §2 (tags/metafield/type). A product with the **`ambient` tag always uses ambient delivery settings** even if it is “frozen” colloquially—so the **Ambient** weekday rows are the ones that apply unless you remove that tag or align both Sanity rows.

Implementation: `lib/estimatedDeliveryCalendar.ts`, `lib/estimatedDeliveryTimeline.ts` (`computeEstimatedDeliveryTimeline`), `lib/parseSanityDayRange.ts`. UI: `app/components/EstimatedDeliveryDisplay.tsx`.

**Sanity Studio:** field **Estimated delivery preview (ambient & frozen)** runs the same math for both branches using today’s date.

Processing and transit strings: **`"min-max"`** or a **single number** (min = max). Space around `-` is optional.

---

## 4. Logic

1. If `custom.estimated_delivery` has non-empty text → show that text (no frozen/ambient distinction).
2. Else:
   - Detect frozen/ambient using tags, metafield, and product type (§2).
   - Parse **processing** shortest–longest and **transit** shortest–longest from Sanity (`parseProcessingDaysFromSanity`, `parseTransitDaysFromSanity`).
   - Build a calendar config: processing weekdays, transit weekdays, blocked dates (ambient vs frozen as above).
   - **Processing (ambient and frozen)** uses **calendar-consecutive** blocks: a run of N days must be N adjacent calendar days, each an allowed processing weekday (e.g. Mon–Fri for five straight business days, or Mon→Tue for frozen). If no run fits starting on the order day, the **next** valid block is used (`findEndOfFirstConsecutiveProcessingBlock`).
   - **Transit** still starts after the ship date when transit days ≥ 1 (unless transit min is 0).
   - **Earliest / latest ship** = end of the first valid consecutive block for the **minimum** / **maximum** processing day count.
   - **Transit** is counted from **the end of the longest processing** (`processingEndMax`), so **0 transit days** = arrival on the **same day** processing completes on that timeline (aligned with Essential Estimated).
   - **Delivery window:** `processingEndMax` + min transit … `processingEndMax` + max transit (transit weekdays + blocked dates).
   - Headline and **Delivered** row use that window; **Processing** row shows **purchase date → processingEndMax**.
3. Display countdown + tracker or message as configured.

If all weekday lists are empty, behavior matches the previous **Mon–Fri only** weekend skip. Blocked dates are skipped in both phases.
