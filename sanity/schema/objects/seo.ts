import { defineType, defineField } from "sanity";

export const seo = defineType({
  name: "seo",
  type: "object",
  title: "SEO",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({ name: "image", type: "image", title: "Image" }),
  ],
});
