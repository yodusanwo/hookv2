import {
  convertSchemaToHtml,
  type Schema,
} from "@thebeyondgroup/shopify-rich-text-renderer";

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
