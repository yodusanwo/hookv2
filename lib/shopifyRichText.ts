import { convertSchemaToHtml } from "@thebeyondgroup/shopify-rich-text-renderer";

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
    return convertSchemaToHtml(parsed, {
      scoped: false,
      newLineToBreak: true,
      classes: {
        p: "mb-4 last:mb-0 text-slate-700",
        ul: "list-disc list-inside mb-4 last:mb-0 text-slate-700",
        ol: "list-decimal list-inside mb-4 last:mb-0 text-slate-700",
        li: "text-sm leading-6",
        a: "text-sky-700 underline hover:text-sky-800",
        strong: "font-semibold",
        em: "italic",
      },
    });
  } catch {
    return null;
  }
}
