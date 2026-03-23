import { redirect } from "next/navigation";
import { getShopPageData } from "@/lib/getShopPageData";
import { ShopPageClient } from "../ShopPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decoded = decodeURIComponent(category).replace(/-/g, " ");
  const title = decoded
    ? `${decoded.charAt(0).toUpperCase()}${decoded.slice(1)} — Shop | Hook Point`
    : "Shop | Hook Point";
  return {
    title,
    description:
      "Shop all wild Alaskan seafood, smoked & specialty, pet treats, merch, and gift cards.",
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
