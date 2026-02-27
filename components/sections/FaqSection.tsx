"use client";

import * as React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { safeHref } from "@/lib/urlValidation";

type FaqItem = { question?: string; answer?: string };

type FaqBlock = {
  title?: string;
  description?: string;
  faqs?: FaqItem[];
  showMoreUrl?: string;
};

export function FaqSection({ block }: { block: FaqBlock }) {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const title = block.title ?? "FAQ";
  const description = block.description ?? "";
  const faqs = block.faqs ?? [];
  const showMoreUrl = block.showMoreUrl;

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-14 section-bg-light">
      <div className="mx-auto w-full px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
          wideTitleOnDesktop
        />
        <div className="mx-auto mt-8 max-w-3xl space-y-2">
          {faqs.map((faq, idx) => {
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
        {showMoreUrl && (
          <div className="mx-auto mt-8 flex max-w-3xl justify-center">
            <a
              href={safeHref(showMoreUrl)}
              className="btn-primary"
            >
              View All FAQs
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
