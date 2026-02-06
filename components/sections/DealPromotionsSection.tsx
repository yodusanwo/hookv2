import { DealProductCard, type DealProductCardProduct } from "@/app/components/DealProductCard";
import { shopifyFetch } from "@/lib/shopify";

type ProductRef = { shopifyHandle?: string };

type DealPromotionsBlock = {
  title?: string;
  description?: string;
  productRefs?: ProductRef[];
  maxProducts?: number;
  layout?: "grid" | "carousel";
};

type ProductsResponse = {
  products: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
        images: { edges: Array<{ node: { url: string; altText: string | null } }> };
        variants: { edges: Array<{ node: { id: string; availableForSale: boolean } }> };
      };
    }>;
  };
};

export async function DealPromotionsSection({ block }: { block: DealPromotionsBlock }) {
  const title = block.title ?? "Deal & Promotions";
  const description = block.description ?? "";
  const maxProducts = Math.min(12, Math.max(1, block.maxProducts ?? 6));
  const handles = (block.productRefs ?? [])
    .map((r) => r.shopifyHandle)
    .filter(Boolean) as string[];

  let products: ProductsResponse["products"]["edges"] = [];

  if (handles.length > 0) {
    try {
      const query = handles.map((h) => `handle:${h}`).join(" OR ");
      const data = await shopifyFetch<ProductsResponse>({
        query: `
          query GetProducts($query: String!, $first: Int!) {
            products(first: $first, query: $query) {
              edges {
                node {
                  id title handle
                  priceRange { minVariantPrice { amount currencyCode } }
                  images(first: 1) { edges { node { url altText } } }
                  variants(first: 1) { edges { node { id availableForSale } } }
                }
              }
            }
          }
        `,
        variables: { query, first: maxProducts },
      });
      products = data.products.edges.slice(0, maxProducts);
    } catch {
      // Don't fallback to random products—only show explicitly referenced products
    }
  }

  if (products.length === 0) return null;

  // Layout: top row 3 cards (385×221), bottom row up to 4 cards (285×221).
  const topRow = products.slice(0, 3);
  const bottomRow = products.slice(3, 7);

  function toCardProduct(edge: (typeof products)[0]): DealProductCardProduct {
    const p = edge.node;
    const img = p.images.edges[0]?.node;
    const variant = p.variants.edges[0]?.node;
    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      imageUrl: img?.url ?? null,
      price: p.priceRange.minVariantPrice.amount,
      currencyCode: p.priceRange.minVariantPrice.currencyCode,
      availableForSale: variant?.availableForSale ?? false,
      variantId: variant?.id ?? null,
    };
  }

  return (
    <section id="shop" className="py-14 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-semibold uppercase tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        <div className="mt-10 space-y-6">
          {/* Top row: 3 cards (385×221) */}
          {topRow.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {topRow.map((edge) => (
                <DealProductCard key={edge.node.id} product={toCardProduct(edge)} size="top" />
              ))}
            </div>
          )}

          {/* Bottom row: up to 4 cards (285×221) */}
          {bottomRow.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {bottomRow.map((edge) => (
                <DealProductCard key={edge.node.id} product={toCardProduct(edge)} size="bottom" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
