import type { SanityClient } from "next-sanity";
import {
  HOMEPAGE_RECIPES_BLOCK_QUERY,
  RECIPES_BY_PRODUCT_HANDLE_QUERY,
} from "@/lib/sanity";
import { recipeSlugFromSanityUrl } from "@/lib/recipeSlugFromSanityUrl";

export type PdpRecipeCard = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: { asset?: { _ref?: string } };
};

type HomeRecipeRow = {
  title?: string;
  mainImage?: { asset?: { _ref?: string } };
  url?: string;
};

/**
 * PDP recipe grid: recipes whose ingredients reference this product handle (up to 3),
 * then pad from the home page `recipesBlock` cards until 3 total.
 */
export async function fetchPdpRecipeCards(
  client: SanityClient,
  productHandle: string,
): Promise<PdpRecipeCard[]> {
  const matched = await client.fetch<PdpRecipeCard[]>(
    RECIPES_BY_PRODUCT_HANDLE_QUERY,
    { productHandle },
  );
  const out: PdpRecipeCard[] = [...(matched ?? [])];
  const seenSlugs = new Set(
    out.map((r) => r.slug?.trim()).filter(Boolean) as string[],
  );

  if (out.length >= 3) return out.slice(0, 3);

  const homeBlock = await client.fetch<{
    recipes?: HomeRecipeRow[];
  } | null>(HOMEPAGE_RECIPES_BLOCK_QUERY);

  const homeRows = homeBlock?.recipes ?? [];
  let i = 0;
  for (const row of homeRows) {
    if (out.length >= 3) break;
    const slug = recipeSlugFromSanityUrl(row.url);
    if (slug && seenSlugs.has(slug)) continue;
    if (!row.title?.trim() && !slug) continue;

    out.push({
      _id: `home-recipes-fallback-${i++}-${slug ?? "recipe"}`,
      title: row.title,
      slug: slug ?? undefined,
      mainImage: row.mainImage,
    });
    if (slug) seenSlugs.add(slug);
  }

  return out.slice(0, 3);
}
