"use client";

import React from "react";
import type { PreviewProps } from "sanity";

type ContactBlockPreviewProps = PreviewProps & {
  blockTitle?: string;
  /** Block's description field (alias to avoid clashing with PreviewProps.description). */
  blockDescription?: string;
  email?: string;
  phone?: string;
};

/**
 * Custom preview for Contact block. Shows title and a short form summary.
 */
export function ContactBlockPreview(props: ContactBlockPreviewProps) {
  const { blockTitle, blockDescription, email } = props;

  return (
    <div
      style={{
        padding: 12,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 12,
        color: "#1E1E1E",
        backgroundColor: "#d4f2ff",
        borderRadius: 8,
      }}
    >
      {blockTitle && (
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 4,
            color: "#111827",
            textTransform: "uppercase",
          }}
        >
          {blockTitle}
        </div>
      )}
      {blockDescription && (
        <div
          style={{
            color: "#6b7280",
            marginBottom: 6,
            lineHeight: 1.3,
            maxHeight: 32,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {blockDescription.slice(0, 60)}
          {blockDescription.length > 60 ? "…" : ""}
        </div>
      )}
      <div style={{ color: "#6b7280", fontSize: 11 }}>
        Form: Full Name, Email, Message · {email || "(no email)"}
      </div>
    </div>
  );
}
