import { redirect } from "next/navigation";
import { getShopPageData } from "@/lib/getShopPageData";
import { ShopPageClient } from "./ShopPageClient";

export const metadata = {
  title: "Shop | Hook Point",
  description:
    "Shop all wild Alaskan seafood, smoked & specialty, pet treats, merch, and gift cards.",
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
