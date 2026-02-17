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

const HOOK_POINT_BODY = (
  <>
    <p className="text-sm leading-6 text-slate-700">
      At Hook Point Fisheries, fishing isn&apos;t just a job—it&apos;s our way of life. Every
      summer we carefully fish the waters off Kodiak Island, hand-harvesting wild Alaskan
      salmon and other seafood for folks like you.
    </p>
    <p className="mt-4 text-sm leading-6 text-slate-700">
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
  const img = urlFor(block.image);
  const subheading = block.subheading ?? "Why Wild Matters";
  const ctaLabel = block.cta?.label ?? "Learn More About Us";
  const ctaHref = block.cta?.href ? safeHref(block.cta.href) : "#learn";

  const useFallbackBody = !block.body?.length || isLoremIpsum(block.body);

  return (
    <section id="about" className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-lg text-slate-600">{subheading}</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
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
          <div className="max-w-xl">
            {block.body && block.body.length > 0 && !useFallbackBody ? (
              <div className="prose prose-slate max-w-none text-sm text-slate-700">
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
