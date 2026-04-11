"use client";

import { usePathname } from "next/navigation";
import { WaveDivider } from "@/components/ui/WaveDivider";

/** Renders the wave below the header; hidden on Sanity Studio routes (/studio). */
export function HeaderWave() {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;
  return (
    <div
      className="relative z-30 -mt-px origin-top"
      style={{
        transform: "scale(1.05, 0.6) translateZ(0)",
        WebkitTransform: "scale(1.05, 0.6) translateZ(0)",
      }}
    >
      <WaveDivider
        navySrc="/VectorWavyNavy.svg"
        navyOutline="bottom"
      />
    </div>
  );
}
