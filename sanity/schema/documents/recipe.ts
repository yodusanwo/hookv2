import { defineType, defineField } from "sanity";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const recipe = defineType({
  name: "recipe",
  type: "document",
  title: "Recipe",
  fields: [
    defineField({ name: "title", type: "string", title: "Recipe title", validation: (Rule) => Rule.required() }),
    defineField({
      name: "sortOrder",
      type: "number",
      title: "Sort order",
      description: "Order on the /recipes page. Lower numbers appear first. Leave empty to sort by title.",
      initialValue: 0,
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description: "URL path for this recipe (e.g. /recipes/salmon-piccata). Used for the recipe page URL.",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      type: "array",
      title: "Images",
      description: "Main recipe image(s). First image is the primary; additional images show in a gallery.",
      of: [
        {
          type: "image",
          options: { accept: IMAGE_ACCEPT },
          validation: (Rule: { custom: (fn: (v: unknown) => true | string) => { error: (m: string) => unknown } }) =>
            Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE) as import("sanity").SchemaValidationValue,
        },
      ],
      options: { layout: "grid" },
    }),
    defineField({
      name: "summary",
      type: "text",
      title: "Summary (optional)",
      description:
        "Short intro shown on the recipe page between the title and the Ingredients list (e.g. what makes this dish special).",
      rows: 4,
    }),
    defineField({
      name: "ingredients",
      type: "array",
      title: "Ingredients",
      description: "List each ingredient. Optionally link a seafood (or other) product so an “Add to cart” button appears next to that ingredient.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "text",
              type: "string",
              title: "Ingredient text",
              description: "e.g. “3-4 Wild Alaska Sockeye Portions”",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "productHandle",
              type: "string",
              title: "Shopify product handle (optional)",
              description:
                "If set, an “Add to cart” button appears next to this ingredient. Use the product’s handle from Shopify (e.g. wild-alaska-sockeye-portions). Leave empty if you use “Shop category segment” instead.",
            }),
            defineField({
              name: "shopCategorySegment",
              type: "string",
              title: "Shop category segment (optional)",
              description:
                "Link to a shop URL instead of a single product: enter the path segment only (e.g. salmon → /shop/salmon). Same values as on the Shop page filters/collections (e.g. seafood, salmon, halibut). Overrides “Shopify product handle” when set.",
            }),
            defineField({
              name: "filterCategory",
              type: "reference",
              title: "Filter category",
              description: "Category for the recipes page filter (e.g. Salmon, Seafood). Select from the list or create a new one.",
              to: [{ type: "recipeCategory" }],
            }),
          ],
          preview: {
            select: { text: "text" },
            prepare({ text }) {
              return { title: text || "Ingredient" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "directions",
      type: "array",
      title: "Directions",
      description: "Numbered steps for how to make the recipe.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "step",
              type: "text",
              title: "Step",
              rows: 2,
            }),
          ],
          preview: {
            select: { step: "step" },
            prepare({ step }) {
              const firstLine = (step || "").split("\n")[0]?.slice(0, 50) ?? "Step";
              return { title: firstLine + (firstLine.length >= 50 ? "…" : "") };
            },
          },
        },
      ],
    }),
    defineField({
      name: "directionsImage",
      type: "image",
      title: "Directions image (optional)",
      description:
        "Upload a photo of handwritten or printed instructions instead of (or in addition to) numbered steps below. Shown under the “Directions” heading.",
      options: { accept: IMAGE_ACCEPT },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
          description: "Short description for accessibility (e.g. handwritten recipe card).",
        }),
      ],
      validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Recipe" };
    },
  },
});
