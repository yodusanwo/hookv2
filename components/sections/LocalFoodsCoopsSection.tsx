import { SectionHeading } from "@/components/ui/SectionHeading";
import { PortableText } from "next-sanity";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type LogoButton = { label?: string; logo?: { asset?: { _ref?: string } }; url?: string };

type LocalFoodsCoopsBlock = {
  title?: string;
  description?: string;
  body?: unknown[];
  image?: { asset?: { _ref?: string } };
  logoButtons?: LogoButton[];
};

export function LocalFoodsCoopsSection({ block }: { block: LocalFoodsCoopsBlock }) {
  const title = block.title ?? "Local Foods Co-ops";
  const description = block.description ?? "";
  const img = urlFor(block.image);
  const logoButtons = block.logoButtons ?? [];

  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />
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
          <div>
            {block.body && block.body.length > 0 ? (
              <div className="prose prose-slate max-w-none text-sm text-slate-700">
                <PortableText value={block.body as import("@portabletext/types").PortableTextBlock[]} />
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-700">
                Find Hook Point products at these local food co-ops and markets.
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              {logoButtons.map((lb, idx) => {
                const logoImg = urlFor(lb.logo);
                const content = logoImg ? (
                  <img
                    src={logoImg.url()}
                    alt={lb.label ?? ""}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-700">{lb.label}</span>
                );
                const safeUrl = safeHref(lb.url);
                return safeUrl !== "#" ? (
                  <a
                    key={idx}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-black/5 bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={idx}
                    className="rounded-lg border border-black/5 bg-slate-50 px-4 py-3"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
