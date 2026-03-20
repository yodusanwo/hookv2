import { defineType, defineField } from "sanity";

export const productReference = defineType({
  name: "productReference",
  type: "object",
  title: "Product Reference",
  fields: [
    defineField({
      name: "shopifyHandle",
      type: "string",
      title: "Shopify Product Handle",
      description:
        "The handle only (e.g. black-pepper-smoked-salmon-portion). No leading slash or /products/ — paste from Admin → Products → handle in the URL bar if unsure.",
    }),
    defineField({
      name: "featuredImageIndex",
      type: "number",
      title: "Featured Image Index",
      description: "0-based index of the product image to display (0 = first image).",
      initialValue: 0,
      validation: (Rule) => Rule.min(0).integer(),
    }),
  ],
});
