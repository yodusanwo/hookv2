import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getClientIpKey } from "@/lib/apiRateLimit";
import {
  getProvidedRevalidateSecret,
  getStoredRevalidateSecret,
  safeEqualRevalidateSecret,
} from "@/lib/sanityRevalidateAuth";

const LOG_PREFIX = "[sanity-revalidate]";

function truncateForLog(s: string, max = 64): string {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function sanityWebhookMeta(body: unknown): {
  documentId?: string;
  documentType?: string;
} {
  if (!body || typeof body !== "object") return {};
  const o = body as Record<string, unknown>;
  const id = o._id;
  const type = o._type;
  return {
    documentId:
      typeof id === "string" && id.length > 0 ? truncateForLog(id, 80) : undefined,
    documentType:
      typeof type === "string" && type.length > 0 ? truncateForLog(type, 64) : undefined,
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIpKey(request);

  const stored = getStoredRevalidateSecret();
  if (!stored.ok) {
    if (stored.reason === "missing") {
      console.warn(`${LOG_PREFIX} rejected: SANITY_REVALIDATE_SECRET not set`, {
        ip,
      });
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }
    console.error(
      `${LOG_PREFIX} misconfigured: SANITY_REVALIDATE_SECRET must be at least 32 characters (use e.g. openssl rand -hex 32)`,
      { ip },
    );
    return NextResponse.json(
      { message: "Revalidation is not available." },
      { status: 503 },
    );
  }

  const provided = getProvidedRevalidateSecret(request);
  if (!provided) {
    console.warn(`${LOG_PREFIX} rejected: no secret in query or Authorization`, {
      ip,
    });
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  if (!safeEqualRevalidateSecret(provided, stored.value)) {
    console.warn(`${LOG_PREFIX} rejected: secret mismatch`, { ip });
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let body: unknown;
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  const { documentId, documentType } = sanityWebhookMeta(body);
  const started = Date.now();

  try {
    revalidatePath("/");
    const ms = Date.now() - started;
    console.log(`${LOG_PREFIX} ok`, {
      ip,
      ms,
      ...(documentId ? { documentId } : {}),
      ...(documentType ? { documentType } : {}),
    });
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error(`${LOG_PREFIX} revalidatePath failed`, {
      ip,
      ms: Date.now() - started,
      ...(documentId ? { documentId } : {}),
      err,
    });
    return NextResponse.json(
      { message: "Revalidation failed" },
      { status: 500 },
    );
  }
}
