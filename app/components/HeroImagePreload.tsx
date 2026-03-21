/**
 * Hints the browser to fetch the LCP hero image early. Safe to render in a Server Component;
 * Next.js App Router hoists `<link rel="preload">` to the document head when possible.
 */
export function HeroImagePreload({ href }: { href: string | null | undefined }) {
  if (!href?.trim()) return null;
  return (
    <link rel="preload" as="image" href={href.trim()} fetchPriority="high" />
  );
}
