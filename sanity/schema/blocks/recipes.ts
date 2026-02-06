import { defineType, defineField } from "sanity";

export const recipesBlock = defineType({
  name: "recipesBlock",
  type: "object",
  title: "Recipes",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "recipes",
      type: "array",
      title: "Recipes",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Recipe Title" },
            { name: "image", type: "image", title: "Image" },
            { name: "url", type: "url", title: "Link URL" },
          ],
        },
      ],
    }),
    defineField({
      name: "showMoreUrl",
      type: "url",
      title: "Show More Link",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Recipes", subtitle: title };
    },
  },
});
