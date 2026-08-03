const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Become a Partner", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Services", href: "/#features" },
      { label: "Protection Plans", href: "/#plans" },
      { label: "Pricing", href: "/#plans" },
      { label: "AI Warranty Calculator", href: "/#top" },
      { label: "Claims Center", href: "/dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/#faq" },
      { label: "Repair Tracking", href: "/dashboard" },
      { label: "IMEI Checker", href: "/#imei-checker" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Claim Policy", href: "/claim-policy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-soft py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <img
              src="/extra-shield-logo.png"
              alt="Extra Shield"
              className="h-9 w-auto"
            />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-secondary">
              Sri Lanka's first end-to-end mobile device protection ecosystem
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[11.5px] font-semibold uppercase tracking-wide text-secondary">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[13px] text-secondary transition-colors hover:text-cyan-500"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-soft pt-8 sm:flex-row">
          <p className="text-[12px] text-secondary">
            © {new Date().getFullYear()} Extra Shield (Pvt) Ltd. All rights
            reserved.
          </p>
          <p className="text-[12px] text-secondary">
            Made for Sri Lanka's mobile industry.
          </p>
        </div>
      </div>
    </footer>
  );
}