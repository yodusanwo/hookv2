import { SectionHeading } from "@/components/ui/SectionHeading";
import { PromoBanner } from "@/components/PromoBanner";
import { PageBuilder } from "@/components/sections/PageBuilder";
import { getEventsFromSheet } from "@/lib/googleSheets";
import { client, COLLECTION_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/lib/sanity";
import { shopifyFetch } from "@/lib/shopify";
import type { Metadata } from "next";
import Link from "next/link";
import { Carousel } from "@/app/components/Carousel";
import { HeroCarousel } from "@/app/components/HeroCarousel";

const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!, $firstProducts: Int!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      image {
        url
        altText
      }
      products(first: $firstProducts) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  }
`;

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: {
    edges: Array<{ node: { url: string; altText: string | null } }>;
  };
  variants: {
    edges: Array<{ node: { id: string; availableForSale: boolean } }>;
  };
};

type CollectionResponse = {
  collectionByHandle: {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    image: { url: string; altText: string | null } | null;
    products: {
      edges: Array<{ node: ProductNode }>;
    };
  } | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const data = await shopifyFetch<CollectionResponse, { handle: string; firstProducts: number }>({
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: { handle, firstProducts: 1 },
    next: { revalidate: 60 },
  });
  const collection = data.collectionByHandle;
  if (!collection) return { title: "Category not found" };
  return {
    title: `${collection.title} — Hook Point`,
    description: collection.description || `Shop ${collection.title} at Hook Point.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const hasSanity =
    !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_SANITY_DATASET;

  let sanityPage: { sections?: unknown[] } | null = null;
  let promoBanner: string | null = null;

  if (hasSanity) {
    try {
      [sanityPage, promoBanner] = await Promise.all([
        client.fetch<{ sections?: unknown[] } | null>(
          COLLECTION_PAGE_QUERY,
          { handle },
          { next: { revalidate: 60 } }
        ),
        client
          .fetch<{ promoBanner?: string } | null>(SITE_SETTINGS_QUERY, {}, { next: { revalidate: 60 } })
          .then((s) => s?.promoBanner ?? null),
      ]);
    } catch (e) {
      console.warn("Sanity fetch failed for collection page, using fallback:", e);
    }
  }

  if (sanityPage?.sections && Array.isArray(sanityPage.sections) && sanityPage.sections.length > 0) {
    const sheetEvents = await getEventsFromSheet();
    const sectionsWithEvents = sanityPage.sections.map((section: unknown) => {
      const s = section as { _type?: string; [key: string]: unknown };
      if (s._type === "upcomingEventsBlock") {
        return { ...s, events: sheetEvents };
      }
      return section;
    });
    return (
      <main className="bg-white">
        <PageBuilder
          sections={sectionsWithEvents as Parameters<typeof PageBuilder>[0]["sections"]}
          promoBanner={promoBanner}
          hideExploreProductsWave
        />
      </main>
    );
  }

  let data: CollectionResponse;
  try {
    data = await shopifyFetch<CollectionResponse, { handle: string; firstProducts: number }>({
      query: COLLECTION_BY_HANDLE_QUERY,
      variables: { handle, firstProducts: 24 },
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-red-600">
            Error loading category
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-mono">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const collection = data.collectionByHandle;
  if (!collection) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-2xl font-semibold text-slate-900">Category not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          We couldn&apos;t find a category with handle &quot;{handle}&quot;.
        </p>
        <Link href="/" className="mt-4 inline-block text-sky-600 hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  const products = collection.products.edges;
  const heroImg =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";
  const aboutImg =
    collection.image?.url ??
    "https://images.unsplash.com/photo-1520975869018-1d9d275b4020?auto=format&fit=crop&w=1200&q=80";

  const carouselItems = products
    .map((p) => {
      const img = p.node.images.edges[0]?.node;
      if (!img?.url) return null;
      return { src: img.url, alt: img.altText ?? p.node.title };
    })
    .filter(Boolean) as Array<{ src: string; alt: string }>;

  return (
    <main className="bg-white">
      <HeroCarousel
        headlineLine1={`${collection.title} —`}
        headlineLine2={"Taste the Adventure"}
        subline={"Wild-caught  •  Family-run  •  Sustainably sourced"}
        ctaLabel={"Shop this category"}
        ctaHref={"#shop"}
        items={[
          { src: collection.image?.url ?? heroImg, alt: collection.image?.altText ?? collection.title },
          { src: "/1A4A6382.jpeg", alt: "Fresh catch on dock" },
          { src: "/1A4A6336.jpeg", alt: "Fresh catch on dock" },
          ...carouselItems.slice(0, 4).map((i) => ({ src: i.src, alt: i.alt })),
        ].filter((i) => i.src)}
      />

      <section id="about" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading title={collection.title} variant="display" theme="light" />
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="overflow-hidden rounded-xl bg-slate-200">
              <img
                src={aboutImg}
                alt={collection.image?.altText ?? collection.title}
                className="h-[300px] w-full max-w-full object-cover md:h-[420px]"
                loading="lazy"
              />
            </div>
            <div className="max-w-xl">
              {collection.description ? (
                <p className="text-sm leading-6 text-slate-700 whitespace-pre-line">
                  {collection.description}
                </p>
              ) : (
                <p className="text-sm leading-6 text-slate-700">
                  Browse our curated {collection.title.toLowerCase()} selection from Alaska&apos;s small-boat fleet.
                </p>
              )}
              <div className="mt-6">
                <a href="#shop" className="btn-primary">
                  Shop {collection.title}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            title="Let us be your fishermen. The possibilities are endless…"
            variant="display"
            theme="light"
          />
          <div className="mt-6">
            <Carousel
              items={
                carouselItems.length > 0
                  ? carouselItems.slice(0, 10)
                  : [{ src: heroImg, alt: collection.title }]
              }
              ariaLabel={`Featured ${collection.title}`}
            />
          </div>
          <div className="mt-6 flex justify-center">
            <a href="#shop" className="btn-primary">
              Shop {collection.title}
            </a>
          </div>
        </div>
      </section>

      <section id="shop" className="py-14" style={{ backgroundColor: "var(--brand-navy)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {collection.title}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {collection.description
                  ? collection.description.slice(0, 80) + (collection.description.length > 80 ? "…" : "")
                  : `Curated ${collection.title.toLowerCase()} from Alaska's small-boat fleet.`}
              </p>
            </div>
            <Link
              href="/"
              className="hidden sm:inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              All products
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-slate-300">No products in this category yet.</p>
              <Link href="/" className="mt-4 inline-block text-white underline hover:no-underline">
                View all products
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(({ node: product }) => {
                const img = product.images.edges[0]?.node;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    className="group rounded-xl border border-black/5 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-slate-100">
                      {img?.url ? (
                        <img
                          src={img.url}
                          alt={img.altText ?? product.title}
                          className="h-full w-full max-w-full object-cover group-hover:scale-[1.03] transition-transform"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {product.title}
                        </h3>
                        {product.variants.edges[0]?.node.availableForSale ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            In stock
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            Sold out
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-slate-700">
                        $
                        {Math.round(
                          parseFloat(product.priceRange.minVariantPrice.amount)
                        ).toString()}{" "}
                        {product.priceRange.minVariantPrice.currencyCode}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="markets" className="border-y border-black/5 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            title="Find us at these Chicagoland Farmers Markets"
            variant="display"
            theme="light"
          />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              "Lincoln Park",
              "Uptown",
              "Lakeview",
              "South Loop",
              "Logan Square",
              "Wicker Park",
            ].map((name) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-xl border border-black/5 bg-slate-50 p-5 text-xs font-semibold text-slate-700"
              >
                {name}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <a href="#contact" className="btn-primary">
              Pick Fresh Farmers Markets and Event Calendar
            </a>
          </div>
        </div>
      </section>

      <section id="learn" className="py-14 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-700/90" />
          <div className="mt-4">
            <SectionHeading
              title="Get on board"
              description="Subscribe to get updates on fresh drops and fishy stories."
              variant="display"
              theme="light"
            />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <input
              type="email"
              placeholder="Email"
              className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-sky-700 sm:w-[380px]"
            />
            <button type="button" className="btn-primary">
              Sign up
            </button>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            title="Follow Our Journey on Instagram"
            variant="display"
            theme="light"
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(carouselItems.length > 0 ? carouselItems : [{ src: heroImg, alt: collection.title }])
              .slice(0, 12)
              .map((i, idx) => (
                <div
                  key={`${i.src}-${idx}`}
                  className="aspect-square overflow-hidden rounded-lg bg-slate-200"
                >
                  <img
                    src={i.src}
                    alt={i.alt}
                    className="h-full w-full max-w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
