import { defineType, defineField } from "sanity";

export const exploreProductsBlock = defineType({
  name: "exploreProductsBlock",
  type: "object",
  title: "Explore Our Products",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "categories",
      type: "array",
      title: "Categories",
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
      return { title: "Explore Products", subtitle: title };
    },
  },
});
