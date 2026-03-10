/**
 * Contact section: title, description, and contact form.
 * Content is driven by Sanity contactBlock (title, description, email, phone, submitButtonLabel).
 */
import { ContactForm } from "@/app/contact/ContactForm";

type ContactBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  email?: string;
  phone?: string;
  submitButtonLabel?: string;
};

export function ContactSection({ block }: { block: ContactBlock }) {
  const title = (block.title ?? "Contact Us").trim();
  const description = (block.description ?? "").trim();
  const bgColor = block.backgroundColor ?? "#d4f2ff";

  return (
    <section
      id="contact-page"
      className="relative z-10 min-h-[780px] pt-[176px] pb-14 md:pt-[208px] md:pb-20"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-[782px] px-4 text-center">
        {title && (
          <h1
            className="font-semibold uppercase leading-normal text-[#111827]"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "48px",
              lineHeight: 1,
            }}
          >
            {title}
          </h1>
        )}
        {description && (
          <p
            className="mx-auto mt-6 max-w-[426px] text-center text-[16px] font-normal leading-[1.5] text-[#1e1e1e]"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            {description}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-[1065px] px-4 pt-14">
        <ContactForm
          email={block.email}
          phone={block.phone}
          submitLabel={block.submitButtonLabel ?? "Send Message"}
        />
      </div>
    </section>
  );
}
