import { SectionHeading } from "@/components/ui/SectionHeading";

type Event = { date?: string; time?: string; name?: string; location?: string };

type UpcomingEventsBlock = {
  title?: string;
  description?: string;
  events?: Event[];
  showAllUrl?: string;
};

export function UpcomingEventsSection({ block }: { block: UpcomingEventsBlock }) {
  const title = block.title ?? "Upcoming Events";
  const description = block.description ?? "";
  const events = block.events ?? [];
  const showAllUrl = block.showAllUrl;

  if (events.length === 0) return null;

  return (
    <section id="events" className="py-14 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-black/5 bg-white p-6"
            >
              <div className="text-sm font-semibold text-slate-900">
                {e.date} {e.time && `• ${e.time}`}
              </div>
              <h3 className="mt-2 font-semibold text-slate-900">{e.name}</h3>
              {e.location && (
                <p className="mt-1 text-sm text-slate-600">{e.location}</p>
              )}
            </div>
          ))}
        </div>
        {showAllUrl && (
          <div className="mt-8 flex justify-center">
            <a
              href={showAllUrl}
              className="btn-primary"
            >
              View All Events
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
