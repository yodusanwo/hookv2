import { shopifyFetch } from "@/lib/shopify";
import { AddToCart } from "@/app/components/AddToCart";
import { EstimatedDeliveryDisplay } from "@/app/components/EstimatedDeliveryDisplay";
import { IconCart } from "@/app/components/Icons";
import { ProductImageGallery } from "./ProductImageGallery";
import { ShopSectionWave } from "@/app/shop/ShopSectionWave";
import { ReviewsCarousel } from "@/components/sections/ReviewsCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getKlaviyoReviewsForProduct,
  getKlaviyoReviews,
  getKlaviyoReviewCountForProduct,
} from "@/lib/klaviyoReviews";
import { client, SITE_SETTINGS_QUERY, RECIPES_BY_PRODUCT_HANDLE_QUERY, RECIPES_LIST_QUERY } from "@/lib/sanity";
import { urlFor } from "@/lib/sanityImage";
import { renderShopifyRichText } from "@/lib/shopifyRichText";
import Link from "next/link";

type ProductByHandleResponse = {
  productByHandle: {
    id: string;
    title: string;
    description: string;
    descriptionHtml: string;
    /** Short unique summary from metafield custom.short_summary_under_images (different from main description). */
    summary: { value: string } | null;
    /** Optional static estimated delivery from metafield custom.estimated_delivery. */
    estimatedDelivery: { value: string } | null;
    /** Metafield custom.is_frozen (boolean). When "true", uses frozen delivery logic. */
    isFrozen: { value: string } | null;
    /** Metafield custom.what_you_get (rich text). Per-product "What You Get" content. */
    whatYouGet: { value: string } | null;
    productType: string;
    featuredImage: { url: string; altText: string | null } | null;
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
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
  } | null;
};

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      summary: metafield(namespace: "custom", key: "short_summary_under_images") { value }
      estimatedDelivery: metafield(namespace: "custom", key: "estimated_delivery") { value }
      isFrozen: metafield(namespace: "custom", key: "is_frozen") { value }
      whatYouGet: metafield(namespace: "custom", key: "what_you_get") { value }
      productType
      featuredImage { url altText }
      images(first: 10) { edges { node { url altText } } }
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

const PRODUCT_RECOMMENDATIONS_QUERY = `
  query ProductRecommendations($productHandle: String!) {
    productRecommendations(productHandle: $productHandle) {
      id
      title
      handle
      productType
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 1) { edges { node { url altText } } }
      variants(first: 1) {
        edges {
          node {
            id
            price { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

const OTHER_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          productType
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges { node { url altText } }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price { amount currencyCode }
                selectedOptions { name value }
              }
            }
          }
        }
      }
    }
  }
`;

const LIGHT_BG = "var(--brand-light-blue-bg)";
const NAVY = "var(--brand-navy)";

/** Returns hero teaser: second paragraph if present, else first, else full description. */
function heroTeaserFromDescription(description: string | null | undefined): string | null {
  if (!description?.trim()) return null;
  const paragraphs = description.trim().split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length >= 2) return paragraphs[1]!;
  if (paragraphs.length === 1) return paragraphs[0]!;
  return description.trim();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  let data: ProductByHandleResponse;
  type OtherProduct = {
    id: string;
    title: string;
    handle: string;
    price: string;
    currencyCode: string;
    image: { url: string; altText: string | null } | null;
    productType?: string | null;
    sizeOrDescription?: string | null;
  };
  let otherProducts: OtherProduct[] = [];

  try {
    data = await shopifyFetch<ProductByHandleResponse, { handle: string }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
      cache: "no-store",
    });
    const currentId = data.productByHandle?.id ?? null;

    type RecNode = {
      id: string;
      title: string;
      handle: string;
      productType: string;
      priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
      images: { edges: Array<{ node: { url: string; altText: string | null } }> };
      variants: {
        edges: Array<{
          node: {
            id: string;
            price: { amount: string; currencyCode: string };
            selectedOptions: Array<{ name: string; value: string }>;
          };
        }>;
      };
    };
    const recResponse = await shopifyFetch<
      { productRecommendations: RecNode[] },
      { productHandle: string }
    >({
      query: PRODUCT_RECOMMENDATIONS_QUERY,
      variables: { productHandle: handle },
      cache: "no-store",
    }).catch(() => ({ productRecommendations: [] }));

    const recs = recResponse.productRecommendations ?? [];
    if (recs.length > 0) {
      otherProducts = recs.slice(0, 4).map((node) => {
        const variant = node.variants?.edges?.[0]?.node;
        const price = variant?.price ?? node.priceRange?.minVariantPrice;
        const sizeOrDescription =
          variant?.selectedOptions?.map((o) => o.value).join(" / ") || null;
        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          price: price?.amount ?? "0",
          currencyCode: price?.currencyCode ?? "USD",
          image: node.images?.edges?.[0]?.node ?? null,
          productType: node.productType ?? null,
          sizeOrDescription,
        };
      });
    } else {
      const otherData = await shopifyFetch<{
        products: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              handle: string;
              productType?: string;
              priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
              images: { edges: Array<{ node: { url: string; altText: string | null } }> };
              variants: {
                edges: Array<{
                  node: {
                    price: { amount: string; currencyCode: string };
                    selectedOptions: Array<{ name: string; value: string }>;
                  };
                }>;
              };
            };
          }>;
        };
      }>({
        query: OTHER_PRODUCTS_QUERY,
        variables: { first: 8 },
        cache: "no-store",
      }).catch(() => ({ products: { edges: [] } }));
      otherProducts = (otherData.products?.edges ?? [])
        .filter((e) => currentId == null || e.node.id !== currentId)
        .slice(0, 4)
        .map((e) => {
          const node = e.node;
          const variant = node.variants?.edges?.[0]?.node;
          const price = variant?.price ?? node.priceRange?.minVariantPrice;
          const sizeOrDescription =
            variant?.selectedOptions?.map((o) => o.value).join(" / ") || null;
          return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            price: price?.amount ?? "0",
            currencyCode: price?.currencyCode ?? "USD",
            image: node.images?.edges?.[0]?.node ?? null,
            productType: node.productType ?? null,
            sizeOrDescription,
          };
        });
    }
  } catch (err) {
    console.error("Failed to fetch product:", err);
    return (
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-2xl font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We couldn&apos;t load this product. Please try again later.
        </p>
      </main>
    );
  }

  const product = data.productByHandle;
  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-2xl font-semibold text-slate-900">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We couldn&apos;t find a product with handle <code>{handle}</code>.
        </p>
      </main>
    );
  }

  const imagesRaw = [
    product.featuredImage ? product.featuredImage : null,
    ...product.images.edges.map((e) => e.node),
  ].filter(Boolean) as Array<{ url: string; altText: string | null }>;
  const seenUrls = new Set<string>();
  const images = imagesRaw.filter((img) => {
    if (seenUrls.has(img.url)) return false;
    seenUrls.add(img.url);
    return true;
  });
  const variants = product.variants.edges.map((e) => e.node);
  const subtitle = variants[0]?.title ?? product.title;
  const heroTeaser = heroTeaserFromDescription(product.description);

  const [productReviews, globalReviews, reviewCount, siteSettings] =
    await Promise.all([
      getKlaviyoReviewsForProduct(product.id),
      getKlaviyoReviews(),
      getKlaviyoReviewCountForProduct(product.id),
      client
        ? client.fetch<{
            freeShippingMessage?: string | null;
            estimatedDeliveryProcessingDays?: number | null;
            estimatedDeliveryTransitDays?: string | null;
            estimatedDeliveryCutoffTime?: string | null;
            estimatedDeliveryFrozenProcessingDays?: number | null;
            estimatedDeliveryFrozenTransitDays?: string | null;
          }>(
            SITE_SETTINGS_QUERY,
            {},
            { next: { revalidate: 60 } },
          )
        : Promise.resolve(null),
    ]);
  const freeShippingMessage =
    siteSettings?.freeShippingMessage?.trim() ||
    "Free shipping for orders over $50";

  const isFrozen =
    product.isFrozen?.value?.toLowerCase() === "true" ||
    (product.productType?.toLowerCase() ?? "").includes("frozen");

  const processingDays = isFrozen
    ? (siteSettings?.estimatedDeliveryFrozenProcessingDays ?? 1)
    : (siteSettings?.estimatedDeliveryProcessingDays ?? 2);

  const transitStr = isFrozen
    ? (siteSettings?.estimatedDeliveryFrozenTransitDays?.trim() ?? "1-2")
    : (siteSettings?.estimatedDeliveryTransitDays?.trim() ?? "2-4");

  const transitMatch = transitStr.match(/^(\d+)\s*-\s*(\d+)$/);
  const transitDaysMin = transitMatch ? parseInt(transitMatch[1]!, 10) : isFrozen ? 1 : 2;
  const transitDaysMax = transitMatch ? parseInt(transitMatch[2]!, 10) : isFrozen ? 2 : 4;

  type RecipeCard = { _id: string; title?: string; slug?: string; mainImage?: { asset?: { _ref?: string } } };
  let recipesToShow: RecipeCard[] = [];
  if (client) {
    try {
      recipesToShow = await client.fetch<RecipeCard[]>(RECIPES_BY_PRODUCT_HANDLE_QUERY, {
        productHandle: handle,
      });
      if (recipesToShow.length === 0) {
        const all = await client.fetch<RecipeCard[]>(RECIPES_LIST_QUERY);
        recipesToShow = all.slice(0, 3);
      }
    } catch {
      recipesToShow = [];
    }
  }

  const productSet = new Set(
    productReviews.map((r) => `${r.name}|${r.date}|${r.text}`)
  );
  const fallbacks = globalReviews.filter(
    (r) => !productSet.has(`${r.name}|${r.date}|${r.text}`)
  );
  const needFallbacks = Math.max(0, 3 - productReviews.length);
  const reviewsToShow =
    productReviews.length >= 3
      ? productReviews
      : [...productReviews, ...fallbacks.slice(0, needFallbacks)];

  return (
    <main className="bg-white">
      {/* Main product section — light blue; pt clears the header wave */}
      <section
        className="px-4 pt-[140px] pb-10 sm:pt-[170px] md:py-14 lg:pt-[230px]"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <ProductImageGallery images={images} productTitle={product.title} />

            <div>
              <h1
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "40px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                }}
              >
                {product.title}
              </h1>
              <p
                style={{
                  marginTop: 21,
                  marginBottom: 27,
                  color: "#374151",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: 300,
                  lineHeight: "normal",
                }}
              >
                {subtitle}
              </p>

              <div
                className="mt-3 mb-[3.3125rem] flex items-center gap-2 text-sm text-slate-600"
              >
                <span
                  className="flex justify-center items-center gap-0.5"
                  style={{ color: "#FFA100" }}
                  aria-hidden
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="flex items-center justify-center"
                      style={{
                        width: 24,
                        height: 24,
                        fontSize: 24,
                        lineHeight: 1,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className="text-slate-700">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>

              {/* Short unique summary from metafield (custom.short_summary_under_images); fallback to hero teaser from description */}
              {(product.summary?.value?.trim() || heroTeaser) ? (
                <p
                  className="mt-4 mb-[3.75rem] w-full max-w-full line-clamp-3"
                  style={{
                    color: "var(--Text-Color, #1E1E1E)",
                    fontFamily: "Inter, var(--font-inter), sans-serif",
                    fontSize: "1rem",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "1.6rem",
                  }}
                >
                  {product.summary?.value?.trim() || heroTeaser}
                </p>
              ) : null}

              <div className="mt-4 flex items-center gap-2">
                <img
                  src="/delivery_truck_speed_24dp_000000_FILL0_wght400_GRAD0_opsz24%201.svg"
                  alt=""
                  className="shrink-0"
                  width={35}
                  height={35}
                  aria-hidden
                />
                <span
                  style={{
                    color: "#374151",
                    fontFamily: "Inter, var(--font-inter), sans-serif",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "150%",
                  }}
                >
                  {freeShippingMessage}
                </span>
              </div>

              <EstimatedDeliveryDisplay
                staticText={product.estimatedDelivery?.value?.trim() ?? null}
                processingDays={processingDays}
                transitDaysMin={transitDaysMin}
                transitDaysMax={transitDaysMax}
                cutOffTime={siteSettings?.estimatedDeliveryCutoffTime ?? null}
              />

              <div className="mt-6">
                <AddToCart
                  productTitle={product.title}
                  options={product.options}
                  variants={variants}
                  variant="productPage"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Description + What You Get — light blue, then wave */}
      <section
        className="px-4 py-12 md:py-16"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter",
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "150%",
                }}
              >
                Product Description
              </h2>
              <div style={{ width: "90%" }}>
                {product.descriptionHtml ? (
                  <div
                    className="product-description mt-3 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_p:first-child]:mt-0 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1 [&_ul]:mb-4"
                    style={{
                      color: "var(--Text-Color, #1E1E1E)",
                      fontFamily: "Inter",
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "160%",
                    }}
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                ) : (
                  <p
                    className="mt-3"
                    style={{
                      color: "var(--Text-Color, #1E1E1E)",
                      fontFamily: "Inter",
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "160%",
                    }}
                  >
                    Wild-caught, sustainably sourced. Perfect for grilling, pan-searing, or baking.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter",
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "150%",
                }}
              >
                What You Get
              </h2>
              <div style={{ width: "90%" }}>
                {product.whatYouGet?.value?.trim() ? (
                  (() => {
                    const html = renderShopifyRichText(product.whatYouGet!.value);
                    if (html) {
                      return (
                        <div
                          className="what-you-get mt-3"
                          style={{
                            color: "var(--Text-Color, #1E1E1E)",
                            fontFamily: "Inter",
                            fontSize: "16px",
                            fontStyle: "normal",
                            fontWeight: 400,
                            lineHeight: "160%",
                          }}
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                      );
                    }
                    return (
                      <div
                        className="mt-3 whitespace-pre-line"
                        style={{
                          color: "var(--Text-Color, #1E1E1E)",
                          fontFamily: "Inter",
                          fontSize: "16px",
                          fontStyle: "normal",
                          fontWeight: 400,
                          lineHeight: "160%",
                        }}
                      >
                        {product.whatYouGet!.value.trim()}
                      </div>
                    );
                  })()
                ) : (
                  <ul
                    className="mt-3 list-inside list-disc space-y-2"
                    style={{
                      color: "var(--Text-Color, #1E1E1E)",
                      fontFamily: "Inter",
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "160%",
                    }}
                  >
                    <li>100% wild Alaskan seafood</li>
                    <li>Individually vacuum-sealed</li>
                    <li>All-natural (preservative free)</li>
                    <li>Ideal for pan-searing, grilling, or oven cooking</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave between product content and reviews — same as shop page collection dividers */}
      <ShopSectionWave />

      {/* Reviews — same styling as home page; product-specific from Klaviyo, fallback to last 3 global */}
      <section
        className="flex min-h-0 flex-col justify-center pb-12 md:pb-14"
        style={{
          backgroundColor: "#F8F8F8",
          paddingTop: "clamp(5rem, 12vw, 8rem)",
          ["--section-bg" as string]: "#F8F8F8",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-4">
          <SectionHeading
            title="Reviews"
            description="What our customers are saying about this product."
            variant="section"
          />
          {reviewsToShow.length > 0 ? (
            <ReviewsCarousel reviews={reviewsToShow} />
          ) : (
            <p className="mt-10 text-center section-description-block">
              No reviews yet for this product. Be the first to leave a review after your purchase.
            </p>
          )}
        </div>
      </section>

      {/* You Might Also Like — light blue, product carousel */}
      <section
        className="px-4 py-12 md:py-16"
        style={{ backgroundColor: LIGHT_BG, ["--section-bg" as string]: LIGHT_BG }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-4">
          <SectionHeading
            title="You Might Also Like"
            description="Explore more wild-caught options from our fleet."
            variant="section"
          />
          {otherProducts.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {otherProducts.map((p) => {
                const subtitle = p.sizeOrDescription ?? p.productType ?? "";
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.handle}`}
                    className="section-card group block rounded-xl overflow-hidden transition-shadow"
                    style={{ backgroundColor: "var(--section-bg)" }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-t-xl bg-slate-100">
                      {p.image?.url ? (
                        <img
                          src={p.image.url}
                          alt={p.image.altText ?? p.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-200" />
                      )}
                      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded bg-white px-2.5 py-1.5 shadow">
                        <span className="text-sm font-semibold text-black">
                          ${parseFloat(p.price).toFixed(2)}
                        </span>
                        <IconCart className="h-4 w-4 text-slate-600" />
                      </div>
                    </div>
                    <div
                      className="p-4"
                      style={{ backgroundColor: "var(--section-bg)" }}
                    >
                      <h3 className="font-semibold text-slate-900">{p.title}</h3>
                      {subtitle ? (
                        <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
                      ) : null}
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#498CCB] hover:underline">
                        Show more
                        <span aria-hidden>+</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-600">
              Check out more products in our shop.
            </p>
          )}
        </div>
      </section>

      {/* Wave between You Might Also Like and Recipes */}
      <ShopSectionWave />

      {/* Wild Flavor Starts Here — recipes promo, light blue */}
      <section
        className="px-4 py-12 md:py-16"
        style={{
          backgroundColor: LIGHT_BG,
          paddingTop: "clamp(8rem, 16vw, 12rem)",
          ["--section-bg" as string]: LIGHT_BG,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-4">
          <SectionHeading
            title="Wild Flavor Starts Here"
            description="Get inspired with simple, delicious ways to prepare your catch."
            variant="section"
          />
          {recipesToShow.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {recipesToShow.map((r) => {
                const img = urlFor(r.mainImage);
                const slug = r.slug?.trim();
                return (
                  <Link
                    key={r._id}
                    href={slug ? `/recipes/${slug}` : "/recipes"}
                    className="section-card overflow-hidden rounded-xl transition-shadow"
                    style={{ backgroundColor: "var(--section-bg)" }}
                  >
                    <div className="aspect-square overflow-hidden bg-slate-100">
                      {img ? (
                        <img
                          src={img.width(400).url()}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-200" />
                      )}
                    </div>
                    <p
                      className="p-3 text-center text-sm font-medium text-slate-900"
                      style={{ backgroundColor: "var(--section-bg)" }}
                    >
                      {r.title ?? "Recipe"}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-slate-600">
              Check out our recipes for inspiration.
            </p>
          )}
          <p className="mt-6 text-center">
            <Link
              href="/#recipes"
              className="text-sm font-semibold text-sky-700 hover:underline"
            >
              Show more delicious recipes →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
