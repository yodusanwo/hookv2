/**
 * Team Bios (Our Crew) section: title, description, and a gallery of team members
 * with circular photos, names, and roles. Layout: 5 per row (2 rows for 10 members).
 */
import { urlFor } from "@/lib/sanityImage";
import { WaveDivider } from "@/components/ui/WaveDivider";

type TeamMember = {
  _key?: string;
  image?: { _ref?: string; asset?: { _ref?: string } };
  name?: string;
  role?: string;
};

type TeamBiosBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  teamMembers?: TeamMember[];
};

const AVATAR_SIZE = 211; // Figma: 210.671px (desktop); mobile uses smaller size via Tailwind
const WAVE_CLEARANCE_PADDING = "clamp(8rem, 16vw, 12rem)";

export function TeamBiosSection({
  block,
  hasWaveAbove = false,
  showBottomWave = false,
}: {
  block: TeamBiosBlock;
  /** When true, adds top padding so the wave above isn't covered. */
  hasWaveAbove?: boolean;
  /** When true, show VectorWavyNavyOurStory.svg wave at bottom (e.g. on /story page). */
  showBottomWave?: boolean;
}) {
  const title = (block.title ?? "OUR CREW").trim();
  const description = (block.description ?? "").trim();
  const members = block.teamMembers ?? [];

  return (
    <section
      id="team-bios"
      className={`relative z-10 overflow-hidden pt-12 md:pt-16 ${showBottomWave ? "pb-0" : "pb-12 md:pb-16"}`}
      style={{
        backgroundColor: block.backgroundColor ?? "#d4f2ff",
        ...(hasWaveAbove ? { paddingTop: WAVE_CLEARANCE_PADDING } : {}),
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-4">
        {/* Heading */}
        <div className="mx-auto max-w-[926px] text-center">
          {title && (
            <h2
              className="font-semibold uppercase leading-normal tracking-normal text-[#1e1e1e]"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "3rem",
                lineHeight: 1,
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className="mt-6 w-full max-w-[770px] mx-auto text-center"
              style={{
                color: "#1E1E1E",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "1rem",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "150%",
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Team grid: 2 cols mobile, 3 cols sm/md, 5 cols xl+; flex + justify-center so partial last row is centered */}
        {members.length > 0 && (
          <div
            className="mt-14 flex flex-wrap justify-center gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16"
          >
            {members.map((member, idx) => {
              const img = member.image ? urlFor(member.image) : null;
              const name = (member.name ?? "").trim() || `Team member ${idx + 1}`;
              const role = (member.role ?? "").trim();
              const stableKey = member._key ?? `member-${idx}`;

              return (
                <div
                  key={stableKey}
                  className="flex w-[calc((100%-24px)/2)] shrink-0 flex-col items-center text-center sm:w-[calc((100%-48px)/3)] xl:w-[calc((100%-128px)/5)]"
                >
                  <div
                    className="h-[160px] w-[160px] overflow-hidden rounded-full bg-gray-300 md:h-[211px] md:w-[211px]"
                    style={{ aspectRatio: "1" }}
                  >
                    {img ? (
                      <img
                        src={img.url()}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        width={AVATAR_SIZE}
                        height={AVATAR_SIZE}
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-[#6b7280]"
                        style={{
                          fontFamily: "var(--font-inter), Inter, sans-serif",
                          fontSize: "1.125rem",
                        }}
                      >
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p
                    className="mt-4 font-normal leading-normal text-[#111827]"
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontSize: "1.25rem",
                    }}
                  >
                    {name}
                  </p>
                  {role && (
                    <p
                      className="mt-1 font-normal leading-normal text-[#6b7280]"
                      style={{
                        fontFamily: "var(--font-inter), Inter, sans-serif",
                        fontSize: "1rem",
                      }}
                    >
                      {role}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showBottomWave && (
        <div className="-mt-8 mt-auto w-full shrink-0 overflow-visible md:-mt-0" style={{ marginTop: 60 }}>
          <div className="wave-full-bleed mt-auto shrink-0">
            <WaveDivider
              navySrc="/VectorWavyNavyOurStory.svg"
              navyOutline="top"
            />
          </div>
        </div>
      )}
    </section>
  );
}
