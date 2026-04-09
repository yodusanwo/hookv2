"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlForSizedImage } from "@/lib/sanityImage";

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

export function TheBasicsSection({
  block,
  topPadding,
}: {
  block: TheBasicsSectionBlock;
  /** Optional top padding in px (e.g. 60 on /recipes page). */
  topPadding?: number;
}) {
  const title = block.title ?? "THE BASICS";
  const description = block.description ?? "";
  const items = block.items ?? [];
  const bgColor = block.backgroundColor ?? "#d4f2ff";

  return (
    <section
      className="relative z-20 py-12 md:py-14"
      style={{
        backgroundColor: bgColor,
        ...(topPadding != null ? { paddingTop: topPadding } : {}),
      }}
    >
      <div className="mx-auto w-full max-w-full px-6 md:px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="section"
          theme="light"
          descriptionColor="#1E1E1E"
        />
        {/*
          Flex + justify-center so the last row centers when it has fewer cards than the row above
          (CSS Grid auto-fill leaves orphans in the first columns).
        */}
        <div className="mt-16 flex flex-wrap justify-center gap-x-[13px] gap-y-[13px]">
          {items.map((item, idx) => {
            let imageUrl: string | null = null;
            try {
              imageUrl = item.image ? urlForSizedImage(item.image, 800) : null;
            } catch {
              imageUrl = null;
            }
            let slug = (item.slug ?? "").trim();
            if (!slug && (item.label ?? "").trim()) {
              slug = (item.label ?? "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
            }
            const href = slug ? `/basics/${encodeURIComponent(slug)}` : "/basics";
            return (
              <Link
                key={idx}
                href={href}
                className="section-card group flex w-full max-w-[387px] shrink-0 flex-col overflow-hidden transition-all duration-200 hover:scale-[1.02] sm:w-[387px]"
                style={{ backgroundColor: bgColor }}
              >
                <div
                  className="min-w-0 w-full shrink-0 overflow-hidden"
                  style={{
                    height: 320,
                    alignSelf: "stretch",
                    borderRadius: 10,
                    background: imageUrl
                      ? `url(${imageUrl}) lightgray 50% / cover no-repeat`
                      : "lightgray",
                  }}
                  role={imageUrl ? undefined : "img"}
                  aria-label={imageUrl ? undefined : (item.label ?? "Basic")}
                >
                  {!imageUrl && (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div
                  className="px-4 py-3"
                  style={{ backgroundColor: bgColor }}
                >
                  <h3
                    className="font-semibold text-slate-900"
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontSize: "1rem",
                      lineHeight: "normal",
                    }}
                  >
                    {item.label ?? "Basic"}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
