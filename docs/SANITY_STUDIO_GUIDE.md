# Sanity Studio Guide — Building the Homepage to Match Figma

This guide explains how to use Sanity Studio and build the homepage to match the [Hook Point Website Final For Feedback](https://www.figma.com/design/BmnL3hmZnAaZOHmXlYe9K3/) Figma design.

---

## Part 1: Using Sanity Studio

### Navigation

- **Structure** (left sidebar) — Browse and create documents (Pages, Site Settings, etc.)
- **Vision** — Run GROQ queries for debugging
- **+** button — Create new documents

### Basic Workflow

1. Click **Structure** in the left sidebar
2. You’ll see your document types: **Page** and **Site Settings**
3. Click **Page** to list all pages, or **+** to create a new one

---

## Part 2: Create the Homepage

### Step 1: Create a New Page

1. In **Structure**, open **Page**
2. Click **Create** (or the **+** next to Page)
3. Enter **Title**: `Home`
4. In the **Slug** field, click **Generate** (it should create `home`)
5. Ensure the slug is exactly `home` — the homepage query looks for `slug.current == "home"`

### Step 2: Add Sections (in Figma Order)

Add sections in this order to match the Figma design. Use the **Add item** button in the Sections array.

| # | Section (Block Type) | What to Fill In |
|---|----------------------|-----------------|
| 1 | **Hero** | Headline, subline, CTA (label + href), upload 2–3 hero images |
| 2 | **Explore Our Products** | Title, description, add categories (label, collection handle, image) |
| 3 | **Our Story** | Title, body text, image, subheading (“Why Wild Matters”), CTA |
| 4 | **Deal & Promotions** | Title, description, add product refs (Shopify product handles) |
| 5 | **Reviews** | Title, description, add reviews (stars, text, name, date) |
| 6 | **Recipes** | Title, description, add recipes (title, image, link URL) |
| 7 | **Dockside and Farmers Markets** | Title, description, add market items (label, optional logo/url) |
| 8 | **Upcoming Events** | Title, description, add events (date, time, name, location) |
| 9 | **Local Foods Co-ops** | Title, body, image, add logo buttons |
| 10 | **FAQ** | Title, description, add FAQs (question, answer) |

### Step 3: Publish

1. Click **Publish** (top right) when done editing
2. Visit `http://localhost:3000` — the homepage will load from Sanity

---

## Part 3: Figma-to-Sanity Mapping

Use the Figma file as reference for copy, images, and structure:

| Figma Section | Sanity Block | Notes |
|---------------|--------------|-------|
| Hero carousel | `heroBlock` | Headline, subline, CTA, images array |
| Explore products / categories | `exploreProductsBlock` | Categories link to Shopify collections |
| About / Our Story | `ourStoryBlock` | Rich text body + image |
| Deals / Featured products | `dealPromotionsBlock` | Use Shopify product handles (e.g. `king-salmon`) |
| Customer reviews | `reviewsBlock` | Stars, quote, name, date |
| Recipes grid | `recipesBlock` | Title, image, link to recipe page |
| Farmers markets | `docksideMarketsBlock` | Market names, optional logos |
| Events / Calendar | `upcomingEventsBlock` | Date, time, event name, location |
| Local foods co-ops | `localFoodsCoopsBlock` | Body text + org logos |
| FAQ accordion | `faqBlock` | Question + answer pairs |

### Product & Collection Handles

- **Product handles** — From Shopify Admin: Products → [product] → URL slug (e.g. `king-salmon`)
- **Collection handles** — From Shopify Admin: Collections → [collection] → URL slug (e.g. `seafood`)

---

## Part 4: Quick Start (Minimal Homepage)

To get something live quickly:

1. Create a **Page** with title `Home` and slug `home`
2. Add a **Hero** section:
   - Headline: `Alaska's Fresh Catch Awaits — Taste the Adventure`
   - Subline: `Wild-caught • Family-run • Sustainably sourced`
   - CTA: label `Get Fresh Fish`, href `#shop`
   - Upload 1–2 hero images (managed in Sanity; if none are set, the site uses lightweight stock placeholders)
3. Add **Our Story** section with title and body text from Figma
4. Add **Deal & Promotions** — add 2–3 product handles from your Shopify store
5. **Publish**

Visit `http://localhost:3000` to see the Sanity-driven homepage. Add more sections as needed.

---

## Creating a New Page (same header, wave, footer, and all components)

You can create a new page in Sanity that automatically uses the same site layout (header, top wave, footer with wave) and has access to all existing section types.

1. In **Structure**, open **Page** and click **Create** (or **+** next to Page).
2. Enter a **Title** (e.g. `About Us`, `Shipping Info`, `FAQ`).
3. In **Slug**, click **Generate** and ensure the slug is what you want in the URL (e.g. `about-us` → site will have `/about-us`).
4. **Do not use** these slugs (they are reserved): `home`, `story`, `contact`, `collections`, `cart`, `products`, `studio`.
5. Add any **Sections** you want (Hero, Our Story, Photo Gallery, Contact, FAQ, etc.) using the same block types as the homepage or story page.
6. **Publish**.

The new URL (e.g. `https://yoursite.com/about-us`) will use the same header, top wave, and footer as the rest of the site and render the sections you added. No new code or routes are required.

---

## Troubleshooting

- **Homepage still shows fallback** — Confirm slug is exactly `home` and the page is **Published**
- **Product refs not showing** — Product handles must match Shopify exactly (lowercase, hyphens)
- **Images not loading** — Upload images in Sanity; they’re served from Sanity’s CDN

### Changes not showing on the live site (e.g. removed a Dockside Markets logo)

The frontend only shows **published** content from Sanity. Caching can delay updates.

1. **Publish in Sanity**  
   After editing (e.g. removing a logo from Dockside and Farmers Markets), click **Publish** (top right). Until you publish, the live site keeps showing the previous published version.

2. **Cache (ISR)**  
   Pages revalidate every **60 seconds**. After publishing, wait up to a minute and reload the page, or do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R). If you use a host like Vercel, triggering a new deployment also fetches fresh Sanity data.

3. **Confirm the right page**  
   Dockside and Farmers Markets can be on the **Home** page or the **Story** page. Edit the page that actually shows that section on the URL you’re checking.

4. **Remove the item, don’t only clear the logo**  
   To remove a market from the list, delete that entry from the **Items** array in the Dockside block (use the trash icon on the item). If you only clear the logo image, the item row stays and may still show a label or empty cell.
