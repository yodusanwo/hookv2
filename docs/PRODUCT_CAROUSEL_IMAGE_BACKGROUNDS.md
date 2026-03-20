# Product carousel: white “box” behind product photos

## Why `/shop` often looks different from the **homepage**

The shop page wraps the bottom “Catch of the Day” carousel with a **light gray** background on purpose:

- File: `app/shop/ShopPageClient.tsx`
- `ShopProductCarousel` is called with **`backgroundColorOverride="#F2F2F5"`**

That makes the carousel a **light section**. In `CatchOfTheDayProductCard`, a **light** section enables **CSS `background-blend-mode: multiply`** on product photos (when `blendWhiteWithSectionBackground` is on and the section is not “dark”). Multiply **pulls white studio backgrounds** in the JPEG toward the section color, so the white reads as “matching” the gray.

## Homepage (navy carousel)

The home page usually uses the **dark navy** from Sanity (`#171730` or similar) for the same block.

We **do not** use multiply on **dark** sections: `background-blend-mode: multiply` with a navy base darkens **every** pixel in the product photo (not only the white studio backdrop), so the carousel would show nearly black images.

The **image well** uses **`effectiveBg`** so **transparent** PNG/WebP assets match the section. To soften white JPEG halos on navy you need **cut-out or transparent assets** in Shopify, or set this Sanity block to a **lighter** background so `darkSection` is false and multiply is safe (same idea as the `/shop` bottom carousel).

## Price chip (bottom-left)

The price overlay uses `--product-card-price-bg` set on the card root so it matches the section/card color (see `app/globals.css` `.product-card-price-overlay`).

## Summary

| Goal | Approach |
|------|----------|
| Match `/shop` look (softer white in photos) | Light carousel background (e.g. shop’s `#F2F2F5` override) + multiply on light sections |
| Navy section + transparent assets | Well background matches section (`effectiveBg`) |
| Navy section + white JPEG halos | Retouch assets, or use the light carousel on `/shop` where multiply applies |
