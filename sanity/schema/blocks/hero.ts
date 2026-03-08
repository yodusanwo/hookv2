import { defineType, defineField } from "sanity";

export const heroBlock = defineType({
  name: "heroBlock",
  type: "object",
  title: "Hero",
  fields: [
    defineField({
      name: "variant",
      type: "string",
      title: "Layout",
      options: {
        list: [
          { title: "Default (centered, for homepage)", value: "default" },
          { title: "Story (text lower, for Our Story page)", value: "story" },
        ],
      },
    }),
    defineField({ name: "headline", type: "string", title: "Headline" }),
    defineField({ name: "subline", type: "string", title: "Subline" }),
    defineField({
      name: "cta",
      type: "cta",
      title: "Call to Action",
    }),
    defineField({
      name: "images",
      type: "array",
      title: "Images",
      of: [{ type: "image" }],
      options: { layout: "grid" },
    }),
  ],
  preview: {
    select: { headline: "headline" },
    prepare({ headline }) {
      return { title: "Hero", subtitle: headline };
    },
  },
});
