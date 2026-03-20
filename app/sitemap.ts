import type { MetadataRoute } from "next";
import { shopifyFetch } from "@/lib/shopify";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://hookv2.vercel.app");

const PRODUCT_HANDLES_QUERY = `
  query ProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges { node { handle } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

type ProductHandlesQueryData = {
  products: {
    edges: Array<{ node: { handle: string } }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

async function getAllProductHandles(): Promise<string[]> {
  const handles: string[] = [];
  let after: string | null = null;
  const first = 250;
  try {
    for (;;) {
      const data: ProductHandlesQueryData = await shopifyFetch<ProductHandlesQueryData>({
        query: PRODUCT_HANDLES_QUERY,
        variables: { first, after },
        next: { revalidate: 3600 },
      });
      for (const edge of data.products.edges) {
        if (edge.node?.handle) handles.push(edge.node.handle);
      }
      if (!data.products.pageInfo.hasNextPage || !data.products.pageInfo.endCursor) break;
      after = data.products.pageInfo.endCursor;
    }
  } catch {
    // Shopify not configured or API error; sitemap still returns static routes
  }
  return handles;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/story`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/recipes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/basics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const productHandles = await getAllProductHandles();
  const productUrls: MetadataRoute.Sitemap = productHandles.map((handle) => ({
    url: `${baseUrl}/products/${handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productUrls];
}
