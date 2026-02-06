import { urlFor } from "@/lib/sanityImage";
import { ExploreProductsCarousel } from "./ExploreProductsCarousel";

type Category = {
  label?: string;
  collectionHandle?: string;
  image?: { asset?: { _ref?: string } };
};

type ExploreProductsBlock = {
  title?: string;
  description?: string;
  categories?: Category[];
};

export function ExploreProductsSection({ block }: { block: ExploreProductsBlock }) {
  const title = block.title ?? "Explore Our Products";
  const description = block.description ?? "";
  const rawCategories = block.categories ?? [];
  const categories: Category[] =
    rawCategories.length > 0
      ? rawCategories
      : [
          { label: "Seafood", collectionHandle: "seafood" },
          { label: "Smoked & Specialty", collectionHandle: "smoked-specialty" },
          { label: "Pet Treats", collectionHandle: "pet-treats" },
          { label: "Merch", collectionHandle: "merch" },
          { label: "Gift Card", collectionHandle: "gift-card" },
        ];

  const carouselItems = categories.map((cat) => {
    const img = urlFor(cat.image);
    const href = cat.collectionHandle ? `/collections/${cat.collectionHandle}` : "#shop";
    return {
      label: cat.label ?? "Shop",
      href,
      imageUrl: img ? img.url() : null,
    };
  });

  return (
    <section className="border-y border-slate-200/80 bg-white py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold uppercase tracking-tight text-slate-900 sm:text-3xl">
          {title.endsWith(".") ? title : `${title}.`}
        </h2>
        {description && (
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-500 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="mt-10">
          <ExploreProductsCarousel categories={carouselItems} />
        </div>
      </div>
    </section>
  );
}
