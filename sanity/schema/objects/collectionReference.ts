import { defineType, defineField } from "sanity";

export const collectionReference = defineType({
  name: "collectionReference",
  type: "object",
  title: "Collection Reference",
  fields: [
    defineField({
      name: "collectionHandle",
      type: "string",
      title: "Shopify Collection Handle",
    }),
  ],
});
