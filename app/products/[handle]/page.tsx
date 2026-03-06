import { shopifyFetch } from "@/lib/shopify";
import { AddToCart } from "@/app/components/AddToCart";
import { ProductImageGallery } from "./ProductImageGallery";
import {
  getKlaviyoReviewsForProduct,
  getKlaviyoReviews,
  getKlaviyoReviewCountForProduct,
} from "@/lib/klaviyoReviews";
import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";
import Link from "next/link";

type ProductByHandleResponse = {
  productByHandle: {
    id: string;
    title: string;
    description: string;
    descriptionHtml: string;
    /** Short unique summary from metafield custom.summary (different from main description). */
    summary: { value: string } | null;
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
      summary: metafield(namespace: "custom", key: "summary") { value }
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

const OTHER_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges { node { url altText } }
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
  let otherProducts: Array<{
    id: string;
    title: string;
    handle: string;
    price: string;
    currencyCode: string;
    image: { url: string; altText: string | null } | null;
  }> = [];

  try {
    const [productData, otherData] = await Promise.all([
      shopifyFetch<ProductByHandleResponse, { handle: string }>({
        query: PRODUCT_BY_HANDLE_QUERY,
        variables: { handle },
        cache: "no-store",
      }),
      shopifyFetch<{
        products: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              handle: string;
              priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
              images: { edges: Array<{ node: { url: string; altText: string | null } }> };
            };
          }>;
        };
      }>({
        query: OTHER_PRODUCTS_QUERY,
        variables: { first: 8 },
        cache: "no-store",
      }).catch(() => ({ products: { edges: [] } })),
    ]);
    data = productData;
    const currentId = data.productByHandle?.id ?? null;
    otherProducts = (otherData.products?.edges ?? [])
      .filter((e) => currentId == null || e.node.id !== currentId)
      .slice(0, 4)
      .map((e) => ({
        id: e.node.id,
        title: e.node.title,
        handle: e.node.handle,
        price: e.node.priceRange.minVariantPrice.amount,
        currencyCode: e.node.priceRange.minVariantPrice.currencyCode,
        image: e.node.images.edges[0]?.node ?? null,
      }));
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
        ? client.fetch<{ freeShippingMessage?: string | null }>(
            SITE_SETTINGS_QUERY,
            {},
            { next: { revalidate: 60 } },
          )
        : Promise.resolve(null),
    ]);
  const freeShippingMessage =
    siteSettings?.freeShippingMessage?.trim() ||
    "Free shipping for orders over $50";
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

              {/* Short unique summary from metafield (custom.summary); fallback to hero teaser from description */}
              {(product.summary?.value?.trim() || heroTeaser) ? (
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-700 line-clamp-3">
                  {product.summary?.value?.trim() || heroTeaser}
                </p>
              ) : null}

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <svg
                  className="h-5 w-5 shrink-0 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                {freeShippingMessage}
              </div>

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
              <h2 className="text-lg font-semibold text-slate-900">
                Product Description
              </h2>
              {product.description ? (
                <div className="mt-3 text-sm leading-6 text-slate-700 whitespace-pre-line">
                  {product.description}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  Wild-caught, sustainably sourced. Perfect for grilling, pan-searing, or baking.
                </p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                What You Get
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700">
                <li>100% wild Alaskan seafood</li>
                <li>Individually vacuum-sealed</li>
                <li>All-natural (preservative free)</li>
                <li>Ideal for pan-searing, grilling, or oven cooking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews — light gray; product-specific from Klaviyo, fallback to last 3 global */}
      <section
        className="px-4 py-12 md:py-16"
        style={{ backgroundColor: "var(--section-bg-light)" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-900">
            Reviews
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            What our customers are saying about this product.
          </p>
          {reviewsToShow.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviewsToShow.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white p-5 shadow-sm text-left"
                >
                  <div
                    className="flex justify-center items-center gap-0.5"
                    style={{ color: "#FFA100" }}
                    aria-hidden
                  >
                    {[1, 2, 3, 4, 5].map((j) => (
                      <span
                        key={j}
                        className="flex items-center justify-center"
                        style={{
                          width: 24,
                          height: 24,
                          fontSize: 24,
                          lineHeight: 1,
                        }}
                      >
                        {j <= r.stars ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{r.text}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {r.name}{r.date ? ` — ${r.date}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-slate-500">
              No reviews yet for this product. Be the first to leave a review after your purchase.
            </p>
          )}
        </div>
      </section>

      {/* You Might Also Like — light blue, product carousel */}
      <section
        className="px-4 py-12 md:py-16"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-xl font-semibold uppercase tracking-wide text-slate-900">
            You Might Also Like
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Explore more wild-caught options from our fleet.
          </p>
          {otherProducts.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {otherProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.handle}`}
                  className="group rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-slate-100">
                    {p.image?.url ? (
                      <img
                        src={p.image.url}
                        alt={p.image.altText ?? p.title}
                        className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                      />
                    ) : null}
                    <span
                      className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-sm font-semibold text-slate-900"
                    >
                      ${Math.round(parseFloat(p.price))}
                    </span>
                    <span
                      className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: "var(--brand-green)" }}
                      aria-hidden
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900">{p.title}</h3>
                    <span className="mt-1 inline-block text-sm text-sky-700 hover:underline">
                      Quick View
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-600">
              Check out more products in our shop.
            </p>
          )}
        </div>
      </section>

      {/* Wild Flavor Starts Here — recipes promo, light blue */}
      <section
        className="px-4 py-12 md:py-16"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-xl font-semibold uppercase tracking-wide text-slate-900">
            Wild Flavor Starts Here
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 max-w-2xl mx-auto">
            Get inspired with simple, delicious ways to prepare your catch.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { title: "Simply Grilled Salmon", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80" },
              { title: "Simply Baked Salmon", img: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80" },
              { title: "Roasted Salmon", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80" },
            ].map((r, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={r.img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="p-3 text-center text-sm font-medium text-slate-900">
                  {r.title}
                </p>
              </div>
            ))}
          </div>
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
