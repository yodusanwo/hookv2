"use client";

import * as React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { safeHref } from "@/lib/urlValidation";

type FaqItem = {
  categoryTitle?: string;
  question?: string;
  answer?: string;
};

type FaqBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  faqs?: FaqItem[];
  showMoreUrl?: string;
};

type FaqGroup = { categoryTitle?: string; items: FaqItem[] };

/** Group FAQ items: same category title = same group; item with no title continues current group. */
function groupFaqsByCategory(faqs: FaqItem[]): FaqGroup[] {
  const groups: FaqGroup[] = [];
  let current: FaqGroup | null = null;

  for (const faq of faqs) {
    const title = (faq.categoryTitle ?? "").trim() || undefined;
    if (title) {
      if (current && current.categoryTitle === title) {
        current.items.push(faq);
      } else {
        current = { categoryTitle: title, items: [faq] };
        groups.push(current);
      }
    } else {
      if (!current) {
        current = { categoryTitle: undefined, items: [] };
        groups.push(current);
      }
      current.items.push(faq);
    }
  }

  return groups;
}

export function FaqSection({ block }: { block: FaqBlock }) {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const title = block.title ?? "FAQ";
  const description = block.description ?? "";
  const faqs = block.faqs ?? [];
  const showMoreUrl = block.showMoreUrl;

  if (faqs.length === 0) return null;

  const groups = groupFaqsByCategory(faqs);
  const bgColor = block.backgroundColor ?? "#f2f2f5";
  const totalFaqCount = faqs.length;
  let flatIdx = 0;

  return (
    <section id="faq" className="py-12 md:py-14" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto w-full px-6 md:px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
          wideTitleOnDesktop
        />
        <div className="mx-auto mt-8 max-w-3xl space-y-8">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              {group.categoryTitle && (
                <h3
                  className="text-left text-lg font-semibold text-slate-900"
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                  }}
                >
                  {group.categoryTitle}
                </h3>
              )}
              <div className="space-y-2">
                {group.items.map((faq) => {
                  const idx = flatIdx++;
                  const isOpen = openIdx === idx;
                  const isLastFaq = idx === totalFaqCount - 1;
                  return (
                    <div
                      key={idx}
                      className="overflow-hidden max-w-[607px]"
                      style={{
                        backgroundColor: bgColor,
                        borderTop: "1px solid #D1D5DB",
                        ...(isLastFaq ? { borderBottom: "1px solid #D1D5DB" } : {}),
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIdx(isOpen ? null : idx)}
                        className="min-h-[44px] w-full px-6 py-4 text-left hover:opacity-90 flex justify-between items-center"
                        style={{
                          color: "#1E1E1E",
                          fontFamily: "var(--font-inter), Inter, sans-serif",
                          fontSize: 16,
                          fontStyle: "normal",
                          fontWeight: 400,
                          lineHeight: "normal",
                        }}
                      >
                        {faq.question}
                        {isOpen ? (
                          <span className="text-slate-400">−</span>
                        ) : (
                          <img
                            src="/plus.svg"
                            alt=""
                            aria-hidden
                            className="h-5 w-5 shrink-0 text-slate-400"
                          />
                        )}
                      </button>
                      {isOpen && faq.answer && (
                        <div
                          className="border-t border-black/5 px-6 py-4"
                          style={{
                            color: "#1E1E1E",
                            fontFamily: "var(--font-inter), Inter, sans-serif",
                            fontSize: 16,
                            fontStyle: "normal",
                            fontWeight: 400,
                            lineHeight: "normal",
                          }}
                        >
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {showMoreUrl && (
          <div className="mx-auto mt-8 max-w-3xl">
            <a
              href={safeHref(showMoreUrl)}
              className="inline-flex items-center gap-2 hover:underline"
              style={{
                color: "#498CCB",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              Show More
              <img
                src="/trending_flat_50dp_000000_FILL0_wght200_GRAD0_opsz48%201.svg"
                alt=""
                aria-hidden
                className="h-5 w-auto shrink-0"
              />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
