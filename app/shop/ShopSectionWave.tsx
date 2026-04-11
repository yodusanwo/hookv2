"use client";

import { WaveDivider } from "@/components/ui/WaveDivider";

/**
 * Wave divider between sections — matches the wave between Recipes and Dockside & Markets on the home page.
 * Renders the same two navy wave SVGs with the same layout (scaleX, rotate, outline classes).
 */
export function ShopSectionWave() {
  return (
    <div
      className="relative z-30 w-full shrink-0 overflow-visible"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
      aria-hidden
    >
      <div
        className="relative top-[60px] md:top-[100px] -mt-8 w-full shrink-0"
        style={{
          transform: "scaleX(1.10) rotate(-5deg) translateZ(0)",
          WebkitTransform: "scaleX(1.10) rotate(-5deg) translateZ(0)",
        }}
      >
        <WaveDivider
          navySrc="/VectorWavyNavyOurStory.svg"
          wrapperClassName="mt-3 -mb-px [background-color:transparent]"
          navyOutline="top"
        />
        <WaveDivider
          navySrc="/VectorWavyNavy.svg"
          wrapperClassName="-mt-px [background-color:transparent]"
          navyOutline="bottom"
        />
      </div>
    </div>
  );
}
