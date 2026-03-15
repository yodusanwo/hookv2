/**
 * Optional Shopify metafield used for /shop page filter (e.g. Category metafield "Seafood type").
 * Set in env to use a metafield instead of productType for filtering.
 *
 * In Shopify Admin: Settings > Custom data > Products to find namespace and key.
 * For Category metafields (e.g. "Seafood type"), expose them to the Storefront API
 * (Content > Metafields > Product > [your metafield] > Storefront API access).
 */

/** Escapes a string for safe use inside a GraphQL double-quoted string literal. */
function escapeGraphQLString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const NS = process.env.NEXT_PUBLIC_SHOPIFY_FILTER_METAFIELD_NAMESPACE ?? "";
const KEY = process.env.NEXT_PUBLIC_SHOPIFY_FILTER_METAFIELD_KEY ?? "";

export function getFilterMetafieldConfig(): { namespace: string; key: string } | null {
  const namespace = NS.trim();
  const key = KEY.trim();
  if (namespace && key) return { namespace, key };
  return null;
}

/** Returns escaped namespace and key for safe interpolation into GraphQL. */
export function getFilterMetafieldConfigEscaped(): { namespace: string; key: string } | null {
  const meta = getFilterMetafieldConfig();
  if (!meta) return null;
  return {
    namespace: escapeGraphQLString(meta.namespace),
    key: escapeGraphQLString(meta.key),
  };
}
