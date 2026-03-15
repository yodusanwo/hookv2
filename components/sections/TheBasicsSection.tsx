"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlFor } from "@/lib/sanityImage";

type TheBasicsItem = {
  image?: { _ref?: string; asset?: { _ref?: string } };
  label?: string;
  slug?: string;
};

type TheBasicsSectionBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  items?: TheBasicsItem[];
};

export function TheBasicsSection({ block }: { block: TheBasicsSectionBlock }) {
  const title = block.title ?? "THE BASICS";
  const description = block.description ?? "";
  const items = block.items ?? [];
  const bgColor = block.backgroundColor ?? "#d4f2ff";

  return (
    <section
      className="relative z-20 py-14"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
          titleColor="#111827"
          descriptionColor="#1E1E1E"
        />
        <div className="mt-10 flex flex-wrap items-stretch justify-center gap-8">
          {items.map((item, idx) => {
            let imageUrl: string | null = null;
            try {
              const img = urlFor(item.image);
              imageUrl = img ? img.url() : null;
            } catch {
              imageUrl = null;
            }
            const slug = (item.slug ?? "").trim();
            const href = slug ? `/basics/${encodeURIComponent(slug)}` : "/basics";
            return (
              <Link
                key={idx}
                href={href}
                className="group flex flex-col rounded-[10px] overflow-hidden bg-transparent transition-transform hover:scale-[1.02]"
              >
                <div
                  className="relative w-[280px] max-w-full overflow-hidden rounded-[10px] bg-slate-200"
                  style={{ aspectRatio: "4 / 3" }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.label ?? ""}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <span
                    className="font-medium"
                    style={{
                      color: "#1E1E1E",
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontSize: 16,
                      lineHeight: "normal",
                    }}
                  >
                    {item.label ?? "Basic"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
