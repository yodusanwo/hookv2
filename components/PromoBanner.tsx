export function PromoBanner({ text }: { text: string }) {
  if (!text?.trim()) return null;
  return (
    <div
      className="relative z-30 flex w-full items-center justify-center border-y border-slate-200/80"
      style={{ height: "64px", backgroundColor: "#069400" }}
    >
      <p
        className="text-center text-white"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "24px",
          fontWeight: 400,
          lineHeight: "normal",
          textTransform: "capitalize",
        }}
      >
        {text}
      </p>
    </div>
  );
}
