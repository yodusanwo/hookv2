import { client, BASICS_LIST_QUERY, BASICS_PAGE_CONTENT_QUERY, PAGE_BY_SLUG_QUERY, EXPLORE_PRODUCTS_BLOCK_QUERY, HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY } from "@/lib/sanity";
import { PageBuilder } from "@/components/sections/PageBuilder";
import { BasicsPageClient } from "./BasicsPageClient";

const LIGHT_BG = "var(--brand-light-blue-bg)";

type BasicFromSanity = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: { asset?: { _ref?: string } };
};

type BasicsPageContent = {
  title?: string | null;
  description?: string | null;
  backgroundColor?: string | null;
} | null;

export const metadata = {
  title: "The Basics",
  description: "Thawing, skinning, cooking temperature and more.",
};

export default async function BasicsIndexPage() {
  let basicsRaw: BasicFromSanity[] = [];
  let pageContent: BasicsPageContent = null;
  let sanityPage: { sections?: unknown[] } | null = null;
  let canonicalExploreProductsBlock: Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"] = null;
  let canonicalDocksideMarketsBlock: Parameters<typeof PageBuilder>[0]["canonicalDocksideMarketsBlock"] = null;
  if (client) {
    try {
      [basicsRaw, pageContent, sanityPage, canonicalExploreProductsBlock, canonicalDocksideMarketsBlock] = await Promise.all([
        client.fetch<BasicFromSanity[]>(BASICS_LIST_QUERY),
        client.fetch<BasicsPageContent>(BASICS_PAGE_CONTENT_QUERY),
        client.fetch<{ sections?: unknown[] } | null>(PAGE_BY_SLUG_QUERY, { slug: "basics" }).then((p) => p ?? null),
        client.fetch<Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"]>(EXPLORE_PRODUCTS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
        client.fetch<Parameters<typeof PageBuilder>[0]["canonicalDocksideMarketsBlock"]>(HOMEPAGE_DOCKSIDE_MARKETS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      ]);
    } catch {
      basicsRaw = [];
      pageContent = null;
      sanityPage = null;
    }
  }

  const sections = Array.isArray(sanityPage?.sections) ? sanityPage.sections : [];
  const restSections = sections.filter(
    (s) => typeof s !== "object" || (s as { _type?: string })._type !== "basicsBlock"
  );

  const title = (pageContent?.title ?? "").trim() || "The Basics";
  const description = (pageContent?.description ?? "").trim() || "Thawing, skinning, cooking temperature and more.";
  const bgColor = (pageContent?.backgroundColor ?? "").trim() || LIGHT_BG;

  return (
    <main
      className={`pt-[140px] sm:pt-[170px] md:pt-[230px] ${restSections.length > 0 ? "pb-0" : "pb-14"}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-full pb-10" style={{ backgroundColor: bgColor }}>
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <h1
            className="page-h1 mb-2 text-center"
            style={{
              color: "#111827",
              fontFamily: "Inter, sans-serif",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "normal",
              textTransform: "uppercase",
            }}
          >
            {title}
          </h1>
          <p
            className="mb-10 mx-auto text-center w-full max-w-[743px]"
            style={{
              color: "#1E1E1E",
              fontFamily: "Inter, sans-serif",
              fontSize: "1rem",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "150%",
            }}
          >
            {description}
          </p>
          <BasicsPageClient basics={basicsRaw} bgColor={bgColor} />
        </div>
      </div>
      {restSections.length > 0 && (
        <PageBuilder
          sections={restSections as Parameters<typeof PageBuilder>[0]["sections"]}
          promoBanner={null}
          canonicalExploreProductsBlock={canonicalExploreProductsBlock}
          canonicalDocksideMarketsBlock={canonicalDocksideMarketsBlock}
        />
      )}
    </main>
  );
}
