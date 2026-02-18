const WAVE_BASE = {
  width: "105%",
  transform: "translateX(calc(-50% - 25px))",
  left: "50%",
} as const;

const WAVES = [
  { src: "/7 1.png", top: "5px", aspectRatio: "644/171", minHeight: "360px", zIndex: 1 },
  { src: "/wavy 1.png", top: "5px", aspectRatio: "612/133", minHeight: "350px", zIndex: 2 },
] as const;

export function WavesSection() {
  return (
    <section
      className="relative z-0 -mt-[195px] min-h-[400px] overflow-visible pointer-events-none"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
      aria-hidden
    >
      {WAVES.map((wave) => (
        <div
          key={wave.src}
          className="absolute"
          style={{
            ...WAVE_BASE,
            top: wave.top,
            aspectRatio: wave.aspectRatio,
            minHeight: wave.minHeight,
            zIndex: wave.zIndex,
          }}
        >
          <img
            src={wave.src}
            alt=""
            className="h-full w-full max-w-full object-cover object-top"
          />
        </div>
      ))}
    </section>
  );
}
