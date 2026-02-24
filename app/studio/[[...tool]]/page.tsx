"use client";

import React, { useState, useEffect } from "react";
import { NextStudio } from "next-sanity/studio";

export default function StudioPage() {
  const [config, setConfig] = useState<typeof import("../../../sanity.config")["default"] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { React: typeof React }).React = React;
    }
    import("../../../sanity.config").then((m) => setConfig(m.default));
  }, []);

  if (!config) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">
        Loading Studio…
      </div>
    );
  }

  return <NextStudio config={config} />;
}
