import { NextResponse } from "next/server";
import {
  getOpenIdConfig,
  buildLogoutUrl,
} from "@/lib/shopifyCustomerAccount";
import {
  clearAccessTokenCookie,
  clearIdTokenCookie,
  getIdTokenFromRequest,
  getOriginFromRequest,
} from "@/lib/authCookie";

/**
 * Per https://shopify.dev/docs/api/customer/latest#logging-out :
 * redirect to end_session_endpoint with id_token_hint + post_logout_redirect_uri.
 * Add post_logout URL to Headless → Customer Account API → Logout URI(s).
 */
export async function GET(request: Request) {
  const origin = getOriginFromRequest(request);
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

  const res = NextResponse.redirect(new URL("/account", origin));
  for (const c of clearLocal) res.headers.append("Set-Cookie", c);
  return res;
}
