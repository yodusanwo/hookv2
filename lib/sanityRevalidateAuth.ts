import { timingSafeEqual } from "node:crypto";

/** Minimum length for `SANITY_REVALIDATE_SECRET` (after trim). Use e.g. `openssl rand -hex 32`. */
export const MIN_SANITY_REVALIDATE_SECRET_LENGTH = 32;

export function isStrongRevalidateSecret(secret: string): boolean {
  return secret.trim().length >= MIN_SANITY_REVALIDATE_SECRET_LENGTH;
}

export type StoredRevalidateSecretResult =
  | { ok: true; value: string }
  | { ok: false; reason: "missing" | "weak" };

/**
 * Reads and validates the configured secret. Weak secrets are rejected so deploys fail closed.
 */
export function getStoredRevalidateSecret(): StoredRevalidateSecretResult {
  const raw = process.env.SANITY_REVALIDATE_SECRET;
  if (raw == null || raw.trim() === "") {
    return { ok: false, reason: "missing" };
  }
  const value = raw.trim();
  if (!isStrongRevalidateSecret(value)) {
    return { ok: false, reason: "weak" };
  }
  return { ok: true, value };
}

export function getProvidedRevalidateSecret(request: Request): string | null {
  const q = new URL(request.url).searchParams.get("secret");
  if (q && q.length > 0) return q;
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    if (t.length > 0) return t;
  }
  return null;
}

export function safeEqualRevalidateSecret(
  provided: string,
  stored: string,
): boolean {
  const a = Buffer.from(provided.trim(), "utf8");
  const b = Buffer.from(stored, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
