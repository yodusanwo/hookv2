import { shopifyFetch } from "@/lib/shopify";
import { AddToCart } from "@/app/components/AddToCart";

type ProductByHandleResponse = {
  productByHandle: {
    id: string;
    title: string;
    description: string;
    descriptionHtml: string;
    featuredImage: { url: string; altText: string | null } | null;
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    options: Array<{ name: string; values: string[] }>;
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
          price: { amount: string; currencyCode: string };
        };
      }>;
    };
  } | null;
};

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      featuredImage { url altText }
      images(first: 10) { edges { node { url altText } } }
      options { name values }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions { name value }
            price { amount currencyCode }
          }
        }
      }
    }
  }
`;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const data = await shopifyFetch<ProductByHandleResponse, { handle: string }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    cache: "no-store",
  });

  const product = data.productByHandle;
  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-2xl font-semibold text-slate-900">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We couldn’t find a product with handle <code>{handle}</code>.
        </p>
      </main>
    );
  }

  const images = [
    product.featuredImage ? product.featuredImage : null,
    ...product.images.edges.map((e) => e.node),
  ].filter(Boolean) as Array<{ url: string; altText: string | null }>;

  const variants = product.variants.edges.map((e) => e.node);

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Images */}
          <div>
            <div className="overflow-hidden rounded-xl bg-slate-100">
              <img
                src={images[0]?.url}
                alt={images[0]?.altText ?? product.title}
                className="h-[380px] w-full object-cover md:h-[520px]"
              />
            </div>
            {images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {images.slice(1, 5).map((img) => (
                  <div
                    key={img.url}
                    className="aspect-square overflow-hidden rounded-lg bg-slate-100"
                  >
                    <img
                      src={img.url}
                      alt={img.altText ?? product.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Info */}
          <div className="max-w-xl">
            <div className="text-xs font-semibold tracking-wide text-slate-500">
              Product
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {product.title}
            </h1>

            <div className="mt-5">
              <AddToCart
                productTitle={product.title}
                options={product.options}
                variants={variants}
              />
            </div>

            {product.description ? (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-slate-900">
                  Description
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {product.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

