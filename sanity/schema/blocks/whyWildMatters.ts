import { defineType, defineField } from "sanity";

export const whyWildMattersBlock = defineType({
  name: "whyWildMattersBlock",
  type: "object",
  title: "Why Wild Matters",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", initialValue: "WHY WILD MATTERS" }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 3,
      description: "Intro paragraph below the title",
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      description: "Large image on the left",
    }),
    defineField({
      name: "points",
      type: "array",
      title: "Points",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", type: "string", title: "Title" }),
            defineField({ name: "description", type: "text", title: "Description", rows: 3 }),
            defineField({
              name: "icon",
              type: "image",
              title: "Icon",
              description: "Small line-art icon (e.g. SVG or PNG)",
            }),
          ],
          preview: {
            select: { title: "title" },
            prepare({ title }) {
              return { title: title || "Point" };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Why Wild Matters", subtitle: title };
    },
  },
});
