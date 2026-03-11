import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/sections/PageBuilder";
import { getEventsFromSheet } from "@/lib/googleSheets";
import { client, PAGE_BY_SLUG_QUERY } from "@/lib/sanity";

/** Slugs that are reserved by other app routes (e.g. /contact, /story) or reserved for future use. */
const RESERVED_SLUGS = new Set([
  "contact",
  "story",
  "home",
  "collections",
  "cart",
  "products",
  "studio",
]);

type PageParams = { slug: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return { title: "Hook Point" };

  const hasSanity =
    !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!hasSanity || !client) return { title: "Hook Point" };

  try {
    const page = await client.fetch<{ title?: string } | null>(
      PAGE_BY_SLUG_QUERY,
      { slug },
      { next: { revalidate: 60 } }
    );
    if (!page?.title) return { title: "Hook Point" };
    return {
      title: `${page.title} | Hook Point`,
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
  try {
    page = await client.fetch<{ title?: string; sections?: unknown[] } | null>(
      PAGE_BY_SLUG_QUERY,
      { slug },
      { next: { revalidate: 60 } }
    );
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
    typeof (firstSection as { backgroundColor?: string }).backgroundColor === "string"
      ? (firstSection as { backgroundColor: string }).backgroundColor
      : "#ffffff";

  return (
    <main
      className="pt-[176px] md:pt-[208px]"
      style={{ backgroundColor: firstBg }}
    >
      <PageBuilder
        sections={sectionsWithEvents as Parameters<typeof PageBuilder>[0]["sections"]}
        promoBanner={null}
      />
    </main>
  );
}
