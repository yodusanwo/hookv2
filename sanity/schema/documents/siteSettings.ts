import { defineType, defineField } from "sanity";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const siteSettings = defineType({
  name: "siteSettings",
  type: "document",
  title: "Site Settings",
  groups: [
    { name: "header", title: "Header" },
    { name: "footer", title: "Footer" },
    { name: "shipping", title: "Shipping" },
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
      options: { accept: IMAGE_ACCEPT },
      validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
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
      options: { accept: IMAGE_ACCEPT },
      validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
    }),
    defineField({
      name: "footerOrgLogos",
      type: "array",
      title: "Footer Org Logos",
      group: "footer",
      of: [
        {
          type: "image",
          options: { accept: IMAGE_ACCEPT },
          validation: (Rule: { custom: (fn: (v: unknown) => true | string) => { error: (m: string) => unknown } }) =>
            Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
        },
      ],
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
    defineField({
      name: "freeShippingMessage",
      type: "string",
      title: "Free Shipping Message",
      description: "Shown on product pages (e.g. \"Free shipping for orders over $50\"). Leave empty to use the default.",
      group: "shipping",
    }),
    defineField({
      name: "estimatedDeliveryProcessingDays",
      type: "number",
      title: "Estimated Delivery – Processing Days",
      description: "Days from order to ship (e.g. 2). Used when product has no estimated_delivery metafield.",
      group: "shipping",
      initialValue: 2,
    }),
    defineField({
      name: "estimatedDeliveryTransitDays",
      type: "string",
      title: "Estimated Delivery – Transit Days Range",
      description: "Min-max transit days (e.g. \"2-4\" or \"3-5\"). Used for dynamic date calculation.",
      group: "shipping",
      initialValue: "2-4",
    }),
    defineField({
      name: "estimatedDeliveryCutoffTime",
      type: "string",
      title: "Estimated Delivery – Cutoff Time",
      description: "24h time (e.g. \"17:00\") for countdown. Order before this for same-day processing. Leave empty to hide countdown.",
      group: "shipping",
    }),
    defineField({
      name: "estimatedDeliveryFrozenProcessingDays",
      type: "number",
      title: "Estimated Delivery (Frozen) – Processing Days",
      description: "Days from order to ship for frozen products. Used when product has custom.is_frozen metafield or product type contains 'frozen'.",
      group: "shipping",
      initialValue: 1,
    }),
    defineField({
      name: "estimatedDeliveryFrozenTransitDays",
      type: "string",
      title: "Estimated Delivery (Frozen) – Transit Days Range",
      description: "Min-max transit days for frozen products (e.g. \"1-2\" or \"2-3\").",
      group: "shipping",
      initialValue: "1-2",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Site Settings" };
    },
  },
});
