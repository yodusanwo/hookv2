"use client";

import * as React from "react";

const DEFAULT_FILTERS = ["Seafood", "Subscription Box", "Pet Treats, Merch, Gift Cards"];

export function ExploreFilters({
  labels = DEFAULT_FILTERS,
  activeIndex = 0,
  onFilterChange,
}: {
  labels?: string[];
  activeIndex?: number;
  onFilterChange?: (index: number) => void;
}) {
  const [active, setActive] = React.useState(activeIndex);

  React.useEffect(() => {
    setActive(activeIndex);
  }, [activeIndex]);

  const handleClick = (index: number) => {
    setActive(index);
    onFilterChange?.(index);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {labels.map((label, idx) => {
        const isActive = idx === active;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleClick(idx)}
            className="rounded-lg px-5 py-2.5 text-base font-normal transition-colors"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              ...(isActive
                ? { backgroundColor: "#4F7F9D", color: "white" }
                : {
                    backgroundColor: "white",
                    color: "#4F7F9D",
                    border: "1px solid #BEE6F5",
                  }),
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
