import { defineType, defineField } from "sanity";

export const categorySectionBlock = defineType({
  name: "categorySectionBlock",
  type: "object",
  title: "Category Section",
  description:
    "A product category block on the Shop page (e.g. SEAFOOD, SMOKED & SPECIALTY). Shows products from a Shopify collection in a grid or carousel.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Section heading (e.g. SEAFOOD, PET TREATS)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Short text below the title.",
    }),
    defineField({
      name: "collectionHandle",
      type: "string",
      title: "Collection Handle",
      description:
        "Shopify collection handle (from the collection URL). E.g. seafood, pet-treats, merch.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "layout",
      type: "string",
      title: "Layout",
      description: "Grid shows all products; carousel shows a sliding row with arrows.",
      options: {
        list: [
          { value: "grid", title: "Grid" },
          { value: "carousel", title: "Carousel" },
        ],
      },
      initialValue: "grid",
    }),
  ],
  preview: {
    select: { title: "title", collectionHandle: "collectionHandle" },
    prepare({ title, collectionHandle }) {
      return {
        title: title ?? "Category Section",
        subtitle: collectionHandle ? `Collection: ${collectionHandle}` : undefined,
      };
    },
  },
});
