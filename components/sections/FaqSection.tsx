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
  let flatIdx = 0;

  return (
    <section id="faq" className="py-14" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto w-full px-4">
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
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-black/5 bg-white overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIdx(isOpen ? null : idx)}
                        className="w-full px-6 py-4 text-left font-semibold text-slate-900 hover:bg-slate-50 flex justify-between items-center"
                      >
                        {faq.question}
                        <span className="text-slate-400">{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen && faq.answer && (
                        <div className="border-t border-black/5 px-6 py-4 text-sm text-slate-700">
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
              <span className="text-xl leading-none" aria-hidden>›</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
