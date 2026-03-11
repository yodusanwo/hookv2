import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const exploreProductsBlock = defineType({
  name: "exploreProductsBlock",
  type: "object",
  title: "Explore Products (Catch of the day)",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#171730",
    }),
    defineField({
      name: "hideWave",
      type: "boolean",
      title: "Hide bottom wave",
      description: "When on, the wave divider below this section is hidden.",
      initialValue: false,
    }),
    defineField({ name: "title", type: "string", title: "Title", initialValue: "EXPLORE OUR PRODUCTS" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "filterCollections",
      type: "array",
      title: "Category Cards",
      description: "Each item shows as a category card (image + label). Link goes to collection.",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label", description: "e.g. Seafood, Smoked & Speciality" },
            {
              name: "collectionHandle",
              type: "string",
              title: "Collection Handle",
              description: "Shopify collection handle. Used for link URL.",
            },
            {
              name: "image",
              type: "image",
              title: "Image",
              description: "Category card image",
              options: { accept: IMAGE_ACCEPT },
              validation: (Rule: { custom: (fn: (v: unknown) => true | string) => { error: (m: string) => unknown } }) =>
                Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            },
          ],
          preview: {
            select: { label: "label" },
            prepare({ label }) {
              return { title: label ?? "Category" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "filterLabels",
      type: "array",
      title: "Filter Labels (legacy)",
      hidden: true,
      of: [{ type: "string" }],
    }),
    defineField({
      name: "productRefs",
      type: "array",
      title: "Featured Products",
      description: "Products to display in the grid. Leave empty to show first products from Shopify.",
      of: [{ type: "productReference" }],
    }),
    defineField({
      name: "cta",
      type: "object",
      title: "CTA Button",
      fields: [
        { name: "label", type: "string", title: "Label", initialValue: "SHOP FULL LINEUP →" },
        { name: "href", type: "string", title: "Link", initialValue: "#shop" },
      ],
    }),
    defineField({
      name: "categories",
      type: "array",
      title: "Categories (legacy)",
      hidden: true,
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "collectionHandle", type: "string", title: "Collection Handle" },
            {
              name: "image",
              type: "image",
              title: "Image",
              options: { accept: IMAGE_ACCEPT },
              validation: (Rule: { custom: (fn: (v: unknown) => true | string) => { error: (m: string) => unknown } }) =>
                Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Explore Products (Catch of the day)", subtitle: title };
    },
  },
});
