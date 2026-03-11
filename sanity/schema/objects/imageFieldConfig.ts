/**
 * Shared config for image fields: restrict to image files only and validate.
 * Prevents ZIP and other non-image uploads; shows a clear error if one gets through.
 */

/** MIME types for the file picker — only images. */
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";

/**
 * Validation for image fields. Rejects assets that are not image type (e.g. ZIP).
 * Use in schema: validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE)
 */
export const IMAGE_ERROR_MESSAGE =
  "Only image files are allowed (JPG, PNG, WebP, GIF, SVG). ZIP and other non-image files cannot be used here. Please remove this and upload an image.";

export function validateImageAsset(value: unknown): true | string {
  if (!value || typeof value !== "object") return true;
  const ref = (value as { asset?: { _ref?: string } })?.asset?._ref;
  if (!ref || typeof ref !== "string") return true;
  // Sanity image assets have _ref starting with "image-"; file assets (e.g. ZIP) use "file-"
  if (!ref.startsWith("image-")) {
    return IMAGE_ERROR_MESSAGE;
  }
  return true;
}
