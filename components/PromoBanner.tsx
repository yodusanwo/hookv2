"use client";

import * as React from "react";

export function PromoBanner({ text }: { text: string }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const defaultHeadline = "Subscribe to get 10% off your first order";
  const headline = text?.trim() || defaultHeadline;
  const lines = headline.includes("\n")
    ? headline.split("\n").map((l) => l.trim()).filter(Boolean)
    : headline === defaultHeadline
      ? ["Subscribe to get 10% off", "your first order"]
      : [headline];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    // TODO: wire to newsletter/email API
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 500);
  };

  const green = "#069400";

  return (
    <div
      className="relative z-30 flex w-full flex-col items-center justify-center gap-4 px-4 py-4 md:flex-row md:gap-6 md:px-12 md:py-5"
      style={{ backgroundColor: green, fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <div className="text-center text-white" style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 300, lineHeight: 1.3 }}>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-md shrink-0 overflow-hidden rounded-lg bg-white shadow-sm md:max-w-[320px]">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Drop your email here. Let's catch up."
          disabled={status === "loading"}
          className="min-w-0 flex-1 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-60"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="flex h-full items-center justify-center px-4 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: green }}
          aria-label="Subscribe"
        >
          <span className="text-xl">→</span>
        </button>
      </form>
    </div>
  );
}
