import { redirect } from "next/navigation";
import { getShopPageData } from "@/lib/getShopPageData";
import { ShopPageClient } from "../ShopPageClient";

function titleCaseCategory(slugDecoded: string): string {
  return slugDecoded
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function categoryMetaDescription(label: string): string {
  const base = `Shop ${label} at Hook Point—wild Alaska seafood shipped nationwide. Premium products from our Kodiak family fishery.`;
  if (base.length <= 160) return base;
  return `${base.slice(0, 157).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decoded = decodeURIComponent(category).replace(/-/g, " ");
  const label = decoded ? titleCaseCategory(decoded) : "";
  const title = label
    ? `${label} — Shop | Hook Point`
    : "Shop | Hook Point";
  return {
    title,
    description: label
      ? categoryMetaDescription(label)
      : "Browse wild Alaska seafood online: frozen portions, seafood boxes, smoked & specialty, salmon, sablefish, pet treats & gift cards—shipped nationwide.",
  };
}

export default async function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ category?: string }> | { category?: string };
}) {
  const { category: raw } = await params;
  const category = decodeURIComponent(raw).trim();
  const data = await getShopPageData(searchParams, category);
  const valid =
    data.initialCategoryFromUrl != null ||
    data.initialFilterValuesFromUrl.length > 0;
  if (!valid) {
    redirect("/shop");
  }
  return <ShopPageClient {...data} />;
}
