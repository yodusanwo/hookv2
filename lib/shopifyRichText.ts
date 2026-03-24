import {
  convertSchemaToHtml,
  type Schema,
} from "@thebeyondgroup/shopify-rich-text-renderer";

const TITLE_BLOCK_TYPES = new Set(["paragraph", "heading"]);

function plainTextFromRichTextNode(node: unknown): string {
  if (node == null || typeof node !== "object") return "";
  const n = node as { type?: string; value?: string; children?: unknown[] };
  if (n.type === "text" && typeof n.value === "string") return n.value;
  if (Array.isArray(n.children)) {
    return n.children.map(plainTextFromRichTextNode).join("");
  }
  return "";
}

export type WhatYouGetSplit = {
  /** First line/block used as the section heading; null means use default “What You Get”. */
  sectionTitle: string | null;
  /** Remaining metafield value to render (rich text JSON or plain text). */
  bodyValue: string | null;
};

/**
 * Splits the `what_you_get` metafield so the first line/block can replace the default section title.
 * - Rich text: uses the first paragraph or heading as the title only when there is at least one more block after it.
 * - Plain text: uses the first line as the title only when there is at least one more line.
 */
export function splitWhatYouGetMetafield(
  value: string | null | undefined,
): WhatYouGetSplit {
  if (!value?.trim()) {
    return { sectionTitle: null, bodyValue: null };
  }
  const trimmed = value.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const lines = trimmed.split(/\r?\n/);
    if (lines.length >= 2) {
      const title = lines[0].trim();
      const rest = lines.slice(1).join("\n").trim();
      if (title) {
        return { sectionTitle: title, bodyValue: rest || null };
      }
    }
    return { sectionTitle: null, bodyValue: trimmed };
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { type?: string }).type !== "root"
  ) {
    return { sectionTitle: null, bodyValue: trimmed };
  }

  const root = parsed as { type: "root"; children?: unknown[] };
  const children = root.children;
  if (!Array.isArray(children) || children.length < 2) {
    return { sectionTitle: null, bodyValue: trimmed };
  }

  const first = children[0];
  const firstType = (first as { type?: string })?.type;
  if (!firstType || !TITLE_BLOCK_TYPES.has(firstType)) {
    return { sectionTitle: null, bodyValue: trimmed };
  }

  const titleText = plainTextFromRichTextNode(first).trim();
  if (!titleText) {
    return { sectionTitle: null, bodyValue: trimmed };
  }

  const restChildren = children.slice(1);
  const restRoot = { ...root, children: restChildren };
  return {
    sectionTitle: titleText,
    bodyValue: JSON.stringify(restRoot),
  };
}

/**
 * Renders Shopify rich text metafield value to HTML.
 * The Storefront API returns rich_text_field values as a JSON string (AST).
 * If the value is not valid rich text JSON, returns null so the caller can fall back to plain text.
 */
export function renderShopifyRichText(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || !("type" in parsed)) {
    return null;
  }
  const schema = parsed as { type: string; children?: unknown[] };
  if (schema.type !== "root") return null;
  try {
    return convertSchemaToHtml(schema as Schema, {
      scoped: false,
      newLineToBreak: true,
      classes: {
        p: "mb-4 last:mb-0 text-[var(--Text-Color,#1E1E1E)]",
        ul: "list-disc list-inside mb-4 last:mb-0 text-[var(--Text-Color,#1E1E1E)]",
        ol: "list-decimal list-inside mb-4 last:mb-0 text-[var(--Text-Color,#1E1E1E)]",
        li: "text-sm leading-6 text-[var(--Text-Color,#1E1E1E)]",
        a: "underline hover:opacity-80 text-[var(--Text-Color,#1E1E1E)]",
        strong: "font-semibold text-[var(--Text-Color,#1E1E1E)]",
        em: "italic text-[var(--Text-Color,#1E1E1E)]",
      },
    });
  } catch {
    return null;
  }
}
