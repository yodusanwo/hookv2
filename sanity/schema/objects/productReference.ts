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
    }),
  ],
});
