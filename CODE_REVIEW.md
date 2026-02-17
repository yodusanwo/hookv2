# Code Review – Hook Point Shopify Store

**Date:** January 2026  
**Scope:** Bugs, race conditions, security, and performance

---

## Critical – Security

### 1. Hardcoded secrets in `get-token.js`

**File:** [get-token.js](get-token.js)

**Issue:** Lines 3–5 contain hardcoded `ADMIN_API_KEY` and `ADMIN_API_SECRET`.

**Risk:** If this file is ever committed (e.g. before it was added to `.gitignore`), these secrets may exist in git history and could be exposed.

**Recommendation:**
- Move credentials into environment variables and load them via `process.env`.
- If the file is not needed, consider removing it.
- If it was ever committed, rotate the exposed credentials in Shopify and use `git filter-branch` or BFG to remove them from history.

---

### 2. Unvalidated URLs from Sanity (potential XSS / open redirect)

**Files:**
- [components/sections/FaqSection.tsx](components/sections/FaqSection.tsx) – `showMoreUrl`
- [components/sections/OurStorySection.tsx](components/sections/OurStorySection.tsx) – `ctaHref`
- [components/sections/ExploreProductsGrid.tsx](components/sections/ExploreProductsGrid.tsx) – `cta.href`
- [components/sections/RecipesSection.tsx](components/sections/RecipesSection.tsx) – `href`, `showMoreUrl`
- [components/sections/LocalFoodsCoopsSection.tsx](components/sections/LocalFoodsCoopsSection.tsx) – `lb.url`
- [components/sections/DocksideMarketsSection.tsx](components/sections/DocksideMarketsSection.tsx) – `item.url`
- [app/components/Header.tsx](app/components/Header.tsx) – nav `href` from Sanity

**Issue:** URLs from Sanity are used in `href` without validation. A malicious or misconfigured entry (e.g. `javascript:...`, `data:...`, or an open-redirect URL) could lead to XSS or open redirects.

**Recommendation:** Add a URL validation helper and use it wherever Sanity URLs are used:

```typescript
function isValidHref(href: string): boolean {
  if (!href || typeof href !== "string") return false;
  const trimmed = href.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
```

---

## High – Bugs

### 3. Products API: `first` can be `NaN`

**File:** [app/api/products/route.ts](app/api/products/route.ts), line 34

**Issue:**
```typescript
const first = Math.min(24, Math.max(1, parseInt(searchParams.get("first") ?? "9", 10)));
```
If the query string has `first=abc`, `parseInt` returns `NaN`, and `Math.max(1, NaN)` / `Math.min(24, NaN)` also return `NaN`. The GraphQL variable can then be invalid.

**Recommendation:**
```typescript
const parsed = parseInt(searchParams.get("first") ?? "9", 10);
const first = Number.isNaN(parsed) ? 9 : Math.min(24, Math.max(1, parsed));
```

---

### 4. Cart API: no upper bound on quantity

**File:** [app/api/cart/lines/route.ts](app/api/cart/lines/route.ts)

**Issue:** `quantity` is only checked with `Number.isFinite`. A client can send very large values (e.g. `999999`) and create unrealistic or abusive cart states.

**Recommendation:** Enforce a maximum (e.g. 10) and ensure it is a positive integer:

```typescript
const quantity = Math.min(10, Math.max(1, Math.floor(Number(body.quantity) || 1)));
```

---

### 5. Cart API: no format validation for IDs

**File:** [app/api/cart/lines/route.ts](app/api/cart/lines/route.ts)

**Issue:** `cartId` and `merchandiseId` are passed to Shopify without validation of format or length. Malformed values can cause unnecessary Shopify API errors and may leak internal error details.

**Recommendation:** Validate that IDs match expected Shopify formats (e.g. GID-like strings) before sending them to the API.

---

## Medium – Race conditions and data consistency

### 6. ExploreProductsGrid – resolved

**File:** [components/sections/ExploreProductsGrid.tsx](components/sections/ExploreProductsGrid.tsx)

**Status:** Previously vulnerable to filter-switch races. Current implementation uses `AbortController` to cancel in-flight fetches and correctly ignores aborted responses when updating state. No change needed.

---

### 7. ExploreFilters – resolved

**File:** [components/sections/ExploreFilters.tsx](components/sections/ExploreFilters.tsx)

**Status:** `active` state is now kept in sync with `activeIndex` via `useEffect`. No change needed.

---

## Medium – Performance

### 8. Hero carousel interval not cleaned on unmount

**File:** [app/components/HeroCarousel.tsx](app/components/HeroCarousel.tsx)

**Issue:** `setInterval` is cleared in the effect cleanup, but the dependency array may cause subtle re-runs. The current logic looks correct; worth a quick visual pass to ensure no extra intervals persist on rapid navigation.

---

### 9. DealProductCard – no request cancellation on unmount

**File:** [app/components/DealProductCard.tsx](app/components/DealProductCard.tsx)

**Issue:** Add-to-cart requests are not aborted when the user navigates away or the component unmounts. State updates may run after unmount, though React 18+ generally tolerates this.

**Recommendation:** Use `AbortController` for the fetch and abort in a cleanup, similar to `ExploreProductsGrid`, if the component can unmount during the request.

---

### 10. AddToCart – no quantity cap on client

**File:** [app/components/AddToCart.tsx](app/components/AddToCart.tsx)

**Issue:** User can set quantity via input without an enforced maximum. Combined with the server fix in #4, adding a client-side cap (e.g. `min={1} max={10}`) improves UX and consistency.

---

## Low – Code quality and robustness

### 11. Product page: no error boundary

**File:** [app/products/[handle]/page.tsx](app/products/[handle]/page.tsx)

**Issue:** If `shopifyFetch` throws (network, Shopify outage), the page can fail with an unhandled error and no user-friendly fallback.

**Recommendation:** Wrap the fetch in try/catch and render an error UI, or add an error boundary for the route.

---

### 12. normalizeHeadline – custom headlines discarded

**File:** [components/sections/HeroSection.tsx](components/sections/HeroSection.tsx)

**Issue:** `normalizeHeadline` returns a fallback whenever the headline does not include `"Alaska"`. Any other brand or campaign headline would be replaced.

**Recommendation:** Only apply the two-line normalization when the content matches known patterns; otherwise preserve the original string and render it as a single line.

---

### 13. Collection handle: possible injection

**File:** [app/api/collections/[handle]/products/route.ts](app/api/collections/[handle]/products/route.ts)

**Issue:** `handle` from the URL is trimmed and passed to Shopify. GraphQL variables are parameterized, so injection risk is low, but very long or odd strings could still cause odd behavior.

**Recommendation:** Restrict to alphanumeric characters and hyphens (e.g. `/^[a-zA-Z0-9-]+$/`) and return 400 for invalid handles.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2     |
| High     | 3     |
| Medium   | 5     |
| Low      | 3     |

**Suggested order of work:**
1. Remove or secure `get-token.js` (rotate keys if they were ever committed).
2. Add URL validation for all Sanity-sourced links.
3. Fix `first` and `quantity` validation in the products and cart APIs.
4. Add collection handle validation and client/server quantity limits.
