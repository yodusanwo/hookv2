import "server-only";
import crypto from "crypto";

const COOKIE_NAME = "shopify_oauth_pkce";
const MAX_AGE = 60 * 10; // 10 minutes
const SECRET = process.env.AUTH_COOKIE_SECRET || process.env.CRYPTO_SECRET || "dev-secret-change-in-production";

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

function getOriginFromRequest(request: Request): string {
  const url = new URL(request.url);
  return url.origin;
}

/** Prefer canonical site URL for auth redirects so Shopify sends users back to this app, not the theme. */
export function getPreferredRedirectOrigin(request: Request): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const u = explicit.replace(/\/+$/, "");
    return u.startsWith("http") ? u : `https://${u}`;
  }
  // Production: use Vercel URL so redirect_uri is always the deployed app (required for Shopify Callback URI)
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }
  return getOriginFromRequest(request);
}

export type PkcePayload = { state: string; code_verifier: string };

export function setPkceCookie(payload: PkcePayload, origin: string): string {
  const value = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(value);
  const cookie = `${value}.${signature}`;
  const isSecure = origin.startsWith("https");
  return `${COOKIE_NAME}=${cookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${isSecure ? "; Secure" : ""}`;
}

export function getPkceCookie(cookieHeader: string | null): PkcePayload | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const raw = match?.[1];
  if (!raw) return null;
  const [value, sig] = raw.split(".");
  if (!value || !sig || sign(value) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as PkcePayload;
    if (typeof payload?.state === "string" && typeof payload?.code_verifier === "string") return payload;
  } catch {
    // ignore
  }
  return null;
}

export function clearPkceCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

const ACCESS_TOKEN_COOKIE = "shopify_customer_token";
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setAccessTokenCookie(token: string, origin: string): string {
  const isSecure = origin.startsWith("https");
  return `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ACCESS_TOKEN_MAX_AGE}${isSecure ? "; Secure" : ""}`;
}

export function getAccessTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${ACCESS_TOKEN_COOKIE}=([^;]+)`));
  const raw = match?.[1];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

/** For use in Server Components with next/headers cookies(). */
export function getAccessTokenFromCookies(cookieStore: { get: (name: string) => { value: string } | undefined }): string | null {
  const c = cookieStore.get(ACCESS_TOKEN_COOKIE);
  if (!c?.value) return null;
  try {
    return decodeURIComponent(c.value);
  } catch {
    return null;
  }
}

export function clearAccessTokenCookie(): string {
  return `${ACCESS_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

const REFRESH_TOKEN_COOKIE = "shopify_customer_refresh";
const ACCESS_EXPIRES_COOKIE = "shopify_customer_at_exp";

/** Unix **seconds** when the access token expires (from OAuth `expires_in`). */
export function setAccessTokenExpiryCookie(expiresInSeconds: number, origin: string): string {
  const exp = Math.floor(Date.now() / 1000) + Math.max(60, expiresInSeconds);
  const isSecure = origin.startsWith("https");
  return `${ACCESS_EXPIRES_COOKIE}=${exp}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ACCESS_TOKEN_MAX_AGE}${isSecure ? "; Secure" : ""}`;
}

export function setRefreshTokenCookie(refreshToken: string, origin: string): string {
  const isSecure = origin.startsWith("https");
  return `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ACCESS_TOKEN_MAX_AGE}${isSecure ? "; Secure" : ""}`;
}

export function getRefreshTokenFromCookies(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): string | null {
  const c = cookieStore.get(REFRESH_TOKEN_COOKIE);
  if (!c?.value) return null;
  try {
    return decodeURIComponent(c.value);
  } catch {
    return null;
  }
}

export function getRefreshTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${REFRESH_TOKEN_COOKIE}=([^;]+)`));
  const raw = match?.[1];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

/** Access token expiry as Unix seconds, or null if unknown (legacy sessions). */
export function getAccessTokenExpiresFromCookies(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): number | null {
  const c = cookieStore.get(ACCESS_EXPIRES_COOKIE);
  if (!c?.value) return null;
  const n = parseInt(c.value, 10);
  return Number.isFinite(n) ? n : null;
}

export function clearRefreshTokenCookie(): string {
  return `${REFRESH_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function clearAccessTokenExpiryCookie(): string {
  return `${ACCESS_EXPIRES_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/** id_token from token response — required for Shopify end_session logout. */
const ID_TOKEN_COOKIE = "shopify_customer_id_token";

export function setIdTokenCookie(idToken: string, origin: string): string {
  const isSecure = origin.startsWith("https");
  return `${ID_TOKEN_COOKIE}=${encodeURIComponent(idToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ACCESS_TOKEN_MAX_AGE}${isSecure ? "; Secure" : ""}`;
}

export function getIdTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${ID_TOKEN_COOKIE}=([^;]+)`));
  const raw = match?.[1];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export function clearIdTokenCookie(): string {
  return `${ID_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { getOriginFromRequest };
