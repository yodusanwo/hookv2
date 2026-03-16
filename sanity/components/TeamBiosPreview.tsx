"use client";

import React from "react";
import { useClient } from "sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { PreviewProps } from "sanity";

type TeamMember = {
  _key?: string;
  image?: { _ref?: string; asset?: { _ref?: string } };
  name?: string;
  role?: string;
};

type TeamBiosPreviewProps = PreviewProps & {
  blockTitle?: string;
  teamMembers?: TeamMember[];
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * Custom preview for Team Bios block. Shows title and a grid of circular
 * thumbnails in display order (same order as on the front-end).
 */
export function TeamBiosPreview(props: TeamBiosPreviewProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const builder =
    projectId && dataset
      ? createImageUrlBuilder(client).projectId(projectId).dataset(dataset)
      : null;

  const { blockTitle, teamMembers = [] } = props;

  const imageUrl = (img: TeamMember["image"]) => {
    if (!img || !builder) return null;
    return builder.image(img).width(80).height(80).fit("crop").url();
  };

  return (
    <div
      style={{
        padding: 12,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "0.75rem",
        color: "#1E1E1E",
        backgroundColor: "#d4f2ff",
        borderRadius: 8,
      }}
    >
      {blockTitle && (
        <div
          style={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: "0.875rem",
            marginBottom: 4,
            color: "#1E1E1E",
            textTransform: "uppercase",
          }}
        >
          {blockTitle}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(5, 1fr)",
          maxWidth: 320,
          margin: "0 auto",
        }}
      >
        {teamMembers.map((member, idx) => (
          <div
            key={member?._key ?? `member-${idx}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#9CA3AF",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.625rem",
                color: "#fff",
              }}
            >
              {member?.image && imageUrl(member.image) ? (
                <img
                  src={imageUrl(member.image)!}
                  alt={member.name || `Member ${idx + 1}`}
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
            <span
              style={{
                fontSize: "0.5625rem",
                color: "#111827",
                fontWeight: 500,
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                whiteSpace: "nowrap",
              }}
            >
              {member?.name || `#${idx + 1}`}
            </span>
          </div>
        ))}
      </div>
      {teamMembers.length === 0 && (
        <div style={{ textAlign: "center", color: "#6B7280", marginTop: 6 }}>
          No team members yet. Add members above.
        </div>
      )}
    </div>
  );
}
