/**
 * Sanitize strings embedded in `<style>` as CSS custom property values (--x: VALUE).
 * Prevents breaking out of the rule or injecting extra declarations.
 */
const DANGEROUS_SUBSTRINGS =
  /[{<>}\\]|url\s*\(|expression\s*\(|behavior\s*:|javascript\s*:|@import|<\/?style/i;

/**
 * Allowed characters for typical length expressions: clamp(), calc(), var(), rem, vw, etc.
 */
const ALLOWED_CHARS = /^[a-zA-Z0-9%.,+\-\/\s()*_:#]+$/;

const MAX_LEN = 240;

export function sanitizeCssCustomPropertyValue(
  value: string | undefined,
  fallback: string,
): string {
  const v = (value ?? "").trim();
  if (!v || v.length > MAX_LEN) return fallback;
  if (DANGEROUS_SUBSTRINGS.test(v)) return fallback;
  if (!ALLOWED_CHARS.test(v)) return fallback;
  return v;
}
