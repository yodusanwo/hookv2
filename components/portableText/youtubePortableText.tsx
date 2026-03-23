import type { PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";

/** Extract YouTube video id from watch, embed, shorts, or youtu.be URLs. */
export function parseYouTubeVideoId(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;
  const url = raw.trim();
  try {
    const u = new URL(url, "https://example.com");
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.slice("/embed/".length).split("/")[0];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.slice("/shorts/".length).split("/")[0];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      const v = u.searchParams.get("v");
      return v && /^[\w-]{11}$/.test(v) ? v : null;
    }
  } catch {
    return null;
  }
  return null;
}

function blockPlainText(block: PortableTextBlock): string {
  const children = block.children as Array<{ text?: string }> | undefined;
  if (!children?.length) return "";
  return children.map((c) => c.text ?? "").join("");
}

/**
 * Pasted YouTube "embed" HTML is stored as plain text in Portable Text (iframes are not executed).
 * Extract `src` from a snippet that looks like an iframe embed.
 */
function videoIdFromIframeHtml(text: string): string | null {
  if (!text.includes("<iframe") && !text.includes("youtube.com/embed")) {
    return null;
  }
  const srcMatch = text.match(/<iframe[^>]*src\s*=\s*["']([^"']+)["']/i);
  const src = srcMatch?.[1]?.trim();
  if (src) {
    return parseYouTubeVideoId(src);
  }
  return null;
}

export function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="my-4 w-full max-w-3xl overflow-hidden rounded-lg bg-black/5 shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          title="YouTube video"
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}

/**
 * Portable Text components: YouTube links and lone-URL paragraphs render as embeds.
 */
export function youtubePortableTextComponents(): PortableTextComponents {
  return {
    marks: {
      link: ({ children, value }) => {
        const href = typeof value?.href === "string" ? value.href : "";
        const id = parseYouTubeVideoId(href);
        if (id) {
          return (
            <span className="my-4 block w-full max-w-3xl">
              <YouTubeEmbed videoId={id} />
            </span>
          );
        }
        return (
          <a
            href={href}
            className="text-[#498CCB] underline underline-offset-2 hover:opacity-90"
            rel="noopener noreferrer"
            target={href.startsWith("http") ? "_blank" : undefined}
          >
            {children}
          </a>
        );
      },
    },
    block: {
      normal: ({ children, value }) => {
        const block = value as PortableTextBlock;
        const plain = blockPlainText(block).trim();

        const iframeId = videoIdFromIframeHtml(plain);
        if (iframeId) {
          return <YouTubeEmbed videoId={iframeId} />;
        }

        const id = parseYouTubeVideoId(plain);
        if (id && plain.length < 500 && !plain.includes("\n")) {
          const onlyUrl =
            /^https?:\/\//i.test(plain) || /^youtu\.be\//i.test(plain);
          if (onlyUrl) {
            return <YouTubeEmbed videoId={id} />;
          }
        }
        return (
          <p className="mt-4 whitespace-pre-wrap first:mt-0 [&_a]:text-[#498CCB] [&_a]:underline">
            {children}
          </p>
        );
      },
    },
  };
}
