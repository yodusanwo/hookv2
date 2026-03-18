import { NextResponse } from "next/server";
import {
  getOpenIdConfig,
  buildAuthorizationUrl,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
  isCustomerAccountConfigured,
  getRedirectUri,
} from "@/lib/shopifyCustomerAccount";
import { setPkceCookie, getOriginFromRequest } from "@/lib/authCookie";

export async function GET(request: Request) {
  if (!isCustomerAccountConfigured()) {
    return NextResponse.redirect(new URL("/account", request.url));
  }
  const origin = getOriginFromRequest(request);
  const redirectUri = getRedirectUri(origin);
  const config = await getOpenIdConfig();
  if (!config?.authorization_endpoint) {
    return NextResponse.redirect(new URL("/account?error=auth_config", request.url));
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
