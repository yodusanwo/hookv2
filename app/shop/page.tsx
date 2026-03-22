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
  const data = await getShopPageData(searchParams);
  return <ShopPageClient {...data} />;
}
