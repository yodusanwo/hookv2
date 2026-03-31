"use client";

const FILTER_BUTTON_BASE =
  "filter-pill-btn text-sm font-semibold transition-colors border-none cursor-pointer inline-flex items-center justify-center flex-shrink-0";
const FILTER_BUTTON_LAYOUT = {
  width: 158,
  height: 45,
  padding: "11px 42px",
  borderRadius: 20,
};
const ACTIVE_BG = "var(--filter-pill-active-bg)";
const INACTIVE_BG = "var(--filter-pill-inactive-bg)";
const CLEAR_LINK_COLOR = "#498CCB";
const SECTION_ID_PREFIX = "shop-section-";

function selectionIncludes(
  selected: string[],
  value: string,
): boolean {
  return selected.some(
    (s) => s === value || s.toLowerCase() === value.toLowerCase(),
  );
}

type PillItem =
  | { type: "filter"; value: string; label: string }
  | { type: "category"; value: string; label: string };

function buildPillOrder(
  filterOptions: Array<{ value: string; label: string; insertAfterCategory?: string }>,
  categoryOptions: Array<{ value: string; label: string }>
): PillItem[] {
  const defaultFilters = filterOptions.filter((f) => !(f.insertAfterCategory ?? "").trim());
  const positionedFilters = filterOptions.filter((f) => (f.insertAfterCategory ?? "").trim());
  const result: PillItem[] = [];
  for (const f of defaultFilters) {
    result.push({ type: "filter", value: f.value, label: f.label });
  }
  const placedFilterValues = new Set<string>();
  for (const cat of categoryOptions) {
    result.push({ type: "category", value: cat.value, label: cat.label });
    for (const f of positionedFilters) {
      if ((f.insertAfterCategory ?? "").trim().toLowerCase() === cat.value.toLowerCase()) {
        result.push({ type: "filter", value: f.value, label: f.label });
        placedFilterValues.add(f.value);
      }
    }
  }
  for (const f of positionedFilters) {
    if (!placedFilterValues.has(f.value)) {
      result.push({ type: "filter", value: f.value, label: f.label });
    }
  }
  return result;
}

export function CategoryFilterBar({
  filterOptions,
  selectedValues,
  onChange,
  categoryOptions = [],
  selectedCategoryHandles = [],
  onCategoryClick,
  hasSelection,
  onClearAll,
}: {
  filterOptions: Array<{ value: string; label: string; insertAfterCategory?: string }>;
  /** Multiple selection: array of selected productType values. Empty = no filter. */
  selectedValues: string[];
  onChange: (values: string[]) => void;
  /** Category/section pills (e.g. Seafood, Subscription Box). Click scrolls + filters to that section. */
  categoryOptions?: Array<{ value: string; label: string }>;
  /** Which categories are selected (limits visible sections). Empty = show all. */
  selectedCategoryHandles?: string[];
  /** Called when a category pill is clicked (scroll + toggle section filter). */
  onCategoryClick?: (handle: string) => void;
  /** Whether any filter or category is selected. When false, onClearAll not used. */
  hasSelection?: boolean;
  /** Called when Clear all is clicked. */
  onClearAll?: () => void;
}) {
  const showClear =
    (hasSelection ?? (selectedValues.length > 0 || selectedCategoryHandles.length > 0)) &&
    Boolean(onClearAll);
  const pills = buildPillOrder(filterOptions, categoryOptions);

  const toggle = (value: string) => {
    if (selectionIncludes(selectedValues, value)) {
      onChange([]);
    } else {
      onChange([value]);
    }
  };

  const handleCategoryClick = (value: string) => {
    if (onCategoryClick) {
      onCategoryClick(value);
    } else {
      const el = document.getElementById(`${SECTION_ID_PREFIX}${value}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      className="px-4 py-6"
      style={{
        backgroundColor: "var(--brand-light-blue-bg)",
        marginTop: -30,
        marginBottom: 60,
      }}
      aria-label="Filters"
    >
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        {/* Left: Filter by category label + Clear all */}
        <div className="flex flex-col gap-1 shrink-0">
          <h2
            className="text-base font-medium"
            style={{
              color: "#1E1E1E",
              fontFamily: "Inter, var(--font-inter), sans-serif",
            }}
          >
            Filter by category
          </h2>
          {showClear && (
            <button
              type="button"
              onClick={onClearAll ?? (() => onChange([]))}
              className="bg-transparent border-none cursor-pointer p-0 text-base font-medium underline underline-offset-2 hover:no-underline text-left self-start"
              style={{
                color: CLEAR_LINK_COLOR,
                fontFamily: "Inter, var(--font-inter), sans-serif",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Right: All pills (product types + categories, interleaved by insertAfterCategory) */}
        <div className="flex flex-wrap justify-center gap-2 flex-1">
          {pills.map((item) =>
            item.type === "filter" ? (
              <button
                key={`filter-${item.value}`}
                type="button"
                onClick={() => toggle(item.value)}
                className={FILTER_BUTTON_BASE}
                style={{
                  ...FILTER_BUTTON_LAYOUT,
                  backgroundColor: selectionIncludes(selectedValues, item.value)
                    ? ACTIVE_BG
                    : INACTIVE_BG,
                  color: selectionIncludes(selectedValues, item.value)
                    ? "var(--filter-pill-active-color)"
                    : "var(--filter-pill-inactive-color)",
                  fontFamily: "Inter, var(--font-inter), sans-serif",
                }}
              >
                {item.label}
              </button>
            ) : (
              <button
                key={`cat-${item.value}`}
                type="button"
                onClick={() => handleCategoryClick(item.value)}
                className={FILTER_BUTTON_BASE}
                style={{
                  ...FILTER_BUTTON_LAYOUT,
                  backgroundColor: selectionIncludes(
                    selectedCategoryHandles,
                    item.value,
                  )
                    ? ACTIVE_BG
                    : INACTIVE_BG,
                  color: selectionIncludes(selectedCategoryHandles, item.value)
                    ? "var(--filter-pill-active-color)"
                    : "var(--filter-pill-inactive-color)",
                  fontFamily: "Inter, var(--font-inter), sans-serif",
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
