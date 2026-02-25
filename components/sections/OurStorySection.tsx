import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";
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
      At Hook Point Fisheries, fishing isn&apos;t just a job—it&apos;s our way
      of life. Every summer we carefully fish the waters off Kodiak Island,
      hand-harvesting wild Alaskan salmon and other seafood for folks like you.
    </p>
    <p style={{ ...BODY_STYLE, marginTop: "16px" }}>
      We believe the real food brings people together, and when you choose our
      salmon, you&apos;re supporting sustainable harvest, local families, and
      small boat fisheries.
    </p>
  </>
);

function isLoremIpsum(body: unknown[] | undefined): boolean {
  if (!body?.length) return false;
  const text = JSON.stringify(body).toLowerCase();
  return (
    text.includes("lorem ipsum") || text.includes("consectetur adipiscing")
  );
}

export function OurStorySection({ block }: { block: OurStoryBlock }) {
  const title = block.title ?? "We are Hook Point";
  const subheading = block.subheading ?? "Who We Are";
  const img = urlFor(block.image);
  const rawCtaLabel = block.cta?.label ?? "Meet your fishermen";
  const ctaLabel =
    rawCtaLabel.length > 0
      ? rawCtaLabel.charAt(0).toUpperCase() + rawCtaLabel.slice(1).toLowerCase()
      : "Meet your fishermen";
  const ctaHref = block.cta?.href ? safeHref(block.cta.href) : "#learn";

  const useFallbackBody = !block.body?.length || isLoremIpsum(block.body);

  return (
    <section
      id="about"
      className="relative z-10 flex min-h-0 flex-col justify-end overflow-visible pt-0 pb-0"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
    >
      <div className="mx-auto w-full px-4 pb-12 pt-10" style={{ maxWidth: 1440 }}>
        <SectionHeading title={title} variant="display" theme="light" titleFontFamily="var(--font-zamenhof-inverse), var(--font-inter), Inter, sans-serif" />
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <div className="overflow-hidden rounded-xl bg-slate-200">
            {img ? (
              <img
                src={img.url()}
                alt={title}
                className="h-[300px] w-full max-w-full object-cover md:h-[420px]"
                style={{ objectPosition: "center top" }}
                loading="lazy"
              />
            ) : (
              <div className="h-[300px] w-full md:h-[420px]" />
            )}
          </div>
          <div
            className="flex max-w-xl flex-col justify-center rounded-xl px-6 pb-6 pt-0"
            style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
          >
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
                <PortableText
                  value={
                    block.body as import("@portabletext/types").PortableTextBlock[]
                  }
                />
              </div>
            ) : (
              HOOK_POINT_BODY
            )}
            <div className="mt-6">
              <a
                href={ctaHref}
                className="inline-block hover:opacity-90 transition-opacity normal-case"
                style={{
                  color: "#498CCB",
                  fontFamily: "Inter, var(--font-inter), sans-serif",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                  textTransform: "none",
                }}
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto w-full shrink-0 overflow-visible">
        <div className="wave-full-bleed mt-auto shrink-0">
          <WaveDivider
            navySrc="/VectorWavyNavyOurStory.svg"
            navyOutline="top"
          />
        </div>
      </div>
    </section>
  );
}
