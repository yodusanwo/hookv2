"use client";

import React from "react";
import { useClient } from "sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { PreviewProps } from "sanity";

type GalleryImage = {
  image?: { _ref?: string; asset?: { _ref?: string } };
  alt?: string;
};

type PhotoGalleryPreviewProps = PreviewProps & {
  blockTitle?: string;
  galleryImages?: GalleryImage[];
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const GRID_AREAS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"] as const;

/**
 * Custom preview for Photo Gallery block. Matches front-end gridTemplateAreas layout:
 *   p1 p2 p4
 *   p1 p3 p4
 *   p5 p6 p8
 *   p5 p7 p9
 */
export function PhotoGalleryPreview(props: PhotoGalleryPreviewProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const builder =
    projectId && dataset
      ? createImageUrlBuilder(client).projectId(projectId).dataset(dataset)
      : null;

  const { blockTitle, galleryImages = [] } = props;

  const imageUrl = (img: GalleryImage["image"]) => {
    if (!img || !builder) return null;
    return builder.image(img).width(100).height(100).fit("crop").url();
  };

  return (
    <div
      style={{
        padding: 12,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 12,
        color: "#1E1E1E",
        backgroundColor: "#E6F7FF",
        borderRadius: 8,
      }}
    >
      {blockTitle && (
        <div
          style={{
            textAlign: "center",
            fontWeight: 300,
            fontSize: 14,
            marginBottom: 8,
            color: "#1E1E1E",
          }}
        >
          {blockTitle}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gap: 6,
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "40px 40px 40px 40px",
          gridTemplateAreas: `
            "p1 p2 p4"
            "p1 p3 p4"
            "p5 p6 p8"
            "p5 p7 p9"
          `,
          maxWidth: 200,
          margin: "0 auto",
        }}
      >
        {GRID_AREAS.map((gridArea, idx) => {
          const item = galleryImages[idx];

          return (
            <div
              key={idx}
              style={{
                gridArea,
                borderRadius: 4,
                overflow: "hidden",
                backgroundColor: "#D1D5DB",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#6B7280",
              }}
            >
              {item?.image && imageUrl(item.image) ? (
                <img
                  src={imageUrl(item.image)!}
                  alt={item.alt || `Slot ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>
          );
        })}
      </div>
      {galleryImages.length > 9 && (
        <div style={{ marginTop: 6, textAlign: "center", color: "#6B7280" }}>
          +{galleryImages.length - 9} more
        </div>
      )}
    </div>
  );
}
