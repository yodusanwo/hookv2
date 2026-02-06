import Link from "next/link";

export function Footer() {
  return (
    <footer id="contact" className="mt-16 bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/90" />
              <div className="leading-tight">
                <div className="text-base font-semibold tracking-wide">
                  Hook Point
                </div>
                <div className="text-xs text-slate-300">
                  Wild Alaskan • Small scale • Family run
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300 max-w-sm">
              From Kodiak Island to your kitchen—responsibly harvested seafood
              delivered with care.
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

