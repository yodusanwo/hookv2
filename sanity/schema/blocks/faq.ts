import { defineType, defineField } from "sanity";

export const faqBlock = defineType({
  name: "faqBlock",
  type: "object",
  title: "FAQ",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "faqs",
      type: "array",
      title: "FAQs",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", type: "string", title: "Question" },
            { name: "answer", type: "text", title: "Answer" },
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
      return { title: "FAQ", subtitle: title };
    },
  },
});
