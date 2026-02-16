import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  type: "document",
  title: "Site Settings",
  groups: [
    { name: "header", title: "Header" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Document name",
      description: "Name shown in Sanity for this settings document.",
      initialValue: "Navigation",
      group: "header",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "headerLogo",
      type: "image",
      title: "Header Logo",
      description: "Logo displayed in the top nav. Upload your logo image.",
      group: "header",
    }),
    defineField({
      name: "headerBackgroundColor",
      type: "string",
      title: "Header Background Color",
      description: "Background color for the top nav (e.g. #171730).",
      initialValue: "#171730",
      group: "header",
    }),
    defineField({
      name: "promoBanner",
      type: "string",
      title: "Promo Banner Text",
      description: 'e.g. "Subscribe & Save 10%"',
      group: "header",
    }),
    defineField({
      name: "navLinks",
      type: "array",
      title: "Main Nav Links",
      group: "header",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "href", type: "string", title: "URL" },
          ],
        },
      ],
    }),
    defineField({
      name: "footerLogo",
      type: "image",
      title: "Footer Logo",
      group: "footer",
    }),
    defineField({
      name: "footerOrgLogos",
      type: "array",
      title: "Footer Org Logos",
      group: "footer",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "footerNavLinks",
      type: "array",
      title: "Footer Nav Links",
      group: "footer",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "href", type: "string", title: "URL" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Site Settings" };
    },
  },
});
