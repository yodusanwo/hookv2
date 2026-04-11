import { NextResponse } from "next/server";
import {
  getOpenIdConfig,
  buildAuthorizationUrl,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
  isHeadlessCustomerAccountEnabled,
  getRedirectUri,
} from "@/lib/shopifyCustomerAccount";
import { setPkceCookie, getPreferredRedirectOrigin } from "@/lib/authCookie";
import {
  CUSTOMER_ACCOUNT_ORDERS_URL,
  CUSTOMER_ACCOUNT_PORTAL_URL,
  getCustomerAccountPortalEntryUrl,
} from "@/lib/customerAccountPortal";

export async function GET(request: Request) {
  if (!isHeadlessCustomerAccountEnabled()) {
    return NextResponse.redirect(
      getCustomerAccountPortalEntryUrl() ?? CUSTOMER_ACCOUNT_ORDERS_URL,
    );
  }
  const origin = getPreferredRedirectOrigin(request);
  const redirectUri = getRedirectUri(origin);
  const config = await getOpenIdConfig();
  if (!config?.authorization_endpoint) {
    const u = new URL(CUSTOMER_ACCOUNT_PORTAL_URL);
    u.searchParams.set("error", "auth_config");
    return NextResponse.redirect(u);
  }
  const state = generateState();
  const nonce = generateNonce();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const authUrl = buildAuthorizationUrl({
    authorizationEndpoint: config.authorization_endpoint,
    redirectUri,
    state,
    nonce,
    codeChallenge,
  });
  const response = NextResponse.redirect(authUrl);
  response.headers.append("Set-Cookie", setPkceCookie({ state, code_verifier: codeVerifier }, origin));
  return response;
}
