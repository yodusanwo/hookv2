import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { urlFor } from "@/lib/sanityImage";

const BASIC_BY_SLUG_QUERY = `*[_type == "basic" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  image { asset-> },
  body
}`;

type BasicData = {
  _id: string;
  title?: string;
  slug?: string;
  image?: { asset?: { _ref?: string } };
  body?: unknown[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!client) return { title: "Basic" };
  try {
    const basic = await client.fetch<BasicData | null>(BASIC_BY_SLUG_QUERY, { slug });
    const title = basic?.title ?? "Basic";
    return { title: `${title} — The Basics` };
  } catch {
    return { title: "The Basics" };
  }
}

export default async function BasicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!client) notFound();

  const basic = await client.fetch<BasicData | null>(BASIC_BY_SLUG_QUERY, { slug });
  if (!basic) notFound();

  let imageUrl: string | null = null;
  try {
    const img = urlFor(basic.image);
    imageUrl = img ? img.url() : null;
  } catch {
    imageUrl = null;
  }

  const bgColor = "var(--brand-light-blue-bg)";

  return (
    <main
      className="min-h-screen pt-[140px] pb-14 sm:pt-[170px] md:pt-[230px]"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h1
          className="mb-6 text-center"
          style={{
            color: "#111827",
            fontFamily: "Inter, sans-serif",
            fontSize: "2.5rem",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {basic.title ?? "Basic"}
        </h1>
        {imageUrl && (
          <div className="mx-auto mb-8 max-w-2xl overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={basic.title ?? ""}
              className="h-auto w-full object-cover"
            />
          </div>
        )}
        {basic.body && Array.isArray(basic.body) && basic.body.length > 0 && (
          <div
            className="prose prose-slate mx-auto max-w-3xl"
            style={{ color: "#1E1E1E" }}
          >
            {/* Portable Text would be rendered here; for now show placeholder */}
            <p className="text-center text-slate-600">
              Content for this topic can be added in Sanity (Basic document body).
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
