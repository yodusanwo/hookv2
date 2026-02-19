import "server-only";

type ShopifyFetchOptions<TVariables> = {
  query: string;
  variables?: TVariables;
  headers?: Record<string, string>;
  next?: RequestInit["next"];
  cache?: RequestCache;
};

function normalizeShopifyDomain(domain: string): string {
  // Accept values like:
  // - "your-store.myshopify.com"
  // - "https://your-store.myshopify.com"
  // - "your-store.myshopify.com/"
  return domain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

const SHOPIFY_STORE_DOMAIN = normalizeShopifyDomain(
  process.env.SHOPIFY_STORE_DOMAIN || ""
);
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

function getStorefrontUrl(): string {
  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

export async function shopifyFetch<TData, TVariables = Record<string, unknown>>(
  options: ShopifyFetchOptions<TVariables>
): Promise<TData> {
  if (!SHOPIFY_STORE_DOMAIN) {
    throw new Error(
      [
        "Missing SHOPIFY_STORE_DOMAIN.",
        "Set it in `.env.local` (example: `your-store.myshopify.com`).",
      ].join(" ")
    );
  }

  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      [
        "Missing SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
        "Create a Storefront API access token in Shopify Admin → Apps → Develop apps → (your app) → Storefront API,",
        "enable Storefront API access + grant product read scopes, then put the token in `.env.local`.",
      ].join(" ")
    );
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...options.headers,
  };

  headers["x-shopify-storefront-access-token"] =
    SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  const res = await fetch(getStorefrontUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: options.query,
      variables: options.variables ?? {},
    }),
    cache: options.cache,
    next: options.next,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Shopify Storefront API request failed (${res.status} ${res.statusText}) for ${SHOPIFY_STORE_DOMAIN} (api ${SHOPIFY_API_VERSION}). ${body}`.trim()
    );
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${json.errors
        .map((e: { message?: string }) => e.message ?? "")
        .join("; ")}`
    );
  }

  if (!json.data) {
    throw new Error("Shopify Storefront API returned no data.");
  }

  return json.data;
}
