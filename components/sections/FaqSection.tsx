"use client";

import * as React from "react";
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
    <section id="faq" className="py-14 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-center text-sm text-slate-600">{description}</p>
        )}
        <div className="mt-8 space-y-2">
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
          <div className="mt-8 flex justify-center">
            <a
              href={safeHref(showMoreUrl)}
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View All FAQs
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
