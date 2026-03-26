"use client";

import Link from "next/link";
import { urlForSizedImage } from "@/lib/sanityImage";

type BasicItem = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: { asset?: { _ref?: string } };
};

export function BasicsPageClient({
  basics,
  bgColor,
}: {
  basics: BasicItem[];
  bgColor: string;
}) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {basics.map((b) => {
        const href = b.slug ? `/basics/${encodeURIComponent(b.slug)}` : "#";
        let imageUrl: string | null = null;
        try {
          imageUrl = b.mainImage ? urlForSizedImage(b.mainImage, 800) : null;
        } catch {
          imageUrl = null;
        }
        const imageStyle = {
          height: "320px",
          alignSelf: "stretch" as const,
          borderRadius: 10,
          background:
            imageUrl != null && imageUrl !== ""
              ? `url(${imageUrl}) lightgray 50% / cover no-repeat`
              : bgColor,
        };
        return (
          <Link
            key={b._id}
            href={href}
            className="section-card group flex flex-col overflow-hidden transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: bgColor }}
          >
            <div
              className="min-w-0 w-full shrink-0 overflow-hidden"
              style={imageStyle}
            />
            <div className="flex flex-1 flex-col p-4" style={{ backgroundColor: bgColor }}>
              <h2 className="font-semibold text-slate-900">{b.title ?? "Basic"}</h2>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
