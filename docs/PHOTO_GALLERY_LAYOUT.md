# Photo Gallery Layout (Story Page)

The photo gallery on the `/story` page is implemented in `components/sections/PhotoGallerySection.tsx`. The desktop layout is a 3×5 CSS grid with nine images (p1–p9) and per-image offsets for alignment.

## Grid layout (per Figma)

```
  p1  p2  p4    (p1, p4, p5 = tall 350×467; p2, p6, p7, p8, p9 = short 350×261; p3 = tall 350×256)
  p1  p3  p4    11px gap, 30px below last row
  p5  p3  p8    (p5, p8 extend up; p3 spans into this row)
  p5  p6  p8
  p5  p7  p9
```

- **Grid areas:** `GRID_AREAS` maps index 0–8 to `p1`–`p9`.
- **Section height:** Wrapper and grid use aspect ratio `1072 / 1085` so the bottom of image 7 (and its border-radius) isn’t clipped.

## Per-image layout tweaks

Layout offsets are defined in **`GRID_ITEM_OFFSETS`** at the top of `PhotoGallerySection.tsx`. Each entry can set:

| Property       | Effect |
|----------------|--------|
| `marginTop`    | Pulls the image up (negative) or adds space above (positive). |
| `marginBottom` | Pulls the row/content below up (negative) or adds space below. |
| `translateY`   | Moves the image up (negative px) or down (positive px). |

### Current offsets

| Index | Image | `marginTop` | `marginBottom` | `translateY` | Purpose |
|-------|--------|-------------|----------------|--------------|---------|
| 4     | 5      | -13         | —              | —           | Tuck up into gap above |
| 5     | 6      | -6          | —              | -4          | Slight nudge up with 6 |
| 6     | 7      | -6          | —              | 42          | Move down to clear 6 and avoid overlap |
| 7     | 8      | —           | -11            | -10         | Sit under 4, slight nudge up |
| 8     | 9      | -40         | —              | 18          | Move down to clear 8 |

### How to adjust an image

1. Open `components/sections/PhotoGallerySection.tsx`.
2. Find the **`GRID_ITEM_OFFSETS`** object (near the top, after `GRID_AREAS`).
3. Edit the entry for the image index (0–8):
   - **Move down:** increase `translateY` (e.g. 42 → 48) or add/increase positive `marginTop`.
   - **Move up:** decrease `translateY` (e.g. 42 → 36) or use a negative `translateY` / negative `marginTop`.
4. If an image is cut off at the bottom (e.g. image 7), increase the section height by changing the aspect ratio in the same file: replace `1072 / 1085` with a taller ratio (e.g. `1072 / 1100`) in both the wrapper and the grid `style` objects.

No other code changes are needed; the component reads `GRID_ITEM_OFFSETS` and applies the styles automatically.
