import type { ApiProductForCarousel } from "@/lib/types";

/**
 * For shop/carousel rows keyed by variant, use the variant’s image when Shopify has one;
 * otherwise keep the product’s featured/gallery image.
 */
export function mergeCarouselImagesWithVariant(
  productImages: ApiProductForCarousel["images"],
  variantImage: { url: string; altText: string | null } | null | undefined,
): ApiProductForCarousel["images"] {
  if (variantImage?.url?.trim()) {
    return {
      edges: [
        {
          node: {
            url: variantImage.url,
            altText: variantImage.altText ?? null,
          },
        },
      ],
    };
  }
  return productImages;
}