# Code Review – Hook Point Shopify Store

**Original review:** January 2026  
**Last synced to repo:** March 2026  
**Scope:** Bugs, race conditions, security, and performance

Use this file as a **checklist**. Re-run the “How to verify” steps after major changes.

---

## Status overview (March 2026)

Many January items are **implemented** in the current tree. What remains is mostly **audits** (URL usage), **hardening** (PDP errors), and **optional** polish (AbortController on deal card).

| Area                         | Status |
|-----------------------------|--------|
| Products API `first` / NaN  | **Resolved** — see §3 |
| Cart quantity + GID format  | **Resolved** — see §4–5 |
| Collection handle validation| **Resolved** — see §13 |
| Hero `normalizeHeadline`    | **Resolved** — see §12 |
| URL helper in codebase      | **Exists** — `lib/urlValidation.ts`; **audit** call sites — see §2 |
| `get-token.js`              | **Not in repo** — see §1 |
| PDP error handling          | **Resolved** — try/catch + friendly UI — see §11 |
| DealProductCard fetch cancel| **Open** — see §9 |

---

## Critical – Security

### 1. `get-token.js` (hardcoded secrets)

**File:** [get-token.js](get-token.js) (referenced in original review)

**March 2026:** This file is **not present** in the repository. Treat as either removed or never added here.

**If it ever existed in git:** Rotate Shopify Admin API credentials and consider history scrubbing (`git filter-repo` / BFG). Any new local scripts should use `process.env` only and stay out of version control (e.g. `.gitignore`).

---

### 2. Unvalidated URLs from Sanity (XSS / open redirect)

**Context:** [`lib/urlValidation.ts`](lib/urlValidation.ts) defines `isValidHref` and `safeHref` (same rules as the original snippet in this doc). Several sections already use `safeHref`.

**Remaining risk:** Any `href` built from CMS without `safeHref` is still vulnerable. Examples to audit (non-exhaustive):

- [`components/sections/RecipesSection.tsx`](components/sections/RecipesSection.tsx) — recipe card `href` (verify sanitization path).
- [`components/sections/ExploreProductsCategoryCarousel.tsx`](components/sections/ExploreProductsCategoryCarousel.tsx) / [`ExploreProductsCarousel.tsx`](components/sections/ExploreProductsCarousel.tsx) — `cat.href`.
- [`components/sections/OurStorySection.tsx`](components/sections/OurStorySection.tsx) / extended story blocks — `ctaHref` (confirm it always passes through validation).
- [`components/sections/TheBasicsSection.tsx`](components/sections/TheBasicsSection.tsx) — `href`.
- [`app/components/Header.tsx`](app/components/Header.tsx) — nav links (uses `safeHref` in places; re-check on change).

**How to verify:** `rg 'href=\{' components/sections app/components` and ensure CMS-driven values use `safeHref` or equivalent.

---

## High – Bugs

### 3. Products API: `first` can be `NaN` — **resolved**

**File:** [`app/api/products/route.ts`](app/api/products/route.ts)

**Current behavior:** `parseInt` result is guarded with `Number.isNaN(parsed) ? 9 : …` before `Math.min` / `Math.max`.

---

### 4. Cart API: quantity upper bound — **resolved** (cap 50)

**File:** [`app/api/cart/lines/route.ts`](app/api/cart/lines/route.ts)

**Current behavior:** `POST` and `PATCH` clamp quantity with `Math.min(50, Math.max(1, …))`.

**Note:** Original review suggested `10`; product UI uses **`max={50}`** in [`AddToCart.tsx`](app/components/AddToCart.tsx). Keep server and client caps aligned if you change business rules.

---

### 5. Cart API: ID format validation — **resolved**

**File:** [`app/api/cart/lines/route.ts`](app/api/cart/lines/route.ts)

**Current behavior:** `isValidShopifyGid` + normalization before Storefront API calls.

---

## Medium – Race conditions and data consistency

### 6. ExploreProductsGrid — **resolved**

AbortController cancels stale filter requests; safe to leave as-is unless the fetch contract changes.

### 7. ExploreFilters — **resolved**

`active` synced with `activeIndex` via `useEffect`.

### 8. Hero carousel interval

**File:** [`app/components/HeroCarousel.tsx`](app/components/HeroCarousel.tsx)

Effect cleanup clears the interval; optional **manual** check after rapid route changes (home ↔ story).

### 9. DealProductCard – request cancellation on unmount

**File:** [`app/components/DealProductCard.tsx`](app/components/DealProductCard.tsx)

Add-to-cart fetch may complete after unmount. **Low priority** with React 18; consider `AbortController` if you see console warnings or flaky UI.

### 10. AddToCart – client quantity cap — **aligned with API**

**File:** [`app/components/AddToCart.tsx`](app/components/AddToCart.tsx)

Inputs use `min={1}` and `max={50}` to match the cart API.

---

## Low – Code quality and robustness

### 11. Product page: error handling — **resolved**

**File:** [`app/products/[handle]/page.tsx`](app/products/[handle]/page.tsx)

The main product fetch is wrapped in `try/catch`; failures render “Something went wrong” with copy to retry later. **`generateMetadata`** also catches errors and falls back to a generic title. Optional: add [`error.tsx`](app/products/[handle]/error.tsx) for unexpected errors outside that block.

### 12. `normalizeHeadline` discarding custom copy — **resolved**

**File:** [`components/sections/HeroSection.tsx`](components/sections/HeroSection.tsx)

Headlines **without** “Alaska” are kept as `{ line1: trimmed, line2: "" }`; fallback copy is only used when the field is empty/invalid.

### 13. Collection handle validation — **resolved**

**File:** [`app/api/collections/[handle]/products/route.ts`](app/api/collections/[handle]/products/route.ts)

Invalid handles return `400` with `/^[a-zA-Z0-9-]+$/`.

---

## Summary (March 2026)

| Severity | Open | Resolved / note |
|----------|------|------------------|
| Critical | 0* | §1 file absent; §2 audit remaining `href` |
| High     | 0    | §3–5 fixed in code |
| Medium   | 1–2  | §9 optional; §8 spot-check |
| Low      | 0–1  | Optional `error.tsx` on PDP |

\*Treat §2 as ongoing hygiene whenever new CMS-driven links ship.

**Suggested order of work (updated):**

1. Grep audit: all Sanity-sourced `href` values → `safeHref` (or document why not).
2. (Optional) PDP `error.tsx` for uncaught errors in the segment.
3. (Optional) AbortController on `DealProductCard` add-to-cart.
4. If `get-token.js` ever lived in git, rotate keys and clean history.

---

## Full repository review (March 27, 2026)

Holistic pass over **~200 TS/TSX files**, `app/api/*`, `lib/*`, `next.config.js`, and key CMS sections. Complements the checklist above.

### Architecture (healthy)

- **Next.js App Router** with server components for pages; **Sanity** for content; **Shopify Storefront API** via [`lib/shopify.ts`](lib/shopify.ts) (`import "server-only"` — tokens stay server-side).
- **No `middleware.ts`** — auth/rate limits are not centralized (see gaps).
- **API surface:** cart (create/get/lines/discount/note/count), products, collections, search, recommendations, contact (Resend), events (sheet), reviews (Klaviyo), revalidate (secret), checkout buy-now, footer-wave-color, shipping-settings.

### Security — strengths

- **Revalidate** requires a **strong** `SANITY_REVALIDATE_SECRET` (≥32 chars), timing-safe compare, query or `Authorization: Bearer`, structured logs ([`app/api/revalidate/route.ts`](app/api/revalidate/route.ts), [`lib/sanityRevalidateAuth.ts`](lib/sanityRevalidateAuth.ts)).
- **Contact** uses honeypot + `escapeHtml` for email bodies ([`app/api/contact/route.ts`](app/api/contact/route.ts)).
- **Cart / buy-now / discount:** GID normalization + `isValidShopifyGid` before Shopify calls.
- **Collection products** and **products** list: bounded `first` / handle validation where implemented.
- **CSP + security headers** in production ([`next.config.js`](next.config.js)).

### Security / abuse — gaps & notes

| Topic | Note |
|-------|------|
| **CSP** | Production: main app has **no** `'unsafe-eval'` (only `/studio` does, for embedded Sanity Studio). `'unsafe-inline'` remains on `script-src` for GTM’s inline bootstrap ([`GoogleTagManager.tsx`](app/components/GoogleTagManager.tsx)); removing it needs nonces or a non-inline load. Snyk may still flag `unsafe-inline`. |
| **CMS → CSS injection** | **Mitigated (Mar 2026):** [`sanitizeCssCustomPropertyValue`](lib/sanitizeCssCustomPropertyValue.ts) wraps Dockside `--dockside-pt` / `--dockside-pb` values before `<style>` injection. |
| **HTML from Shopify** | PDP `descriptionHtml` / rich text uses `dangerouslySetInnerHTML` — **trusted** Shopify content; lower risk than CMS user HTML. |
| **Public `/api/events`** | Returns sheet events to any caller — fine for public schedules; revisit if the sheet ever holds non-public data. |
| **Rate limiting** | **Public API routes:** best-effort per-route in-memory limits (per IP) in [`lib/apiRateLimit.ts`](lib/apiRateLimit.ts). **Secret-gated** [`/api/revalidate`](app/api/revalidate/route.ts) is not limited here. For strict multi-instance limits, add Vercel Firewall / Redis (e.g. Upstash). |
| **`/api/recommendations`** | **Mitigated:** handle validated with `/^[a-zA-Z0-9-]+$/` before Shopify (aligned with collections API). |

### URL hygiene (Sanity)

- [`RecipesSection`](components/sections/RecipesSection.tsx) builds `href` with **`safeHref`** — good.
- [`ExploreProductsCategoryCarousel`](components/sections/ExploreProductsCategoryCarousel.tsx) uses **`safeHref(cat.href)`** with `/shop` fallback; parents still build `/shop/...` from handles — **safe path**. Re-audit if new call sites pass raw CMS URLs.
- Keep running: `rg 'href=\{' components app` when adding sections.

### Reliability & UX

- **PDP:** try/catch + “not found” vs “something went wrong” — good.
- **No automated test script** in `package.json` — consider smoke tests for `urlValidation`, cart validation, or critical API handlers when the team has bandwidth.

### Performance (spot check)

- **ISR / revalidate** used on many fetches (`revalidate: 60`) — sensible for catalog content.
- **`/api/events`** is `force-dynamic` — appropriate for live sheet data.

### Suggested follow-ups (prioritized)

1. ~~**Dockside** `<style>`~~ — **Done (Mar 2026):** [`lib/sanitizeCssCustomPropertyValue.ts`](lib/sanitizeCssCustomPropertyValue.ts) + Dockside section.
2. ~~**API rate limits**~~ — **Done (Mar 2026):** [`lib/apiRateLimit.ts`](lib/apiRateLimit.ts) on public `app/api` handlers (best-effort in-memory per instance; add Vercel Firewall / Redis for strict multi-instance limits).
3. ~~**Recommendations** `productHandle`~~ — **Done:** `/^[a-zA-Z0-9-]+$/` in [`app/api/recommendations/route.ts`](app/api/recommendations/route.ts).
4. ~~**PDP `error.tsx`**~~ — **Done:** [`app/products/[handle]/error.tsx`](app/products/[handle]/error.tsx).
5. **Category carousels** — **Done:** `safeHref` on [`ExploreProductsCategoryCarousel`](components/sections/ExploreProductsCategoryCarousel.tsx) / [`ExploreProductsCarousel`](components/sections/ExploreProductsCarousel.tsx).
6. **DealProductCard** — Already used `AbortController` + unmount abort; no change.
7. **Stricter limits** — Vercel WAF / Upstash for production-grade rate limits and `/api/search` abuse.

---

## Maintaining this document

- Bump **Last synced to repo** when you verify items against `main`.
- Prefer **file links** over fragile line numbers.
- Move fixed items to a short “Resolved” subsection or delete them to reduce noise; keep a one-line changelog if the team wants history.
