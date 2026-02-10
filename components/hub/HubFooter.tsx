import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/', label: 'TeachersDeserveIt.com' },
  { href: '/contact', label: 'Support' },
  { href: '/privacy', label: 'Privacy' },
];

export default function HubFooter() {
  return (
    <footer style={{ backgroundColor: '#2B3A67' }}>
      <div
        className="max-w-7xl mx-auto px-8 py-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Top row: Brand + Links */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
          {/* Left: Brand */}
          <span
            className="text-[13px]"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            Teachers Deserve It Learning Hub
          </span>

          {/* Right: Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-2 gap-y-1">
            {FOOTER_LINKS.map((link, index) => (
              <span key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className="text-[13px] transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }}
                >
                  {link.label}
                </Link>
                {index < FOOTER_LINKS.length - 1 && (
                  <span
                    className="mx-2 text-[13px]"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  >
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom row: Copyright */}
        <div
          className="mt-4 text-center text-[12px]"
          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
        >
          © 2026 Teachers Deserve It. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
