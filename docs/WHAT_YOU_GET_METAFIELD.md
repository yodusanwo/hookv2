# What You Get metafield

The product page can show **What You Get** content in the right column next to **Product Description** (below the images). This comes from a Shopify **product metafield** (rich text). **If the metafield is empty for a product, the whole column is omitted** and the description uses the full width.

### Custom section title (replaces “What You Get”)

- **Rich text — two top-level blocks:** Put the **title in the first block** (paragraph or heading), then add **at least one more block** (paragraph, list, etc.). The first block becomes the section heading; everything after it is the body.
- **Rich text — one list only:** If the whole section is a **single bullet list** and the **first bullet** is the label (e.g. `Perfect for:`) with the real bullets after it, that **first list item** becomes the section heading and the **remaining bullets** are the body.
- **Rich text — one paragraph with line breaks:** If you only have **one paragraph** but use **multiple lines** (title on line 1, body starting on line 2), the **first line** becomes the section heading and the **rest of the paragraph** is the body.
- **Otherwise:** If the metafield has only **one** block that doesn’t match the above, the heading stays **What You Get** and the whole field is the body.
- **Plain text (legacy):** Put the **first line** as the title, then a newline, then the rest. The first line becomes the section heading; lines after the first are the body. A **single line** keeps the heading **What You Get** and uses that line as the body.

## Metafield used

- **Namespace:** `custom`
- **Key:** `what_you_get`
- **Type:** Rich text (Storefront API returns `value` as a JSON string)

## 1. Create the metafield definition in Shopify

You must expose this metafield to the Storefront API (required for headless storefronts).

### Option A: Shopify Admin (Settings → Custom data)

1. In **Shopify Admin**, go to **Settings → Custom data**.
2. Under **Products**, click **Add definition**.
3. Use:
   - **Name:** e.g. "What You Get"
   - **Namespace and key:**
     - Namespace: `custom`
     - Key: `what_you_get`
   - **Type:** **Rich text**
4. Under **Storefront API access**, enable **Storefronts access**.

Save the definition.

### Option B: GraphQL Admin API

```graphql
mutation {
  metafieldDefinitionCreate(
    definition: {
      namespace: "custom"
      key: "what_you_get"
      name: "What You Get"
      type: "rich_text_field"
      ownerType: PRODUCT
      access: { storefront: MERCHANT_WRITE }
    }
  ) {
    createdDefinition { id }
    userErrors { field message }
  }
}
```

## 2. Add content per product

1. Go to **Products** and edit a product.
2. Find the **What You Get** metafield (under Metafields or in the product editor).
3. Use the rich text editor to add:
   - **Bullet list** for the main points (e.g. Skin-on, pin bone–removed portion; Each piece ~8 oz, hand-cut; etc.).
   - **Paragraph** for the note (e.g. "A quick note: We pack these boxes by weight...").

You can use **bold**, *italic*, and links as needed. The app renders the content as HTML with spacing and list styling.

**Example structure:**

- Skin-on, pin bone–removed portion
- Each piece ~8 oz, hand-cut
- Individually vacuum-sealed
- A curated mix of sockeye & sablefish
- Ready for any weeknight meal

Then a separate paragraph:

A quick note: We pack these boxes by weight, so the number of pieces will vary slightly depending on the fish. Portions are generally around 8 oz each, and your total box weight will always meet or exceed the size selected.

If you leave the metafield empty on a product, that product has no “What You Get” block.

## Migrating from Multi-line text

If you previously used **Multi-line text** for this metafield, create a new definition with type **Rich text** (same namespace and key if you want to keep the same field). Re-enter or re-format the content in the rich text editor; the app will render it as rich text. Old plain-text values are still shown as plain text (with line breaks) until you switch to rich text content.
