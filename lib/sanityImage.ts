import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "./sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const builder = projectId ? createImageUrlBuilder(client) : null;

export function urlFor(source: { _ref?: string; asset?: { _ref?: string } } | undefined) {
  if (!source || !builder) return null;
  return builder.image(source);
}
