import { redirect } from "next/navigation";
import { getShopPageData } from "@/lib/getShopPageData";
import { ShopPageClient } from "./ShopPageClient";

export const metadata = {
  title: "Shop | Hook Point",
  description:
    "Browse wild Alaska seafood online: frozen portions, seafood boxes, smoked & specialty, salmon, sablefish, pet treats & gift cards—shipped nationwide.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }> | { category?: string };
}) {
  const sp =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  if (typeof sp.category === "string" && sp.category.trim()) {
    redirect(`/shop/${encodeURIComponent(sp.category.trim())}`);
  }
  const data = await getShopPageData(searchParams, null);
  return <ShopPageClient {...data} />;
}
