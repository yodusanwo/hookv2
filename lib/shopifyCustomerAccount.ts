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
}): Promise<{
  access_token: string;
  id_token?: string;
  expires_in?: number;
  refresh_token?: string;
} | null> {
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
    refresh_token?: string;
  };
  if (!data?.access_token) return null;
  return {
    access_token: data.access_token,
    id_token: typeof data.id_token === "string" ? data.id_token : undefined,
    expires_in: typeof data.expires_in === "number" ? data.expires_in : undefined,
    refresh_token: typeof data.refresh_token === "string" ? data.refresh_token : undefined,
  };
}

/** Public (PKCE) client refresh — no client_secret. See https://shopify.dev/docs/api/customer/latest#use-refresh-token */
export async function refreshCustomerAccessToken(refreshToken: string): Promise<{
  access_token: string;
  id_token?: string;
  expires_in?: number;
  refresh_token?: string;
} | null> {
  const config = await getOpenIdConfig();
  if (!config?.token_endpoint) return null;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
  });
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "HookPoint-Headless/1.0",
  };
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    headers.Origin = site.startsWith("http") ? site.replace(/\/+$/, "") : `https://${site.replace(/\/+$/, "")}`;
  }
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
    refresh_token?: string;
  };
  if (!data?.access_token) return null;
  return {
    access_token: data.access_token,
    id_token: typeof data.id_token === "string" ? data.id_token : undefined,
    expires_in: typeof data.expires_in === "number" ? data.expires_in : undefined,
    refresh_token: typeof data.refresh_token === "string" ? data.refresh_token : undefined,
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

/** Profile only — separate from orders so email/name permission issues don’t block order list. */
const CUSTOMER_PROFILE_QUERY = `query CustomerProfile {
  customer {
    firstName
    lastName
    emailAddress {
      emailAddress
    }
  }
}`;

/**
 * Orders only on Customer Account API — no Storefront `totalPriceSet` / `status`.
 */
const CUSTOMER_ORDERS_QUERY = `query CustomerOrders {
  customer {
    orders(first: 50, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          cancelledAt
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

/** Ultra-minimal retry if the primary query returns GraphQL errors (field-level debugging). */
const CUSTOMER_ORDERS_QUERY_MINIMAL = `query CustomerOrdersMinimal {
  customer {
    orders(first: 50, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 10) {
            edges {
              node {
                name
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
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: { emailAddress: string } | null;
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          createdAt: string;
          cancelledAt?: string | null;
          totalPrice: { amount: string; currencyCode: string } | null;
          lineItems: {
            edges: Array<{
              node: {
                name: string;
                variantTitle?: string | null;
                title?: string;
                quantity: number;
              };
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

type PostGraphqlResult =
  | { ok: true; data: CustomerOrdersResult | null }
  | { ok: false; hint: string };

/** Shopify’s Customer Account GraphQL examples use the raw access token (no `Bearer ` prefix). Retry with Bearer on 401. */
async function postCustomerOrdersGraphql(
  graphqlUrl: string,
  accessToken: string,
  query: string,
): Promise<PostGraphqlResult> {
  const attempt = async (authorization: string): Promise<PostGraphqlResult> => {
    const res = await fetch(graphqlUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        "User-Agent": "HookPoint-Headless/1.0",
      },
      body: JSON.stringify({ query }),
    });
    const text = await res.text();
    let json: { data?: CustomerOrdersResult; errors?: unknown[] };
    try {
      json = JSON.parse(text) as { data?: CustomerOrdersResult; errors?: unknown[] };
    } catch {
      return {
        ok: false,
        hint: `Non-JSON response (HTTP ${res.status}): ${text.slice(0, 500)}`,
      };
    }
    if (!res.ok) {
      return { ok: false, hint: `HTTP ${res.status}: ${text.slice(0, 800)}` };
    }
    const hasOrdersData = json.data?.customer?.orders != null;
    if (json.errors?.length) {
      if (hasOrdersData) {
        console.warn(
          "[Customer Account API] GraphQL partial errors (orders still returned):",
          JSON.stringify(json.errors).slice(0, 600),
        );
        return { ok: true, data: json.data ?? null };
      }
      return {
        ok: false,
        hint: `GraphQL errors: ${JSON.stringify(json.errors).slice(0, 1000)}`,
      };
    }
    return { ok: true, data: json.data ?? null };
  };

  let out = await attempt(accessToken);
  if (!out.ok && out.hint.startsWith("HTTP 401")) {
    console.warn("[Customer Account API] Retrying GraphQL with Bearer prefix after 401");
    out = await attempt(`Bearer ${accessToken}`);
  }
  if (!out.ok) {
    console.error("[Customer Account API]", out.hint);
  }
  return out;
}

async function postCustomerProfileGraphql(
  graphqlUrl: string,
  accessToken: string,
): Promise<{
  firstName: string | null;
  lastName: string | null;
  emailAddress: { emailAddress: string } | null;
} | null> {
  const run = (auth: string) =>
    fetch(graphqlUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
        "User-Agent": "HookPoint-Headless/1.0",
      },
      body: JSON.stringify({ query: CUSTOMER_PROFILE_QUERY }),
    });
  let res = await run(accessToken);
  let text = await res.text();
  if (res.status === 401) {
    res = await run(`Bearer ${accessToken}`);
    text = await res.text();
  }
  try {
    const json = JSON.parse(text) as {
      data?: {
        customer: {
          firstName: string | null;
          lastName: string | null;
          emailAddress: { emailAddress: string } | null;
        } | null;
      };
      errors?: unknown[];
    };
    if (!res.ok || json.errors?.length) return null;
    return json.data?.customer ?? null;
  } catch {
    return null;
  }
}

async function mergeOrdersWithProfile(
  graphqlUrl: string,
  accessToken: string,
  ordersPayload: CustomerOrdersResult | null,
): Promise<CustomerOrdersResult | null> {
  const orders = ordersPayload?.customer?.orders;
  if (!orders) return ordersPayload;
  const profile = await postCustomerProfileGraphql(graphqlUrl, accessToken);
  return {
    customer: {
      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null,
      emailAddress: profile?.emailAddress ?? null,
      orders,
    },
  };
}

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

  const url = apiConfig.graphql_api;

  const primary = await postCustomerOrdersGraphql(url, accessToken, CUSTOMER_ORDERS_QUERY);
  if (primary.ok) {
    const merged = await mergeOrdersWithProfile(url, accessToken, primary.data);
    return { data: merged, loadFailed: false };
  }

  const minimal = await postCustomerOrdersGraphql(url, accessToken, CUSTOMER_ORDERS_QUERY_MINIMAL);
  if (minimal.ok && minimal.data?.customer?.orders) {
    const merged = await mergeOrdersWithProfile(url, accessToken, minimal.data);
    return { data: merged, loadFailed: false };
  }

  return {
    data: null,
    loadFailed: true,
    devHint: primary.hint,
  };
}

export async function fetchCustomerOrders(accessToken: string): Promise<CustomerOrdersResult | null> {
  const { data, loadFailed } = await fetchCustomerOrdersWithOutcome(accessToken);
  return loadFailed ? null : data;
}

export function isCustomerAccountConfigured(): boolean {
  return Boolean(SHOPIFY_STORE_DOMAIN && CLIENT_ID);
}

/**
 * Headless OAuth (`/auth/login`, embedded `/account`) vs links to Customer Accounts portal only.
 * Set `NEXT_PUBLIC_USE_HEADLESS_CUSTOMER_ACCOUNT=false` to test `account.hookpointfish.com` without removing `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`. Redeploy after changing.
 */
export function isHeadlessCustomerAccountEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_USE_HEADLESS_CUSTOMER_ACCOUNT?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return isCustomerAccountConfigured();
}

export function getRedirectUri(origin: string): string {
  return `${origin}/auth/callback`;
}
