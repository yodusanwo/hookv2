import type { Metadata } from "next";
import { Suspense } from "react";
import { shopifyFetch, STOREFRONT_FETCH_REVALIDATE } from "@/lib/shopify";
import { AddToCart } from "@/app/components/AddToCart";
import { ProductVariantProvider } from "@/app/components/ProductVariantContext";
import { ProductVariantSubtitle } from "@/app/components/ProductVariantSubtitle";
import { EstimatedDeliveryDisplay } from "@/app/components/EstimatedDeliveryDisplay";
import { RecentlyViewedTracker } from "@/app/components/SearchModal";
import { ProductImageGallery } from "./ProductImageGallery";
import { ScrollToTop } from "./ScrollToTop";
import { ShopSectionWave } from "@/app/shop/ShopSectionWave";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";
import { getFilterMetafieldConfigEscaped } from "@/lib/shopifyFilterMetafield";
import { isPetProductPage } from "@/lib/isPetProductPage";
import { productIsFrozenForEstimatedDelivery } from "@/lib/productFrozenForEstimatedDelivery";
import { buildDeliveryCalendarConfig } from "@/lib/estimatedDeliveryCalendar";
import {
  parseProcessingDaysFromSanity,
  parseTransitDaysFromSanity,
} from "@/lib/parseSanityDayRange";
import { getKlaviyoReviewSummaryForProduct } from "@/lib/klaviyoReviews";
import { heroReviewCountFromProductAndKlaviyo } from "@/lib/pdpReviewDisplay";
import { PdpReviewsSection } from "./PdpReviewsSection";
import { PdpRecipesSection } from "./PdpRecipesSection";
import { ProductViewTracker } from "./ProductViewTracker";
import {
  PdpRecipesSectionSkeleton,
  PdpReviewsSectionSkeleton,
} from "./PdpBelowFoldSkeletons";
import { sellingPlansFromVariantNode } from "@/lib/mapSellingPlans";
import { renderShopifyRichText, splitWhatYouGetMetafield } from "@/lib/shopifyRichText";
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
    /** Metafield custom.is_frozen (boolean). Frozen/ambient also uses tags + product type; see productIsFrozenForEstimatedDelivery. */
    isFrozen: { value: string } | null;
    /** Metafield custom.what_you_get (rich text). Per-product "What You Get" content. */
    whatYouGet: { value: string } | null;
    /** Standard Shopify review aggregate JSON (from review apps, e.g. Judge.me). */
    reviewsRating: { value: string } | null;
    /** Standard Shopify review count string. */
    reviewsRatingCount: { value: string } | null;
    productType: string;
    tags: string[];
    collections: {
      edges: Array<{ node: { handle: string } }>;
    };
    /** Optional: same metafield as /shop filters; used to match Recipe Category slugs. */
    filterCategory?: { value: string } | null;
    /** Subscription-only product (Storefront API: Product.requiresSellingPlan). */
    requiresSellingPlan: boolean;
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
          sellingPlanAllocations: {
            edges: Array<{
              node: {
                sellingPlan: { id: string; name: string };
                priceAdjustments?: Array<{
                  perDeliveryPrice?: { amount: string; currencyCode: string } | null;
                }> | null;
              };
            }>;
          };
        };
      }>;
    };
  } | null;
};

const PRODUCT_METADATA_QUERY = `
  query ProductMetadata($handle: String!) {
    productByHandle(handle: $handle) {
      title
      description
      featuredImage { url altText }
    }
  }
`;

function buildProductByHandleQuery(): string {
  const meta = getFilterMetafieldConfigEscaped();
  const filterMetafieldLine = meta
    ? `filterCategory: metafield(namespace: "${meta.namespace}", key: "${meta.key}") { value }`
    : "";
  return `
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
      reviewsRating: metafield(namespace: "reviews", key: "rating") { value }
      reviewsRatingCount: metafield(namespace: "reviews", key: "rating_count") { value }
      productType
      tags
      collections(first: 25) {
        edges {
          node {
            handle
          }
        }
      }
      ${filterMetafieldLine}
      requiresSellingPlan
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
            sellingPlanAllocations(first: 10) {
              edges {
                node {
                  sellingPlan {
                    id
                    name
                  }
                  priceAdjustments {
                    perDeliveryPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
}

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
/** Explicit hex so card backgrounds always match section (no variable resolve issues). */
const LIGHT_BG_HEX = "#d4f2ff";
const NAVY = "var(--brand-navy)";

function truncateForMeta(text: string, maxLen: number): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1).trim() + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  try {
    const data = await shopifyFetch<{
      productByHandle: {
        title: string;
        description: string | null;
        featuredImage: { url: string; altText: string | null } | null;
      } | null;
    }>({
      query: PRODUCT_METADATA_QUERY,
      variables: { handle },
      next: STOREFRONT_FETCH_REVALIDATE,
    });
    const p = data?.productByHandle;
    if (!p) return { title: "Product | Hook Point" };
    const title = p.title ? `${p.title} | Hook Point` : "Product | Hook Point";
    const description = p.description
      ? truncateForMeta(p.description, 160)
      : "Wild Alaskan seafood from Hook Point.";
    const image = p.featuredImage?.url;
    return {
      title,
      description,
      openGraph: {
        title: p.title ?? "Product | Hook Point",
        description,
        type: "website",
        ...(image && { images: [{ url: image, alt: p.featuredImage?.altText ?? p.title ?? undefined }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: p.title ?? "Product | Hook Point",
        description,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return { title: "Product | Hook Point" };
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ variant?: string }> | { variant?: string };
}) {
  const { handle } = await params;
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const variantFromUrl = resolvedSearchParams.variant?.trim() || null;

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

  type RecNode = {
    id: string;
    title: string;
    handle: string;
    productType: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: {
      edges: Array<{ node: { url: string; altText: string | null } }>;
    };
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

  type SiteSettingsForPdp = {
    freeShippingMessage?: string | null;
    estimatedDeliveryProcessingDays?: number | null;
    estimatedDeliveryProcessingDaysRange?: string | null;
    estimatedDeliveryTransitDays?: string | null;
    estimatedDeliveryCutoffTime?: string | null;
    estimatedDeliveryFrozenProcessingDays?: number | null;
    estimatedDeliveryFrozenProcessingDaysRange?: string | null;
    estimatedDeliveryFrozenTransitDays?: string | null;
    estimatedDeliveryBlockedDates?: string[] | null;
    estimatedDeliveryProcessingWeekdaysAmbient?: string[] | null;
    estimatedDeliveryProcessingWeekdaysFrozen?: string[] | null;
    estimatedDeliveryTransitWeekdaysAmbient?: string[] | null;
    estimatedDeliveryTransitWeekdaysFrozen?: string[] | null;
  };

  let siteSettings: SiteSettingsForPdp | null = null;

  try {
    const [dataResult, recResponse, settingsResult] = await Promise.all([
      shopifyFetch<ProductByHandleResponse, { handle: string }>({
        query: buildProductByHandleQuery(),
        variables: { handle },
        next: STOREFRONT_FETCH_REVALIDATE,
      }),
      shopifyFetch<
        { productRecommendations: RecNode[] },
        { productHandle: string }
      >({
        query: PRODUCT_RECOMMENDATIONS_QUERY,
        variables: { productHandle: handle },
        next: STOREFRONT_FETCH_REVALIDATE,
      }).catch(() => ({ productRecommendations: [] as RecNode[] })),
      client
        ? client.fetch<SiteSettingsForPdp>(SITE_SETTINGS_QUERY, {}, {
            // Dev: avoid stale settings vs Studio; prod: short ISR
            next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 60 },
          })
        : Promise.resolve(null),
    ]);

    data = dataResult;
    siteSettings = settingsResult;

    const currentId = data.productByHandle?.id ?? null;

    const recs = recResponse.productRecommendations ?? [];
    const mapNodeToOther = (node: RecNode): OtherProduct => {
      const variant = node.variants?.edges?.[0]?.node;
      const price = variant?.price ?? node.priceRange?.minVariantPrice;
      const sizeOrDescription =
        variant?.selectedOptions?.map((o) => o.value).join(" / ") || null;
      const img = node.images?.edges?.[0]?.node ?? null;
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        price: price?.amount ?? "0",
        currencyCode: price?.currencyCode ?? "USD",
        image: img,
        productType: node.productType ?? null,
        sizeOrDescription,
      };
    };

    if (recs.length > 0) {
      otherProducts = recs.slice(0, 4).map((node) => mapNodeToOther(node));
    }

    const needMore = 4 - otherProducts.length;
    if (needMore > 0) {
      const otherData = await shopifyFetch<{
        products: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              handle: string;
              productType?: string;
              priceRange: {
                minVariantPrice: { amount: string; currencyCode: string };
              };
              images: {
                edges: Array<{ node: { url: string; altText: string | null } }>;
              };
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
        variables: { first: 20 },
        next: STOREFRONT_FETCH_REVALIDATE,
      }).catch(() => ({ products: { edges: [] } }));
      const existingIds = new Set(otherProducts.map((p) => p.id));
      const extra = (otherData.products?.edges ?? [])
        .filter(
          (e) =>
            (currentId == null || e.node.id !== currentId) &&
            !existingIds.has(e.node.id)
        )
        .slice(0, needMore)
        .map((e) => {
          const node = e.node;
          const mapped = mapNodeToOther(node as RecNode);
          existingIds.add(mapped.id);
          return mapped;
        });
      otherProducts = [...otherProducts, ...extra];
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
  const variants = product.variants.edges.map((e) => {
    const node = e.node;
    const sellingPlans = sellingPlansFromVariantNode(node);
    return {
      id: node.id,
      title: node.title,
      availableForSale: node.availableForSale,
      selectedOptions: node.selectedOptions,
      price: node.price,
      requiresSellingPlan: product.requiresSellingPlan,
      ...(sellingPlans?.length ? { sellingPlans } : {}),
    };
  });
  const productSummary = product.summary?.value?.trim()
    ? truncateForMeta(product.summary.value, 220)
    : null;

  const freeShippingMessage =
    siteSettings?.freeShippingMessage?.trim() ||
    "Free shipping for orders over $50";

  const whatYouGetRaw = product.whatYouGet?.value?.trim() ?? null;
  const whatYouGetSplit = splitWhatYouGetMetafield(whatYouGetRaw);
  const whatYouGetHeading = whatYouGetSplit.sectionTitle ?? "What You Get";
  const showWhatYouGetColumn = Boolean(whatYouGetRaw);

  const isFrozen = productIsFrozenForEstimatedDelivery({
    tags: product.tags ?? [],
    isFrozenMetafield: product.isFrozen?.value,
    productType: product.productType,
  });

  const { min: processingDaysMin, max: processingDaysMax } =
    parseProcessingDaysFromSanity(
      isFrozen
        ? siteSettings?.estimatedDeliveryFrozenProcessingDaysRange
        : siteSettings?.estimatedDeliveryProcessingDaysRange,
      isFrozen
        ? siteSettings?.estimatedDeliveryFrozenProcessingDays
        : siteSettings?.estimatedDeliveryProcessingDays,
      isFrozen,
    );

  const transitStr = isFrozen
    ? siteSettings?.estimatedDeliveryFrozenTransitDays
    : siteSettings?.estimatedDeliveryTransitDays;

  const { min: transitDaysMin, max: transitDaysMax } = parseTransitDaysFromSanity(
    transitStr,
    isFrozen,
  );

  const deliveryCalendar = buildDeliveryCalendarConfig({
    isFrozen,
    blockedDates: siteSettings?.estimatedDeliveryBlockedDates,
    processingWeekdaysAmbient: siteSettings?.estimatedDeliveryProcessingWeekdaysAmbient,
    processingWeekdaysFrozen: siteSettings?.estimatedDeliveryProcessingWeekdaysFrozen,
    transitWeekdaysAmbient: siteSettings?.estimatedDeliveryTransitWeekdaysAmbient,
    transitWeekdaysFrozen: siteSettings?.estimatedDeliveryTransitWeekdaysFrozen,
  });

  const hideRecipesSection = isPetProductPage({
    title: product.title,
    handle,
    productType: product.productType,
    tags: product.tags ?? [],
    collections: product.collections,
  });

  const firstImageUrl = images[0]?.url;

  const firstVariantPrice = variants[0]?.price?.amount ?? "0";

  /** Resolve in the main RSC (not a nested Suspense chunk) so “N reviews” doesn’t pop in after Klaviyo. */
  const productScopedReviewSummary = await getKlaviyoReviewSummaryForProduct(
    product.id,
  );
  const heroReviewCount = heroReviewCountFromProductAndKlaviyo(
    product,
    productScopedReviewSummary,
  );

  return (
    <>
      <ScrollToTop />
      <RecentlyViewedTracker
        handle={handle}
        title={product.title}
        image={product.featuredImage?.url ?? firstImageUrl ?? null}
        price={firstVariantPrice}
        compareAtPrice={null}
      />
      {firstImageUrl && (
        <link rel="preload" as="image" href={firstImageUrl} />
      )}
      <main style={{ backgroundColor: LIGHT_BG_HEX }}>
      {/* Main product section — light blue; pt clears the header wave */}
      <section
        className="px-4 pt-[140px] pb-10 sm:pt-[170px] md:pt-[230px] md:pb-10"
        style={{ backgroundColor: LIGHT_BG_HEX }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-0">
            <ProductVariantProvider
              variants={variants}
              options={product.options}
              initialVariantId={variantFromUrl}
            >
              <ProductViewTracker
                productTitle={product.title}
                productType={product.productType}
              />
              <div className="order-1 min-w-0 lg:col-start-2 lg:row-start-1 lg:self-start lg:bg-[#d4f2ff] lg:-ml-6 lg:pl-6">
                <h1
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "2.5rem",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                }}
              >
                {product.title}
              </h1>
              <ProductVariantSubtitle productTitle={product.title} />

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
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
                        fontSize: "1.5rem",
                        lineHeight: 1,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className="text-slate-700">
                  {heroReviewCount}{" "}
                  {heroReviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>

              <div className="mt-4 mb-[3.3125rem] w-full min-w-0 max-w-full lg:mb-0">
                <AddToCart
                  productTitle={product.title}
                  productType={product.productType}
                  options={product.options}
                  variants={variants}
                  variant="productPage"
                />
              </div>
              </div>

              <div className="order-2 min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
                <ProductImageGallery images={images} productTitle={product.title} />
              </div>

              <div className="order-3 min-w-0 overflow-visible lg:col-start-2 lg:row-start-2 lg:pt-8">
                {/* Short unique summary from Shopify metafield only. */}
                {productSummary ? (
                  <p
                    className="mt-4 mb-[3.75rem] w-full max-w-full line-clamp-3 lg:mt-0"
                    style={{
                      color: "var(--Text-Color, #1E1E1E)",
                      fontFamily: "Inter, var(--font-inter), sans-serif",
                      fontSize: "1rem",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "1.6rem",
                    }}
                  >
                    {productSummary}
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
                      fontSize: "1rem",
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
                  processingDaysMin={processingDaysMin}
                  processingDaysMax={processingDaysMax}
                  transitDaysMin={transitDaysMin}
                  transitDaysMax={transitDaysMax}
                  calendar={deliveryCalendar}
                  cutOffTime={siteSettings?.estimatedDeliveryCutoffTime ?? null}
                />
              </div>
            </ProductVariantProvider>
          </div>
        </div>
      </section>

      {/* Product Description + What You Get — light blue, then wave */}
      <section
        className="px-4 py-12 md:py-16"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <div className="mx-auto max-w-6xl">
          <div
            className={`grid gap-10 ${showWhatYouGetColumn ? "md:grid-cols-2" : ""}`}
          >
            <div>
              <h2
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter",
                  fontSize: "1.5rem",
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
                    className="product-description mt-3 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_p:first-child]:mt-0 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-4"
                    style={{
                      color: "var(--Text-Color, #1E1E1E)",
                      fontFamily: "Inter",
                      fontSize: "1rem",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "160%",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: product.descriptionHtml,
                    }}
                  />
                ) : (
                  <p
                    className="mt-3"
                    style={{
                      color: "var(--Text-Color, #1E1E1E)",
                      fontFamily: "Inter",
                      fontSize: "1rem",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "160%",
                    }}
                  >
                    Wild-caught, sustainably sourced. Perfect for grilling,
                    pan-searing, or baking.
                  </p>
                )}
              </div>
            </div>
            {showWhatYouGetColumn ? (
              <div>
                <h2
                  style={{
                    color: "var(--Text-Color, #1E1E1E)",
                    fontFamily: "Inter",
                    fontSize: "1.5rem",
                    fontStyle: "normal",
                    fontWeight: 600,
                    lineHeight: "150%",
                  }}
                >
                  {whatYouGetHeading}
                </h2>
                <div style={{ width: "90%" }}>
                  {(() => {
                    const source =
                      whatYouGetSplit.sectionTitle != null
                        ? (whatYouGetSplit.bodyValue ?? "")
                        : (whatYouGetSplit.bodyValue ?? whatYouGetRaw);
                    if (!source?.trim()) return null;
                    const html = renderShopifyRichText(source);
                    if (html) {
                      return (
                        <div
                          className="what-you-get mt-3 [&_ul]:list-outside [&_ul]:pl-5 [&_ol]:list-outside [&_ol]:pl-5"
                          style={{
                            color: "var(--Text-Color, #1E1E1E)",
                            fontFamily: "Inter",
                            fontSize: "1rem",
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
                          fontSize: "1rem",
                          fontStyle: "normal",
                          fontWeight: 400,
                          lineHeight: "160%",
                        }}
                      >
                        {source.trim()}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Wave between product content and reviews — same as shop page collection dividers */}
      <ShopSectionWave />

      <Suspense fallback={<PdpReviewsSectionSkeleton />}>
        <PdpReviewsSection product={product} />
      </Suspense>

      {/* You Might Also Like — light blue, product carousel */}
      <section
        className="px-4 py-12 md:py-16"
        style={{
          backgroundColor: LIGHT_BG_HEX,
          ["--section-bg" as string]: LIGHT_BG_HEX,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-4">
          <SectionHeading
            title="You Might Also Like"
            description="Explore more wild-caught options from our fleet."
            variant="section"
          />
          {otherProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {otherProducts.slice(0, 4).map((p) => {
                const subtitle = p.sizeOrDescription ?? p.productType ?? "";
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.handle}`}
                    className="group block rounded-card overflow-hidden transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: LIGHT_BG_HEX,
                      boxShadow: "none",
                    }}
                  >
                    <div
                      className="rounded-card relative aspect-square overflow-hidden"
                      style={{ backgroundColor: LIGHT_BG_HEX }}
                    >
                      {p.image?.url ? (
                        <img
                          src={p.image.url}
                          alt={p.image.altText ?? p.title}
                          className="h-full w-full object-cover"
                          style={{ mixBlendMode: "multiply" }}
                        />
                      ) : (
                        <div className="h-full w-full" style={{ backgroundColor: LIGHT_BG_HEX }} />
                      )}
                      <div className="product-card-price-overlay product-card-price-overlay--figma" style={{ ["--product-card-price-bg" as string]: "#fff" }}>
                        <span className="product-card-price-single">${Math.round(parseFloat(p.price)).toString()}</span>
                      </div>
                      <span className="product-card-cart-badge" aria-hidden>
                        <img
                          src="/add_shopping_cart_100dp_111827_FILL0_wght400_GRAD0_opsz48%201.svg"
                          alt=""
                        />
                      </span>
                    </div>
                    <div
                      className="rounded-card-b p-4"
                      style={{ backgroundColor: LIGHT_BG_HEX }}
                    >
                      <h3 className="font-semibold text-slate-900">
                        {p.title}
                      </h3>
                      {subtitle ? (
                        <p className="mt-0.5 text-sm text-slate-600">
                          {subtitle}
                        </p>
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

      <Suspense
        fallback={
          hideRecipesSection ? null : <PdpRecipesSectionSkeleton />
        }
      >
        <PdpRecipesSection
          handle={handle}
          hideRecipesSection={hideRecipesSection}
        />
      </Suspense>
    </main>
    </>
  );
}
