import { NextResponse } from "next/server";
import {
  getOpenIdConfig,
  buildLogoutUrl,
} from "@/lib/shopifyCustomerAccount";
import {
  clearAccessTokenCookie,
  clearIdTokenCookie,
  getIdTokenFromRequest,
  getPreferredRedirectOrigin,
} from "@/lib/authCookie";
import { HEADLESS_STOREFRONT_URL } from "@/lib/customerAccountPortal";

/**
 * Per https://shopify.dev/docs/api/customer/latest#logging-out :
 * redirect to end_session_endpoint with id_token_hint + post_logout_redirect_uri.
 * Add post_logout URL to Headless → Customer Account API → Logout URI(s).
 * Uses NEXT_PUBLIC_SITE_URL when set so redirect always goes to your app (e.g. hookv2.vercel.app), not the Shopify theme.
 */
export async function GET(request: Request) {
  const origin = getPreferredRedirectOrigin(request);
  const postLogout = `${origin}/auth/post-logout`;
  const idToken = getIdTokenFromRequest(request);
  const config = await getOpenIdConfig();

  const clearLocal = [clearAccessTokenCookie(), clearIdTokenCookie()];

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
