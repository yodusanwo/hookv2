# Product summary metafield (short description under reviews)

The product page shows a **short unique summary** in the product info column (next to the images), directly **under the star rating and review count**. This comes from a Shopify **product metafield**, so it can be different per product and separate from the main "Product description" field. If the metafield is empty, **nothing is shown** in that summary spot.

## Metafield used

- **Namespace:** `custom`
- **Key:** `short_summary_under_images`
- **Type:** Single line or multi-line text (Storefront API returns `value` as string)
- **Recommended max length:** `220` characters

## 1. Create the metafield definition in Shopify

You must expose this metafield to the Storefront API (required for headless storefronts).

### Option A: Shopify Admin (Settings → Custom data)

1. In **Shopify Admin**, go to **Settings → Custom data**.
2. Under **Products**, click **Add definition**.
3. Use:
   - **Name:** e.g. "Short summary" or "Summary (under images)"
   - **Namespace and key:**  
     - Namespace: `custom`  
     - Key: `short_summary_under_images`
   - **Type:** Single line text or Multi-line text
   - **Validation:** set a **maximum length of 220 characters**
4. Under **Storefront API access**, enable **Storefronts access** (or equivalent so the metafield is readable by the Storefront API).

Save the definition.

### Option B: GraphQL Admin API

If you prefer to create it via API (e.g. with a script or app):

```graphql
mutation {
  metafieldDefinitionCreate(
    definition: {
      namespace: "custom"
      key: "short_summary_under_images"
      name: "Short summary (under images)"
      type: "single_line_text_field"
      ownerType: PRODUCT
      access: {
        storefront: "PUBLIC_READ"
      }
    }
  ) {
    createdDefinition {
      id
      namespace
      key
      access { storefront }
    }
    userErrors { field message }
  }
}
```

Use your Admin API endpoint and access token. For multi-line text, use type `multi_line_text_field`.

## 2. Add the summary value per product

For each product that should show a short summary:

1. In **Shopify Admin**, go to **Products** and open the product.
2. Scroll to the **Metafields** section (or the "Short summary" field if it appears there).
3. Enter the short summary text in the **custom.short_summary_under_images** field and save.

When the metafield is set, that text is shown in the summary spot (under the reviews). The storefront also truncates the rendered value to `220` characters as a safeguard. When the metafield is empty, the summary spot stays blank.

## Reference

- [Shopify Metafields](https://help.shopify.com/en/manual/custom-data/metafields)
- [Expose and retrieve metafields with Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/products-collections/metafields)
