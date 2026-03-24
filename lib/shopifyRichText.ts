import {
  convertSchemaToHtml,
  type Schema,
} from "@thebeyondgroup/shopify-rich-text-renderer";

const TITLE_BLOCK_TYPES = new Set(["paragraph", "heading"]);

function isTitleBlockType(type: string | undefined): boolean {
  if (!type) return false;
  return TITLE_BLOCK_TYPES.has(type.toLowerCase());
}

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
  if (!Array.isArray(children) || children.length === 0) {
    return { sectionTitle: null, bodyValue: trimmed };
  }

  /** Two+ top-level blocks: first paragraph/heading = section title, rest = body. */
  if (children.length >= 2) {
    const first = children[0];
    const firstType = (first as { type?: string })?.type;
    if (isTitleBlockType(firstType)) {
      const titleText = plainTextFromRichTextNode(first).trim();
      if (titleText) {
        const restRoot = { ...root, children: children.slice(1) };
        return {
          sectionTitle: titleText,
          bodyValue: JSON.stringify(restRoot),
        };
      }
    }
  }

  /** Single block — common Shopify patterns that don’t use a second top-level node. */
  if (children.length === 1) {
    const only = children[0];
    const onlyType = (only as { type?: string })?.type?.toLowerCase();

    /** “Perfect for:” as first bullet, real bullets follow (one list, multiple items). */
    if (onlyType === "list") {
      const listNode = only as {
        type: "list";
        listType?: string;
        children?: unknown[];
      };
      const items = (listNode.children ?? []).filter(
        (c) => (c as { type?: string }).type === "list-item",
      );
      if (items.length >= 2) {
        const titleText = plainTextFromRichTextNode(items[0]).trim();
        if (titleText) {
          const restRoot = {
            type: "root" as const,
            children: [
              {
                type: "list",
                listType: listNode.listType ?? "bullet",
                children: items.slice(1),
              },
            ],
          };
          return {
            sectionTitle: titleText,
            bodyValue: JSON.stringify(restRoot),
          };
        }
      }
    }

    /** One paragraph/heading with a title line then body (line breaks inside the block). */
    if (onlyType === "paragraph" || onlyType === "heading") {
      const full = plainTextFromRichTextNode(only).trim();
      const lines = full.split(/\r?\n/);
      if (lines.length >= 2) {
        const titleLine = lines[0].trim();
        const restText = lines.slice(1).join("\n").trim();
        if (titleLine && restText) {
          const restRoot = {
            type: "root" as const,
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", value: restText }],
              },
            ],
          };
          return {
            sectionTitle: titleLine,
            bodyValue: JSON.stringify(restRoot),
          };
        }
      }
    }
  }

  return { sectionTitle: null, bodyValue: trimmed };
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
        /** Outside markers + padding so wrapped lines align with first line, not under the bullet. */
        ul: "list-disc list-outside mb-4 last:mb-0 pl-5 text-[var(--Text-Color,#1E1E1E)]",
        ol: "list-decimal list-outside mb-4 last:mb-0 pl-5 text-[var(--Text-Color,#1E1E1E)]",
        li: "list-outside text-sm leading-6 text-[var(--Text-Color,#1E1E1E)]",
        a: "underline hover:opacity-80 text-[var(--Text-Color,#1E1E1E)]",
        strong: "font-semibold text-[var(--Text-Color,#1E1E1E)]",
        em: "italic text-[var(--Text-Color,#1E1E1E)]",
      },
    });
  } catch {
    return null;
  }
}
