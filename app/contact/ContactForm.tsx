"use client";

import { useState } from "react";

const DEFAULT_EMAIL = "mat@hookpointfish.com";
const DEFAULT_PHONE = "773.888.1040";

export function ContactForm({
  email,
  phone,
  submitLabel = "Send Message",
}: {
  email?: string;
  phone?: string;
  submitLabel?: string;
} = {}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // When undefined (e.g. static page), use defaults; when empty string (Sanity "leave empty to hide"), hide that field
  const displayEmail =
    email === undefined ? DEFAULT_EMAIL : (email.trim() || null);
  const displayPhone =
    phone === undefined ? DEFAULT_PHONE : (phone.trim() || null);
  const showContactLine = !!displayEmail || !!displayPhone;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("fullName") as string)?.trim() ?? "";
    const userEmail = (formData.get("email") as string)?.trim() ?? "";
    const message = (formData.get("message") as string)?.trim() ?? "";
    const honeypot = (formData.get("website") as string)?.trim() ?? "";

    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email: userEmail,
          message,
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  }

  if (status === "sent") {
    return (
      <div
        className="mx-auto max-w-[661px] rounded-[10px] border border-slate-200 bg-white px-6 py-8 text-center text-[#1e1e1e]"
        style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
      >
        <p className="text-[18px] font-medium">Thanks — your message was sent.</p>
        <p className="mt-2 text-[16px] text-[#4b5563]">We&apos;ll get back to you as soon as we can.</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setErrorMessage(null);
          }}
          className="mt-6 h-[46px] rounded-[10px] px-6 font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--brand-green)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "0.875rem",
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[661px]">
      {/* Honeypot: leave hidden; bots often fill it */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-fullName" className="sr-only">
            Full Name
          </label>
          <input
            id="contact-fullName"
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="h-[50px] w-full rounded-[10px] border border-slate-200 bg-white px-4 text-[16px] text-[#1e1e1e] placeholder:text-[#6b7280] outline-none focus:ring-2 focus:ring-[#069400] focus:border-transparent"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="sr-only">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            placeholder="Email"
            required
            className="h-[50px] w-full rounded-[10px] border border-slate-200 bg-white px-4 text-[16px] text-[#1e1e1e] placeholder:text-[#6b7280] outline-none focus:ring-2 focus:ring-[#069400] focus:border-transparent"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="contact-message" className="sr-only">
          Your Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Your Message"
          required
          rows={5}
          className="min-h-[130px] w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-[16px] text-[#1e1e1e] placeholder:text-[#6b7280] outline-none focus:ring-2 focus:ring-[#069400] focus:border-transparent resize-y"
          style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
        />
      </div>
      {status === "error" && errorMessage && (
        <p className="mt-4 text-[15px] text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-[46px] shrink-0 rounded-[10px] px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          style={{
            backgroundColor: "var(--brand-green)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "0.875rem",
          }}
        >
          {status === "sending" ? "Sending…" : submitLabel}
        </button>
        {showContactLine && (
          <p
            className="text-[16px] text-[#1e1e1e]"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            {displayEmail && (
              <>
                or email us:{" "}
                <a href={`mailto:${displayEmail}`} className="text-[#069400] underline hover:no-underline">
                  {displayEmail}
                </a>
              </>
            )}
            {displayEmail && displayPhone && " / "}
            {displayPhone && (
              <>
                call us{" "}
                <a
                  href={`tel:${displayPhone.replace(/\D/g, "")}`}
                  className="text-[#069400] underline hover:no-underline"
                >
                  {displayPhone}
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </form>
  );
}
