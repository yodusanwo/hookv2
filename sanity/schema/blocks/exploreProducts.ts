import { defineType, defineField } from "sanity";

export const exploreProductsBlock = defineType({
  name: "exploreProductsBlock",
  type: "object",
  title: "Catch of the day",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", initialValue: "Catch of the day" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "filterCollections",
      type: "array",
      title: "Filter Tabs",
      description: "Each tab maps to a Shopify collection. Products are fetched from the selected collection.",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label", description: "Button text (e.g. Seafood)" },
            {
              name: "collectionHandle",
              type: "string",
              title: "Collection Handle",
              description: "Shopify collection handle (from collection URL). E.g. seafood, subscription-box",
            },
          ],
          preview: {
            select: { label: "label" },
            prepare({ label }) {
              return { title: label ?? "Filter" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "filterLabels",
      type: "array",
      title: "Filter Labels (legacy)",
      hidden: true,
      of: [{ type: "string" }],
    }),
    defineField({
      name: "productRefs",
      type: "array",
      title: "Featured Products",
      description: "Products to display in the grid. Leave empty to show first products from Shopify.",
      of: [{ type: "productReference" }],
    }),
    defineField({
      name: "cta",
      type: "object",
      title: "CTA Button",
      fields: [
        { name: "label", type: "string", title: "Label", initialValue: "SHOP FULL LINEUP →" },
        { name: "href", type: "string", title: "Link", initialValue: "#shop" },
      ],
    }),
    defineField({
      name: "categories",
      type: "array",
      title: "Categories (legacy)",
      hidden: true,
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "collectionHandle", type: "string", title: "Collection Handle" },
            { name: "image", type: "image", title: "Image" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Catch of the day", subtitle: title };
    },
  },
});
