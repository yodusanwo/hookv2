import Link from "next/link";

const FALLBACK_LOGO = "/Hook_Point_Shirt_White_Letters_042acd76-dff8-4246-874a-1df73d011a24%201.png";

export function Footer({ logoUrl }: { logoUrl?: string | null }) {
  const logoSrc = logoUrl ?? FALLBACK_LOGO;
  return (
    <footer id="contact" className="relative overflow-visible text-slate-100" style={{ backgroundColor: "var(--footer-bg)" }}>
      {/* Wave above footer content — pt for drop-shadow clearance on mobile */}
      <div className="w-full pt-6 sm:pt-8 section-bg-light" aria-hidden>
        <img
          src="/wavefooter.png"
          alt=""
          className="w-full h-auto block align-bottom navy-wave-outline-top"
        />
      </div>
      {/* Main footer content */}
      <div className="mx-auto max-w-6xl px-4 py-12 pb-20 md:pb-12" style={{ backgroundColor: "var(--footer-bg)" }}>
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link
              href="/"
              className="block border-0 outline-none ring-0"
              aria-label="Hook Point home"
              style={{
                width: "180.495px",
                height: "175.983px",
                aspectRatio: "40/39",
                background: `url(${logoSrc}) var(--footer-bg) 50% / cover no-repeat`,
              }}
            />
            <p
              className="mt-4"
              style={{
                color: "#FFF",
                fontFamily: "Inter",
                fontSize: "13px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              © 2026 All Rights Reserved
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-sm font-semibold">Explore</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>
                  <a className="hover:text-white" href="#shop">
                    Shop
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#about">
                    About
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="#markets">
                    Markets
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Help</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>
                  <Link className="hover:text-white" href="/">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href="/">
                    FAQ
                  </Link>
                </li>
                <li>
                  <a className="hover:text-white" href="#contact">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Stay in touch</div>
            <p className="mt-3 text-sm text-slate-300">
              Get updates on fresh drops, markets, and seasonal specials.
            </p>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                className="h-11 flex-1 rounded-md bg-slate-800 px-3 text-sm outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400"
                placeholder="Email"
                type="email"
                name="email"
              />
              <input
                className="h-11 w-24 rounded-md bg-slate-800 px-3 text-sm outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400 sm:w-20"
                placeholder="Zip"
                type="text"
                name="zip"
                maxLength={10}
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-slate-900 hover:bg-emerald-400 transition-colors"
              >
                Sign up
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Hook Point Fisheries</div>
          <div className="flex gap-4">
            <Link className="hover:text-slate-200" href="/">
              Privacy
            </Link>
            <Link className="hover:text-slate-200" href="/">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

