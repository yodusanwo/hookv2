import { defineType, defineField } from "sanity";

export const recipeCategory = defineType({
  name: "recipeCategory",
  type: "document",
  title: "Recipe Category",
  description: "Categories for filtering recipes on the /recipes page. Create one per filter (e.g. Salmon, Sablefish).",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Display name (e.g. Salmon, Sablefish)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description: "URL-safe value used for filtering. Usually generated from title.",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Recipe Category" };
    },
  },
});
