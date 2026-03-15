/**
 * Team Bios (Our Crew) section: title, description, and a gallery of team members
 * with circular photos, names, and roles. Layout: 5 per row (2 rows for 10 members).
 */
import { urlFor } from "@/lib/sanityImage";

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

const AVATAR_SIZE = 211; // Figma: 210.671px
const WAVE_CLEARANCE_PADDING = "clamp(8rem, 16vw, 12rem)";

export function TeamBiosSection({
  block,
  hasWaveAbove = false,
}: {
  block: TeamBiosBlock;
  /** When true, adds top padding so the wave above isn't covered. */
  hasWaveAbove?: boolean;
}) {
  const title = (block.title ?? "OUR CREW").trim();
  const description = (block.description ?? "").trim();
  const members = block.teamMembers ?? [];

  return (
    <section
      id="team-bios"
      className="relative z-10 overflow-hidden py-14 md:py-16"
      style={{
        backgroundColor: block.backgroundColor ?? "#d4f2ff",
        ...(hasWaveAbove ? { paddingTop: WAVE_CLEARANCE_PADDING } : {}),
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Heading */}
        <div className="mx-auto max-w-[926px] text-center">
          {title && (
            <h2
              className="font-semibold uppercase leading-normal tracking-normal text-[#1e1e1e]"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "48px",
                lineHeight: 1,
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className="mt-6 font-normal leading-[1.5] text-[#1e1e1e]"
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "20px",
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Team grid: 5 per row, second row directly below the first */}
        {members.length > 0 && (
          <div
            className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-5 md:gap-x-8 md:gap-y-16"
            style={{ justifyItems: "center" }}
          >
            {members.map((member, idx) => {
              const img = member.image ? urlFor(member.image) : null;
              const name = (member.name ?? "").trim() || `Team member ${idx + 1}`;
              const role = (member.role ?? "").trim();
              const stableKey = member._key ?? `member-${idx}`;

              return (
                <div
                  key={stableKey}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className="overflow-hidden rounded-full bg-gray-300"
                    style={{
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      maxWidth: "min(100%, 211px)",
                      aspectRatio: "1",
                    }}
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
                          fontSize: "18px",
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
                      fontSize: "20px",
                    }}
                  >
                    {name}
                  </p>
                  {role && (
                    <p
                      className="mt-1 font-normal leading-normal text-[#6b7280]"
                      style={{
                        fontFamily: "var(--font-inter), Inter, sans-serif",
                        fontSize: "16px",
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
    </section>
  );
}
