import { PortableText } from "next-sanity";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type OurStoryBlock = {
  title?: string;
  body?: unknown[];
  image?: { asset?: { _ref?: string } };
  subheading?: string;
  cta?: { label?: string; href?: string };
};

const BODY_STYLE = {
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontSize: "20px",
  fontStyle: "normal",
  fontWeight: 300,
  lineHeight: "140%",
  color: "var(--gray-content-background-text-icon-80, #1C5080)",
} as const;

const HOOK_POINT_BODY = (
  <>
    <p style={BODY_STYLE}>
      At Hook Point Fisheries, fishing isn&apos;t just a job—it&apos;s our way of life. Every
      summer we carefully fish the waters off Kodiak Island, hand-harvesting wild Alaskan
      salmon and other seafood for folks like you.
    </p>
    <p style={{ ...BODY_STYLE, marginTop: "16px" }}>
      We believe the real food brings people together, and when you choose our salmon,
      you&apos;re supporting sustainable harvest, local families, and small boat fisheries.
    </p>
  </>
);

function isLoremIpsum(body: unknown[] | undefined): boolean {
  if (!body?.length) return false;
  const text = JSON.stringify(body).toLowerCase();
  return text.includes("lorem ipsum") || text.includes("consectetur adipiscing");
}

export function OurStorySection({ block }: { block: OurStoryBlock }) {
  const title = block.title ?? "We are Hook Point";
  const subheading = block.subheading ?? "Who We Are";
  const img = urlFor(block.image);
  const ctaLabel = block.cta?.label ?? "Learn More About Us";
  const ctaHref = block.cta?.href ? safeHref(block.cta.href) : "#learn";

  const useFallbackBody = !block.body?.length || isLoremIpsum(block.body);

  return (
    <section id="about" className="relative z-10 pb-14 pt-0" style={{ backgroundColor: "#D4F2FF" }}>
      <div className="mx-auto max-w-6xl px-4">
        <h2
          className="text-center"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "clamp(2rem, 8vw, 56px)",
            fontWeight: 300,
            lineHeight: "120%",
            letterSpacing: "-1.68px",
            color: "#1E1E1E",
          }}
        >
          {title}
        </h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="overflow-hidden rounded-xl bg-slate-200">
            {img ? (
              <img
                src={img.url()}
                alt={title}
                className="h-[300px] w-full object-cover md:h-[420px]"
                loading="lazy"
              />
            ) : (
              <div className="h-[300px] w-full md:h-[420px]" />
            )}
          </div>
          <div className="max-w-xl rounded-xl px-6 pb-6 pt-0" style={{ backgroundColor: "#D4F2FF" }}>
            <h3
              className="mb-4 text-left font-bold"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "24px",
                color: "#171717",
              }}
            >
              {subheading}
            </h3>
            {block.body && block.body.length > 0 && !useFallbackBody ? (
              <div
                className="our-story-body prose prose-slate max-w-none [&_p]:mt-4 first:[&_p]:mt-0"
                style={BODY_STYLE}
              >
                <PortableText value={block.body as import("@portabletext/types").PortableTextBlock[]} />
              </div>
            ) : (
              HOOK_POINT_BODY
            )}
            <div className="mt-6">
              <a
                href={ctaHref}
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
