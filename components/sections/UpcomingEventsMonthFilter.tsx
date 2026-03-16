"use client";

import * as React from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/* Use global filter pill colors for consistency (recipes, shop, calendar) */
const BLUE_ACTIVE = "var(--filter-pill-active-bg)";
const BLUE_INACTIVE = "var(--filter-pill-inactive-bg)";

const BUTTON_BASE_STYLE: React.CSSProperties = {
  display: "flex",
  width: 143.568,
  height: 40.89,
  padding: "9.995px 38.164px",
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0,
  borderRadius: 20,
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontWeight: 600,
  fontSize: "0.909rem",
  lineHeight: "normal",
  color: "var(--filter-pill-active-color)",
  whiteSpace: "nowrap",
  transition: "background-color 0.2s",
  border: "none",
  cursor: "pointer",
};

export function UpcomingEventsMonthFilter({
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  availableYears,
}: {
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  selectedMonth: number | null;
  onMonthChange: (month: number | null) => void;
  /** Years to show in the left column (e.g. [2026, 2027]). */
  availableYears: number[];
}) {
  return (
    <div
      className="flex flex-wrap justify-center gap-x-6 gap-y-4 items-start"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
      role="group"
      aria-label="Filter by year and month"
    >
      {/* Years: left column */}
      <div className="flex flex-col gap-2 shrink-0">
        {availableYears.map((year) => {
          const isSelected = selectedYear === year;
          return (
            <button
              key={year}
              type="button"
              onClick={() => onYearChange(isSelected ? null : year)}
              style={{
                ...BUTTON_BASE_STYLE,
                backgroundColor: isSelected ? BLUE_ACTIVE : BLUE_INACTIVE,
                color: isSelected ? "var(--filter-pill-active-color)" : "var(--filter-pill-inactive-color)",
              }}
            >
              {year}
            </button>
          );
        })}
      </div>

      {/* Months: two rows of 6 */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {MONTHS.slice(0, 6).map((label, idx) => {
            const monthNum = idx + 1;
            const isSelected = selectedMonth === monthNum;
            return (
              <button
                key={monthNum}
                type="button"
                onClick={() => onMonthChange(isSelected ? null : monthNum)}
                style={{
                  ...BUTTON_BASE_STYLE,
                  backgroundColor: isSelected ? BLUE_ACTIVE : BLUE_INACTIVE,
                  color: isSelected ? "var(--filter-pill-active-color)" : "var(--filter-pill-inactive-color)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {MONTHS.slice(6, 12).map((label, idx) => {
            const monthNum = idx + 7;
            const isSelected = selectedMonth === monthNum;
            return (
              <button
                key={monthNum}
                type="button"
                onClick={() => onMonthChange(isSelected ? null : monthNum)}
                style={{
                  ...BUTTON_BASE_STYLE,
                  backgroundColor: isSelected ? BLUE_ACTIVE : BLUE_INACTIVE,
                  color: isSelected ? "var(--filter-pill-active-color)" : "var(--filter-pill-inactive-color)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
