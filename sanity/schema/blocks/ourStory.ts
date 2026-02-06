import { defineType, defineField } from "sanity";

export const ourStoryBlock = defineType({
  name: "ourStoryBlock",
  type: "object",
  title: "Our Story",
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
      name: "subheading",
      type: "string",
      title: "Subheading (e.g. Why Wild Matters)",
    }),
    defineField({
      name: "cta",
      type: "cta",
      title: "Call to Action",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Our Story", subtitle: title };
    },
  },
});
