import { defineType, defineField } from "sanity";

export const localFoodsCoopsBlock = defineType({
  name: "localFoodsCoopsBlock",
  type: "object",
  title: "Local Foods Co-ops",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({
      name: "body",
      type: "array",
      title: "Body",
      of: [{ type: "block" }],
    }),
    defineField({ name: "image", type: "image", title: "Image" }),
    defineField({
      name: "logoButtons",
      type: "array",
      title: "Logo Buttons",
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
      return { title: "Local Foods Co-ops", subtitle: title };
    },
  },
});
