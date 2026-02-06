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
});
