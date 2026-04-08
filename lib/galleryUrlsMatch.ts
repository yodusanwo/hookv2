/**
 * Compare Shopify CDN image URLs for the same asset (ignore query params like width/quality).
 */
export function galleryUrlsMatch(a: string, b: string): boolean {
  try {
    const x = new URL(a);
    const y = new URL(b);
    return x.origin + x.pathname === y.origin + y.pathname;
  } catch {
    return a.split("?")[0] === b.split("?")[0];
  }
}
