import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const reviewsBlock = defineType({
  name: "reviewsBlock",
  type: "object",
  title: "Reviews",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#f2f2f5",
    }),
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "reviews",
      type: "array",
      title: "Reviews",
      of: [
        {
          type: "object",
          fields: [
            { name: "stars", type: "number", title: "Stars" },
            { name: "text", type: "text", title: "Review Text" },
            { name: "name", type: "string", title: "Author Name" },
            { name: "date", type: "string", title: "Date" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Reviews", subtitle: title };
    },
  },
});
