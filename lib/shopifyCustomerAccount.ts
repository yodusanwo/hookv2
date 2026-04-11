import "server-only";
import crypto from "crypto";

const SHOPIFY_STORE_DOMAIN = (process.env.SHOPIFY_STORE_DOMAIN ?? "")
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ?? "";

export type OpenIdConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
};

export type CustomerAccountApiConfig = {
  graphql_api: string;
};

export async function getOpenIdConfig(): Promise<OpenIdConfig | null> {
  if (!SHOPIFY_STORE_DOMAIN) return null;
  const url = `https://${SHOPIFY_STORE_DOMAIN}/.well-known/openid-configuration`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getCustomerAccountApiConfig(): Promise<CustomerAccountApiConfig | null> {
  if (!SHOPIFY_STORE_DOMAIN) return null;
  const url = `https://${SHOPIFY_STORE_DOMAIN}/.well-known/customer-account-api`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function generateState(): string {
  return crypto.randomBytes(16).toString("base64url");
}

export function generateNonce(): string {
  return crypto.randomBytes(16).toString("base64url");
}

export function buildAuthorizationUrl(params: {
  authorizationEndpoint: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const { authorizationEndpoint, redirectUri, state, nonce, codeChallenge } = params;
  const url = new URL(authorizationEndpoint);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeCodeForToken(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  origin?: string;
}): Promise<{ access_token: string; id_token?: string; expires_in?: number } | null> {
  const config = await getOpenIdConfig();
  if (!config?.token_endpoint) return null;
  const { code, codeVerifier, redirectUri, origin } = params;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "HookPoint-Headless/1.0",
  };
  if (origin) headers["Origin"] = origin;
  const res = await fetch(config.token_endpoint, {
    method: "POST",
    headers,
    body: body.toString(),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    access_token?: string;
    id_token?: string;
    expires_in?: number;
  };
  if (!data?.access_token) return null;
  return {
    access_token: data.access_token,
    id_token: typeof data.id_token === "string" ? data.id_token : undefined,
    expires_in: data.expires_in,
  };
}

/**
 * Build Shopify OIDC logout URL per
 * https://shopify.dev/docs/api/customer/latest#logging-out
 */
export function buildLogoutUrl(params: {
  endSessionEndpoint: string;
  idTokenHint: string;
  postLogoutRedirectUri: string;
}): string {
  const url = new URL(params.endSessionEndpoint);
  url.searchParams.set("id_token_hint", params.idTokenHint);
  url.searchParams.set("post_logout_redirect_uri", params.postLogoutRedirectUri);
  return url.toString();
}

/** Customer Account API Order uses `totalPrice` (MoneyV2), not Storefront-style `totalPriceSet` / `status`. */
const CUSTOMER_ORDERS_QUERY = `query CustomerOrders {
  customer {
    firstName
    lastName
    emailAddress {
      emailAddress
    }
    orders(first: 50, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          cancelledAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 10) {
            edges {
              node {
                name
                variantTitle
                title
                quantity
              }
            }
          }
        }
      }
    }
  }
}`;

export type CustomerOrdersResult = {
  customer: {
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          createdAt: string;
          cancelledAt: string | null;
          financialStatus: string | null;
          fulfillmentStatus: string | null;
          totalPrice: { amount: string; currencyCode: string } | null;
          lineItems: {
            edges: Array<{
              node: { name: string; variantTitle: string | null; title: string; quantity: number };
            }>;
          };
        };
      }>;
    };
  } | null;
};

export type CustomerOrdersFetchOutcome = {
  data: CustomerOrdersResult | null;
  /** Config missing, HTTP error, or GraphQL errors — distinct from an empty order list. */
  loadFailed: boolean;
  /** Safe to log in dev only (no tokens). */
  devHint?: string;
};

export async function fetchCustomerOrdersWithOutcome(
  accessToken: string,
): Promise<CustomerOrdersFetchOutcome> {
  const apiConfig = await getCustomerAccountApiConfig();
  if (!apiConfig?.graphql_api) {
    const hint =
      "No graphql_api from /.well-known/customer-account-api — check SHOPIFY_STORE_DOMAIN and discovery.";
    console.error("[Customer Account API]", hint);
    return {
      data: null,
      loadFailed: true,
      devHint: hint,
    };
  }
  const res = await fetch(apiConfig.graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "HookPoint-Headless/1.0",
    },
    body: JSON.stringify({ query: CUSTOMER_ORDERS_QUERY }),
  });
  if (!res.ok) {
    const hint = `GraphQL request failed with HTTP ${res.status}. Token may be expired or rejected.`;
    console.error("[Customer Account API]", hint);
    return {
      data: null,
      loadFailed: true,
      devHint: hint,
    };
  }
  const json = (await res.json()) as { data?: CustomerOrdersResult; errors?: unknown[] };
  if (json.errors?.length) {
    const hint = `GraphQL errors: ${JSON.stringify(json.errors).slice(0, 800)}`;
    console.error("[Customer Account API] orders query failed:", hint);
    return {
      data: null,
      loadFailed: true,
      devHint: hint,
    };
  }
  return { data: json.data ?? null, loadFailed: false };
}

export async function fetchCustomerOrders(accessToken: string): Promise<CustomerOrdersResult | null> {
  const { data, loadFailed } = await fetchCustomerOrdersWithOutcome(accessToken);
  return loadFailed ? null : data;
}

export function isCustomerAccountConfigured(): boolean {
  return Boolean(SHOPIFY_STORE_DOMAIN && CLIENT_ID);
}

export function getRedirectUri(origin: string): string {
  return `${origin}/auth/callback`;
}
