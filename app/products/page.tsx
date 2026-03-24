import { permanentRedirect } from "next/navigation";

/**
 * Resolves /products (Shopify-style index) without colliding with app/[slug],
 * which treats "products" as reserved and would otherwise return 404.
 */
export default function ProductsIndexPage() {
  permanentRedirect("/shop");
}
