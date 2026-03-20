# SEO guide (Hook Point / Next.js)

This doc summarizes what’s in place and how to improve SEO further.

## Implemented

- **Root metadata** (`app/layout.tsx`): `metadataBase`, default title, description, `openGraph`, `twitter`, `robots: { index, follow }`. Title template: `%s | Hook Point`.
- **Product pages** (`app/products/[handle]/page.tsx`): `generateMetadata` with title, description (truncated to ~160 chars), and OG/Twitter image from Shopify `featuredImage`.
- **Sitemap** (`app/sitemap.ts`): `/sitemap.xml` includes homepage, `/shop`, `/contact`, `/story`, `/recipes`, `/basics`, and all product URLs from the Storefront API (paginated). Revalidates product list hourly.
- **Robots** (`app/robots.ts`): `User-agent: *` allow `/`, sitemap URL from `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`.
- **Per-page metadata** where applicable: `/contact`, `/shop`, `/story`, `/recipes`, `/basics`, `/basics/[slug]`, `/recipes/[slug]`, and Sanity-driven `/[slug]` use static or `generateMetadata`.

## Environment

- **Canonical base URL**: Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://hookv2.vercel.app`) so sitemap, robots, and OG URLs use the correct domain. If unset, the app falls back to `https://${VERCEL_URL}`.

## Optional improvements

1. **Canonical URLs**  
   Add `alternates.canonical` in metadata for key pages (e.g. product, shop) to the final URL (e.g. `https://yoursite.com/products/xyz`). Helps when the same content could be reached via query params or alternate paths.

2. **JSON-LD structured data**  
   - **Organization**: Add a script tag with `@type: Organization` (name, url, logo) in the root layout or a shared component.
   - **Product**: On product pages, add `Product` schema (name, description, image, offers with price and availability) so search engines can show rich results.

3. **Recipes / Basics in sitemap**  
   Optionally extend `app/sitemap.ts` to fetch recipe and basics slugs from Sanity and add `/recipes/[slug]` and `/basics/[slug]` entries.

4. **OG image for homepage**  
   If you have a default share image, set `openGraph.images` and `twitter.images` in the root layout so unfurling works when no page-specific image is set.

5. **Performance**  
   Core Web Vitals (LCP, INP, CLS) affect ranking. Use Next.js image optimization, avoid layout shift, and keep above-the-fold content fast.

6. **Headless Shopify**  
   Ensure the store’s “domains” in Shopify Admin point to this front end so search engines see one canonical storefront. No duplicate product pages on a separate Shopify theme URL.

## Verifying

- **Sitemap**: Open `https://yoursite.com/sitemap.xml`.
- **Robots**: Open `https://yoursite.com/robots.txt`.
- **Metadata**: View source on product and home pages; check `<title>`, `<meta name="description">`, and `og:` / `twitter:` tags.
- **Tools**: Google Search Console (submit sitemap), Rich Results Test, and social debuggers (Facebook, Twitter) for OG/Twitter.
