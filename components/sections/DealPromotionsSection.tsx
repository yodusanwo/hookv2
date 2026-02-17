import { DealProductCard, type DealProductCardProduct } from "@/app/components/DealProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { shopifyFetch } from "@/lib/shopify";

type ProductRef = { shopifyHandle?: string; featuredImageIndex?: number };

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

type ProductNode = ProductsResponse["products"]["edges"][number]["node"];

type ProductByHandleResponse = {
  product: ProductNode | null;
};

export async function DealPromotionsSection({
  block,
  sectionId = "deals",
  backgroundColor = "var(--brand-navy)",
}: {
  block: DealPromotionsBlock;
  sectionId?: string;
  backgroundColor?: string;
}) {
  const title = block.title ?? "Deal & Promotions";
  const description = block.description ?? "";
  const maxProducts = Math.min(12, Math.max(1, block.maxProducts ?? 6));
  const selections = (block.productRefs ?? [])
    .map((r) => {
      const handle = r.shopifyHandle?.trim();
      if (!handle) return null;
      const rawIndex = r.featuredImageIndex ?? 0;
      const featuredImageIndex = Number.isFinite(rawIndex)
        ? Math.max(0, Math.floor(rawIndex))
        : 0;
      return { handle, featuredImageIndex };
    })
    .filter((s): s is { handle: string; featuredImageIndex: number } => Boolean(s))
    .slice(0, maxProducts);
  const uniqueHandles = Array.from(new Set(selections.map((s) => s.handle)));

  let products: ProductsResponse["products"]["edges"] = [];

  if (uniqueHandles.length > 0) {
    try {
      const results = await Promise.all(
        uniqueHandles.map(async (handle) => {
          const data = await shopifyFetch<ProductByHandleResponse>({
            query: `
              query GetProductByHandle($handle: String!) {
                product(handle: $handle) {
                  id
                  title
                  handle
                  priceRange { minVariantPrice { amount currencyCode } }
                  images(first: 12) { edges { node { url altText } } }
                  variants(first: 1) { edges { node { id availableForSale } } }
                }
              }
            `,
            variables: { handle },
          });
          return { handle, product: data.product };
        })
      );

      const byHandle = new Map(
        results
          .filter((r): r is { handle: string; product: ProductNode } => Boolean(r.product))
          .map((r) => [r.handle, r.product] as const)
      );

      products = selections
        .map(({ handle, featuredImageIndex }) => {
          const product = byHandle.get(handle);
          if (!product) return null;
          const chosenImage =
            product.images.edges[featuredImageIndex] ?? product.images.edges[0];
          return {
            node: {
              ...product,
              images: { edges: chosenImage ? [chosenImage] : [] },
            },
          };
        })
        .filter((p): p is ProductsResponse["products"]["edges"][number] => Boolean(p));
    } catch {
      // Don't fallback to random products—only show explicitly referenced products
    }
  }

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

  const isLightBg =
    backgroundColor.toLowerCase() === "#ffffff" || backgroundColor.toLowerCase() === "white";
  return (
    <section id={sectionId} className="relative z-10 py-14" style={{ backgroundColor }}>
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme={isLightBg ? "light" : "dark"}
        />

        <div className="mt-10 space-y-6">
          {products.length === 0 ? (
            <p className={`text-center text-sm ${isLightBg ? "text-slate-500" : "text-slate-400"}`}>
              No products selected. Add products in Sanity Studio to display them here.
            </p>
          ) : (
            <>
          {/* Top row: 3 cards (385×221) */}
          {topRow.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {topRow.map((edge, idx) => (
                <DealProductCard key={`${edge.node.id}-top-${idx}`} product={toCardProduct(edge)} size="top" />
              ))}
            </div>
          )}

          {/* Bottom row: up to 4 cards (285×221) */}
          {bottomRow.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {bottomRow.map((edge, idx) => (
                <DealProductCard key={`${edge.node.id}-bottom-${idx}`} product={toCardProduct(edge)} size="bottom" />
              ))}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
