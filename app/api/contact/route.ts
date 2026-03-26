import { Resend } from "resend";
import { NextResponse } from "next/server";

const MAX_NAME = 200;
const MAX_MESSAGE = 10_000;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

/**
 * Headless contact: sends mail to the store owner via Resend.
 *
 * Env:
 * - `RESEND_API_KEY` — required (https://resend.com/api-keys)
 * - `CONTACT_TO_EMAIL` — recipient inbox (defaults to hello@hookpointfish.com)
 * - `CONTACT_FROM_EMAIL` — must use a domain verified in Resend in production.
 *   For Resend trial, `onboarding@resend.dev` only delivers to your Resend-account email.
 */
export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email delivery is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const honeypot = String(o.website ?? "").trim();
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const fullName = String(o.fullName ?? "").trim().slice(0, MAX_NAME);
  const email = String(o.email ?? "").trim();
  const message = String(o.message ?? "").trim().slice(0, MAX_MESSAGE);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim() || "hello@hookpointfish.com";
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() || "Hook Point <onboarding@resend.dev>";

  const subject = `Website contact: ${fullName || "(no name)"}`.slice(0, 200);
  const text = [
    `Name: ${fullName || "—"}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(fullName || "—")}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
  `;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject,
    text,
    html,
  });

  if (error) {
    console.error("Resend contact error:", error);
    return NextResponse.json({ error: "Could not send your message. Please try again later." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
