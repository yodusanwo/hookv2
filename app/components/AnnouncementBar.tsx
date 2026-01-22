"use client";

import * as React from "react";

export function AnnouncementBar({
  items,
  intervalMs = 3500,
}: {
  items: string[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs]);

  const current = items[idx] ?? "";

  return (
    <div className="border-b border-black/5 bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative flex h-9 items-center justify-center overflow-hidden text-xs">
          <div
            key={idx}
            className="animate-[fadeIn_260ms_ease-out] text-white/90"
          >
            {current}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

