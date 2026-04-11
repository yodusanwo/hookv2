import { NextResponse } from "next/server";
import { exchangeCodeForToken, getRedirectUri } from "@/lib/shopifyCustomerAccount";
import {
  getPkceCookie,
  setAccessTokenCookie,
  setIdTokenCookie,
  clearPkceCookie,
  getPreferredRedirectOrigin,
} from "@/lib/authCookie";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const origin = getPreferredRedirectOrigin(request);
  const redirectUri = getRedirectUri(origin);

  function accountPageUrl(error?: string): URL {
    const u = new URL("/account", origin);
    if (error) u.searchParams.set("error", error);
    return u;
  }

  if (!code || !state) {
    const res = NextResponse.redirect(accountPageUrl("missing_params"));
    res.headers.append("Set-Cookie", clearPkceCookie());
    return res;
  }

  const payload = getPkceCookie(request.headers.get("cookie"));
  if (!payload || payload.state !== state) {
    const res = NextResponse.redirect(accountPageUrl("invalid_state"));
    res.headers.append("Set-Cookie", clearPkceCookie());
    return res;
  }

  const tokenResult = await exchangeCodeForToken({
    code,
    codeVerifier: payload.code_verifier,
    redirectUri,
    origin,
  });

  const res = NextResponse.redirect(accountPageUrl());
  res.headers.append("Set-Cookie", clearPkceCookie());
  if (tokenResult?.access_token) {
    res.headers.append("Set-Cookie", setAccessTokenCookie(tokenResult.access_token, origin));
    if (tokenResult.id_token) {
      res.headers.append("Set-Cookie", setIdTokenCookie(tokenResult.id_token, origin));
    }
  } else {
    const errRes = NextResponse.redirect(accountPageUrl("token_exchange"));
    errRes.headers.append("Set-Cookie", clearPkceCookie());
    return errRes;
  }
  return res;
}
