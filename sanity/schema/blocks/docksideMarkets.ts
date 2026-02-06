import { defineType, defineField } from "sanity";

export const docksideMarketsBlock = defineType({
  name: "docksideMarketsBlock",
  type: "object",
  title: "Dockside and Farmers Markets",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "items",
      type: "array",
      title: "Items",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "logo", type: "image", title: "Logo" },
            { name: "url", type: "url", title: "Link URL" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Dockside & Markets", subtitle: title };
    },
  },
});
