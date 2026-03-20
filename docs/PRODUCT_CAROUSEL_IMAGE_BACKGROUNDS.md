# Product carousel: white “box” behind product photos

## Why `/shop` often looks different from the **homepage**

The shop page wraps the bottom “Catch of the Day” carousel with a **light gray** background on purpose:

- File: `app/shop/ShopPageClient.tsx`
- `ShopProductCarousel` is called with **`backgroundColorOverride="#F2F2F5"`**

That makes the carousel a **light section**. In `CatchOfTheDayProductCard`, a **light** section enables **CSS `background-blend-mode: multiply`** on product photos (when `blendWhiteWithSectionBackground` is on and the section is not “dark”). Multiply **pulls white studio backgrounds** in the JPEG toward the section color, so the white reads as “matching” the gray.

## Homepage (navy carousel)

The home page usually uses the **dark navy** from Sanity (`#171730` or similar) for the same block.

On **dark** sections we **turn off** multiply for the product image. If we didn’t, the **entire** photo would go nearly black. So the image is drawn with a normal `<img>` on top of the navy fill.

**Important:** If the **file from Shopify** is a normal photo with an **opaque white** background, that white is part of the **bitmap**. CSS cannot turn those pixels into “transparent” or navy without also destroying the product (the old multiply-on-navy problem).

So on navy:

- The **page background** and **card fill** can match (navy).
- The **white rectangle inside the photo** will still show **unless** the asset has:
  - a **transparent** background (PNG/WebP), or
  - you switch the carousel to a **light** section (like `/shop`) so multiply can soften the white again.

## Price chip (bottom-left)

The price overlay uses `--product-card-price-bg` set on the card root so it matches the section/card color (see `app/globals.css` `.product-card-price-overlay`).

## Summary

| Goal | Approach |
|------|----------|
| Match `/shop` look (softer white in photos) | Light carousel background (e.g. shop’s `#F2F2F5` override) + multiply on light sections |
| Navy section + no white halos in the bitmap | Use **transparent** product images in Shopify |
| Navy section + standard e‑com JPEGs | Some white in the photo will usually remain visible |
