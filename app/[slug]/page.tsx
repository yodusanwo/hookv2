import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/sections/PageBuilder";
import { getEventsFromSheet } from "@/lib/googleSheets";
import {
  client,
  PAGE_BY_SLUG_QUERY,
  EXPLORE_PRODUCTS_BLOCK_QUERY,
  HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY,
  HOMEPAGE_LOCAL_FOODS_COOPS_BLOCK_QUERY,
} from "@/lib/sanity";

/** Slugs that are reserved by other app routes (e.g. /contact, /about) or reserved for future use. */
const RESERVED_SLUGS = new Set([
  "contact",
  "about",
  "story",
  "home",
  "shop",
  "recipes",
  "basics",
  "faq",
  "calendar",
  "collections",
  "cart",
  "products",
  "studio",
]);

type PageParams = { slug: string };

function metaDescriptionFromPage(
  title: string | undefined,
  sanityDescription: string | null | undefined,
): string {
  const d = sanityDescription?.trim();
  if (d) {
    return d.length > 160 ? `${d.slice(0, 157)}…` : d;
  }
  if (title?.trim()) {
    const t = title.trim();
    const fallback = `${t} — Hook Point Fisheries. Wild-caught Alaska seafood from our family to yours.`;
    return fallback.length > 160 ? `${fallback.slice(0, 157)}…` : fallback;
  }
  return "Hook Point Fisheries — wild Alaska seafood from Kodiak, shipped nationwide.";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return { title: "Hook Point" };

  const hasSanity =
    !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!hasSanity || !client) return { title: "Hook Point" };

  try {
    const page = await client.fetch<{
      title?: string;
      description?: string | null;
    } | null>(PAGE_BY_SLUG_QUERY, { slug }, { next: { revalidate: 60 } });
    if (!page?.title) return { title: "Hook Point" };
    const description = metaDescriptionFromPage(page.title, page.description);
    const fullTitle = `${page.title} | Hook Point`;
    return {
      title: fullTitle,
      description,
      openGraph: {
        title: fullTitle,
        description,
      },
      twitter: { description },
    };
  } catch {
    return { title: "Hook Point" };
  }
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  const hasSanity =
    !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!hasSanity || !client) {
    notFound();
  }

  let page: { title?: string; sections?: unknown[] } | null = null;
  let canonicalExploreProductsBlock: Parameters<
    typeof PageBuilder
  >[0]["canonicalExploreProductsBlock"] = null;
  let canonicalDocksideMarketsBlock: Parameters<
    typeof PageBuilder
  >[0]["canonicalDocksideMarketsBlock"] = null;
  let canonicalLocalFoodsCoopsBlock: Parameters<
    typeof PageBuilder
  >[0]["canonicalLocalFoodsCoopsBlock"] = null;
  try {
    [
      page,
      canonicalExploreProductsBlock,
      canonicalDocksideMarketsBlock,
      canonicalLocalFoodsCoopsBlock,
    ] = await Promise.all([
      client.fetch<{ title?: string; sections?: unknown[] } | null>(
        PAGE_BY_SLUG_QUERY,
        { slug },
        { next: { revalidate: 60 } },
      ),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"]
      >(EXPLORE_PRODUCTS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalDocksideMarketsBlock"]
      >(HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      client.fetch<
        Parameters<typeof PageBuilder>[0]["canonicalLocalFoodsCoopsBlock"]
      >(HOMEPAGE_LOCAL_FOODS_COOPS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
    ]);
  } catch {
    notFound();
  }

  if (!page) {
    notFound();
  }

  const sections = page.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    return (
      <main className="bg-white py-16 text-center">
        <p className="text-slate-600">This page has no content yet.</p>
      </main>
    );
  }

  const sheetEvents = await getEventsFromSheet();
  const sectionsWithEvents = sections.map((section: unknown) => {
    const s = section as { _type?: string; [key: string]: unknown };
    if (s._type === "upcomingEventsBlock") {
      return { ...s, events: sheetEvents };
    }
    return section;
  });

  const firstSection = sectionsWithEvents[0];
  const firstBg =
    firstSection &&
    typeof firstSection === "object" &&
    "backgroundColor" in firstSection &&
    typeof (firstSection as { backgroundColor?: string }).backgroundColor ===
      "string"
      ? (firstSection as { backgroundColor: string }).backgroundColor
      : "#ffffff";

  return (
    <main
      className="pt-[176px] md:pt-[208px]"
      style={{ backgroundColor: firstBg }}
    >
      <PageBuilder
        sections={
          sectionsWithEvents as Parameters<typeof PageBuilder>[0]["sections"]
        }
        promoBanner={null}
        pageSlug={slug}
        canonicalExploreProductsBlock={canonicalExploreProductsBlock}
        canonicalDocksideMarketsBlock={canonicalDocksideMarketsBlock}
        canonicalLocalFoodsCoopsBlock={canonicalLocalFoodsCoopsBlock}
      />
    </main>
  );
}
