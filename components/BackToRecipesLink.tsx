import Link from "next/link";

const LINK_COLOR = "#498CCB";

/** Text + arrow, matches light-blue section accents (e.g. “Show more recipes” style). */
export function BackToRecipesLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/recipes"
      className={`inline-flex items-center gap-1.5 text-base font-medium tracking-tight transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#498CCB] ${className}`}
      style={{
        color: LINK_COLOR,
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      <span>Back to recipes</span>
      <img
        src="/Vector.svg"
        alt=""
        aria-hidden
        width={28.333}
        height={12.307}
        className="h-auto max-w-full shrink-0"
      />
    </Link>
  );
}
