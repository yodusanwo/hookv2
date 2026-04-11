import { NextResponse } from "next/server";
import {
  getOpenIdConfig,
  buildLogoutUrl,
} from "@/lib/shopifyCustomerAccount";
import {
  clearAccessTokenCookie,
  clearAccessTokenExpiryCookie,
  clearRefreshTokenCookie,
  clearIdTokenCookie,
  getIdTokenFromRequest,
  getPreferredRedirectOrigin,
} from "@/lib/authCookie";
import { HEADLESS_STOREFRONT_URL } from "@/lib/customerAccountPortal";

/** OIDC logout per https://shopify.dev/docs/api/customer/latest#logging-out ; allowlist `{origin}/auth/post-logout` in Shopify Admin. */
export async function GET(request: Request) {
  const origin = getPreferredRedirectOrigin(request);
  const postLogout = `${origin}/auth/post-logout`;
  const idToken = getIdTokenFromRequest(request);
  const config = await getOpenIdConfig();

  const clearLocal = [
    clearAccessTokenCookie(),
    clearAccessTokenExpiryCookie(),
    clearRefreshTokenCookie(),
    clearIdTokenCookie(),
  ];

  if (idToken && config?.end_session_endpoint) {
    const logoutUrl = buildLogoutUrl({
      endSessionEndpoint: config.end_session_endpoint,
      idTokenHint: idToken,
      postLogoutRedirectUri: postLogout,
    });
    const res = NextResponse.redirect(logoutUrl);
    for (const c of clearLocal) res.headers.append("Set-Cookie", c);
    return res;
  }

  const home = new URL("/", HEADLESS_STOREFRONT_URL).toString();
  const res = NextResponse.redirect(home);
  for (const c of clearLocal) res.headers.append("Set-Cookie", c);
  return res;
}
