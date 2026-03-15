import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client, RECIPE_BY_SLUG_QUERY, EXPLORE_PRODUCTS_BLOCK_QUERY } from "@/lib/sanity";
import { urlFor } from "@/lib/sanityImage";
import { shopifyFetch } from "@/lib/shopify";
import { AddToCart } from "@/app/components/AddToCart";
import { ExploreProductsSection } from "@/components/sections/ExploreProductsSection";
import { RecipeImageGallery } from "./RecipeImageGallery";

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
  slug?: string;
  images?: Array<{ _ref?: string; asset?: { _ref?: string } }>;
  ingredients?: Array<{ text?: string; productHandle?: string }>;
  directions?: Array<{ step?: string }>;
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
  const { slug } = await params;
  if (!client) return { title: "Recipe" };
  try {
    const recipe = await client.fetch<RecipeData | null>(RECIPE_BY_SLUG_QUERY, { slug });
    const title = recipe?.title ?? "Recipe";
    return { title: `${title} — Recipe` };
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
  const { slug } = await params;

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

  const imageUrls: Array<{ url: string; altText: string | null }> = [];
  const rawImages = recipe.images ?? [];
  for (const img of rawImages) {
    try {
      const u = urlFor(img);
      if (u) imageUrls.push({ url: u.url(), altText: null });
    } catch {
      // skip
    }
  }

  const title = recipe.title ?? "Recipe";
  const directions = recipe.directions ?? [];

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
                  fontSize: "40px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                }}
              >
                {title}
              </h1>

              <h2
                className="mt-8 mb-4"
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "24px",
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
                  const handle = ing.productHandle?.trim();
                  const product = handle ? productsByHandle[handle] : null;
                  const variants = product?.variants?.edges?.map((e) => e.node) ?? [];
                  const options = product?.options ?? [];

                  return (
                    <li
                      key={idx}
                      className="flex flex-wrap items-center gap-2"
                      style={{
                        color: "var(--Text-Color, #1E1E1E)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "16px",
                        fontWeight: 400,
                        lineHeight: "150%",
                      }}
                    >
                      <span>{text}</span>
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

      {directions.length > 0 && (
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
                fontSize: "24px",
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "150%",
              }}
            >
              Directions
            </h2>
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
                        fontSize: "16px",
                        fontWeight: 400,
                        lineHeight: "150%",
                      }}
                    >
                      {(d.step ?? "").trim() || "—"}
                    </li>
                  ))}
                </ol>
                <ol className="list-decimal list-inside space-y-4 pl-0" start={leftCount + 1}>
                  {rightSteps.map((d, idx) => (
                    <li
                      key={idx}
                      className="pl-2"
                      style={{
                        color: "var(--Text-Color, #1E1E1E)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "16px",
                        fontWeight: 400,
                        lineHeight: "150%",
                      }}
                    >
                      {(d.step ?? "").trim() || "—"}
                    </li>
                  ))}
                </ol>
              </div>
              );
            })() : (
              <ol className="list-decimal list-inside space-y-4 pl-0">
                {directions.map((d, idx) => (
                  <li
                    key={idx}
                    className="pl-2"
                    style={{
                      color: "var(--Text-Color, #1E1E1E)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "150%",
                    }}
                  >
                    {(d.step ?? "").trim() || "—"}
                  </li>
                ))}
              </ol>
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
