import { defineType, defineField } from "sanity";

export const cta = defineType({
  name: "cta",
  type: "object",
  title: "Call to Action",
  fields: [
    defineField({ name: "label", type: "string", title: "Label" }),
    defineField({ name: "href", type: "string", title: "Link URL" }),
  ],
});
