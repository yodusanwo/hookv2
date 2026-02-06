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
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-center text-sm text-slate-600">{description}</p>
        )}
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
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View All Events
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
