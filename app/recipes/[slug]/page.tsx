import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, RECIPE_BY_SLUG_QUERY, EXPLORE_PRODUCTS_BLOCK_QUERY } from "@/lib/sanity";
import { normalizeIngredientShopSegment } from "@/lib/shopPathSegment";
import { urlForSizedImage } from "@/lib/sanityImage";
import { shopifyFetch } from "@/lib/shopify";
import { AddToCart } from "@/app/components/AddToCart";
import { ExploreProductsSection } from "@/components/sections/ExploreProductsSection";
import { BackToRecipesLink } from "@/components/BackToRecipesLink";
import { RecipeImageGallery } from "./RecipeImageGallery";
import { normalizeRecipeSlugParam } from "@/lib/recipeSlug";

const LIGHT_BG = "var(--brand-light-blue-bg)";

const PRODUCT_BY_HANDLE_FOR_CART_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      options { name values }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions { name value }
            price { amount currencyCode }
          }
        }
      }
    }
  }
`;

type RecipeData = {
  _id: string;
  title?: string;
  /** Optional intro between title and Ingredients. */
  summary?: string | null;
  slug?: string;
  images?: Array<{ _ref?: string; asset?: { _ref?: string } }>;
  ingredients?: Array<{
    text?: string;
    productHandle?: string;
    /** Path segment for `/shop/[segment]` (e.g. salmon). Overrides product add-to-cart when set. */
    shopCategorySegment?: string | null;
  }>;
  directions?: Array<{ step?: string }>;
  /** assetRef + assetMeta from GROQ — urlFor needs the ref, not a dereferenced asset doc. */
  directionsImage?: {
    alt?: string | null;
    assetRef?: string | null;
    assetMeta?: {
      metadata?: { dimensions?: { width?: number; height?: number } };
    } | null;
  } | null;
};

type ExploreProductsBlockType = {
  _type?: string;
  _key?: string;
  backgroundColor?: string;
  hideWave?: boolean;
  title?: string;
  description?: string;
  filterCollections?: Array<{ label?: string; collectionHandle?: string; image?: { asset?: { _ref?: string } } }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = normalizeRecipeSlugParam((await params).slug);
  if (!client) return { title: "Recipe" };
  if (!slug) return { title: "Recipe" };
  try {
    const recipe = await client.fetch<RecipeData | null>(RECIPE_BY_SLUG_QUERY, { slug });
    const title = recipe?.title ?? "Recipe";
    const desc = recipe?.summary?.trim();
    return {
      title: `${title} — Recipe`,
      ...(desc && { description: desc.length > 160 ? `${desc.slice(0, 157)}…` : desc }),
    };
  } catch {
    return { title: "Recipe" };
  }
}

type ProductForCart = {
  id: string;
  title: string;
  options: Array<{ name: string; values: string[] }>;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        selectedOptions: Array<{ name: string; value: string }>;
        price: { amount: string; currencyCode: string };
      };
    }>;
  };
};

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const rawSlug = (await params).slug ?? "";
  const slug = normalizeRecipeSlugParam(rawSlug);
  if (!slug) notFound();
  if (rawSlug !== slug) {
    redirect(`/recipes/${encodeURIComponent(slug)}`);
  }

  let recipe: RecipeData | null = null;
  let exploreProductsBlock: ExploreProductsBlockType | null = null;
  if (client) {
    try {
      [recipe, exploreProductsBlock] = await Promise.all([
        client.fetch<RecipeData | null>(RECIPE_BY_SLUG_QUERY, { slug }),
        client.fetch<ExploreProductsBlockType | null>(EXPLORE_PRODUCTS_BLOCK_QUERY),
      ]);
    } catch {
      recipe = null;
      exploreProductsBlock = null;
    }
  }

  if (!recipe) notFound();

  const ingredients = recipe.ingredients ?? [];
  const productHandles = [...new Set(ingredients.map((i) => i.productHandle?.trim()).filter(Boolean))] as string[];

  const productsByHandle: Record<string, ProductForCart | null> = {};
  if (productHandles.length > 0) {
    try {
      const results = await Promise.all(
        productHandles.map((handle) =>
          shopifyFetch<{ productByHandle: ProductForCart | null }>({
            query: PRODUCT_BY_HANDLE_FOR_CART_QUERY,
            variables: { handle },
            cache: "no-store",
          }).then((r) => r.productByHandle ?? null)
        )
      );
      productHandles.forEach((handle, i) => {
        productsByHandle[handle] = results[i] ?? null;
      });
    } catch {
      // Leave productsByHandle empty on error
    }
  }

  const imageUrls: Array<{ url: string; thumbUrl: string; altText: string | null }> = [];
  const rawImages = recipe.images ?? [];
  for (const img of rawImages) {
    try {
      const url = urlForSizedImage(img, 1400);
      const thumbUrl = urlForSizedImage(img, 400);
      if (url && thumbUrl) imageUrls.push({ url, thumbUrl, altText: null });
    } catch {
      // skip
    }
  }

  const title = recipe.title ?? "Recipe";
  const directions = recipe.directions ?? [];

  let directionsImageUrl: string | null = null;
  let directionsImageWidth = 1200;
  let directionsImageHeight = 1600;
  const rawDirectionsImage = recipe.directionsImage;
  const directionsImageRef = rawDirectionsImage?.assetRef?.trim();
  if (directionsImageRef) {
    try {
      /** builder.image() requires { asset: { _ref } }, not a GROQ-dereferenced asset document. */
      directionsImageUrl = urlForSizedImage(
        { asset: { _ref: directionsImageRef } },
        1200,
        88,
      );
    } catch {
      // skip invalid image
    }
  }

  const dimW = rawDirectionsImage?.assetMeta?.metadata?.dimensions?.width;
  const dimH = rawDirectionsImage?.assetMeta?.metadata?.dimensions?.height;
  if (dimW && dimH && dimW > 0 && dimH > 0) {
    directionsImageWidth = dimW;
    directionsImageHeight = dimH;
  }

  const directionsImageAlt =
    (typeof rawDirectionsImage?.alt === "string" && rawDirectionsImage.alt.trim()) ||
    `Directions for ${title}`;

  const showDirectionsSection = directions.length > 0 || Boolean(directionsImageUrl);

  return (
    <main className="bg-white">
      <section
        className="px-4 pt-[140px] pb-10 sm:pt-[170px] md:py-14 lg:pt-[230px]"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <RecipeImageGallery images={imageUrls} recipeTitle={title} />

            <div>
              <p
                className="text-sm font-medium text-slate-500 uppercase tracking-wide"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Recipe
              </p>
              <h1
                className="mt-2"
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "2.5rem",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                }}
              >
                {title}
              </h1>

              {recipe.summary?.trim() ? (
                <p
                  className="mt-6 max-w-prose whitespace-pre-line"
                  style={{
                    color: "var(--Text-Color, #1E1E1E)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 400,
                    lineHeight: "150%",
                  }}
                >
                  {recipe.summary.trim()}
                </p>
              ) : null}

              <h2
                className="mt-8 mb-4"
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1.5rem",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "150%",
                }}
              >
                Ingredients
              </h2>
              <ul className="list-none space-y-2 p-0 m-0">
                {ingredients.map((ing, idx) => {
                  const text = ing.text ?? "";
                  const shopSegment = normalizeIngredientShopSegment(
                    ing.shopCategorySegment,
                  );
                  const handle = ing.productHandle?.trim();
                  const product =
                    !shopSegment && handle ? productsByHandle[handle] : null;
                  const variants = product?.variants?.edges?.map((e) => e.node) ?? [];
                  const options = product?.options ?? [];

                  return (
                    <li
                      key={idx}
                      className="flex flex-wrap items-center gap-2"
                      style={{
                        color: "var(--Text-Color, #1E1E1E)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "1rem",
                        fontWeight: 400,
                        lineHeight: "150%",
                      }}
                    >
                      <span>{text}</span>
                      {shopSegment ? (
                        <Link
                          href={`/shop/${encodeURIComponent(shopSegment)}`}
                          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border-2 border-[var(--brand-navy)] bg-white px-4 text-sm font-semibold text-[var(--brand-navy)] transition-opacity hover:bg-slate-50"
                        >
                          Shop
                        </Link>
                      ) : null}
                      {product && variants.length > 0 && (
                        <AddToCart
                          productTitle={product.title}
                          options={options}
                          variants={variants}
                          variant="recipeIngredient"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {showDirectionsSection && (
        <section
          className="px-4 py-12 md:py-16"
          style={{ backgroundColor: LIGHT_BG }}
        >
          <div className="mx-auto max-w-6xl">
            <h2
              className="mb-6"
              style={{
                color: "var(--Text-Color, #1E1E1E)",
                fontFamily: "Inter, sans-serif",
                fontSize: "1.5rem",
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "150%",
              }}
            >
              Directions
            </h2>
            {directionsImageUrl ? (
              <figure className="mb-8 max-w-3xl">
                <Image
                  src={directionsImageUrl}
                  alt={directionsImageAlt}
                  width={directionsImageWidth}
                  height={directionsImageHeight}
                  className="h-auto w-full rounded-lg object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority={false}
                />
              </figure>
            ) : null}
            {directions.length > 5 ? (() => {
              const leftCount = Math.ceil(directions.length / 2);
              const leftSteps = directions.slice(0, leftCount);
              const rightSteps = directions.slice(leftCount);
              return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <ol className="list-decimal list-inside space-y-4 pl-0" start={1}>
                  {leftSteps.map((d, idx) => (
                    <li
                      key={idx}
                      className="pl-2"
                      style={{
                        color: "var(--Text-Color, #1E1E1E)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "1rem",
                        fontWeight: 400,
                        lineHeight: "150%",
                      }}
                    >
                      {(d.step ?? "").trim() || "—"}
                    </li>
                  ))}
                </ol>
                <div>
                  <ol
                    className="list-decimal list-inside space-y-4 pl-0"
                    start={leftCount + 1}
                  >
                    {rightSteps.map((d, idx) => (
                      <li
                        key={idx}
                        className="pl-2"
                        style={{
                          color: "var(--Text-Color, #1E1E1E)",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "1rem",
                          fontWeight: 400,
                          lineHeight: "150%",
                        }}
                      >
                        {(d.step ?? "").trim() || "—"}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-8">
                    <BackToRecipesLink />
                  </div>
                </div>
              </div>
              );
            })(            ) : directions.length > 0 ? (
              <>
                <ol className="list-decimal list-inside space-y-4 pl-0">
                  {directions.map((d, idx) => (
                    <li
                      key={idx}
                      className="pl-2"
                      style={{
                        color: "var(--Text-Color, #1E1E1E)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "1rem",
                        fontWeight: 400,
                        lineHeight: "150%",
                      }}
                    >
                      {(d.step ?? "").trim() || "—"}
                    </li>
                  ))}
                </ol>
                <div className="mt-8">
                  <BackToRecipesLink />
                </div>
              </>
            ) : (
              <div className="mt-2">
                <BackToRecipesLink />
              </div>
            )}
          </div>
        </section>
      )}

      <ExploreProductsSection
        block={{ ...(exploreProductsBlock ?? {}), backgroundColor: "#F2F2F5" }}
        hideExploreProductsWave={true}
      />
    </main>
  );
}
