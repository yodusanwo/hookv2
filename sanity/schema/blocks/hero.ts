import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const heroBlock = defineType({
  name: "heroBlock",
  type: "object",
  title: "Hero",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#ffffff",
    }),
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
      name: "mediaMode",
      type: "string",
      title: "Hero media mode",
      initialValue: "images-only",
      options: {
        list: [
          { title: "Images only", value: "images-only" },
          { title: "Video only", value: "video-only" },
          { title: "Video + images carousel", value: "video-and-images" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "video",
      type: "file",
      title: "Hero video",
      options: { accept: "video/mp4,video/webm,video/quicktime" },
    }),
    defineField({
      name: "videoPosterImage",
      type: "image",
      title: "Video poster image",
      description: "Shown before the video loads and used as the preload image for video-first heroes.",
      options: { accept: IMAGE_ACCEPT },
      validation: (Rule: { custom: (fn: (v: unknown) => true | string) => { error: (m: string) => unknown } }) =>
        Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE) as import("sanity").SchemaValidationValue,
    }),
  ],
  preview: {
    select: { headline: "headline" },
    prepare({ headline }) {
      return { title: "Hero", subtitle: headline };
    },
  },
});
