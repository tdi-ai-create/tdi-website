import Link from 'next/link';
import { Instagram, Linkedin, Facebook, Mail } from 'lucide-react';

const footerLinks = {
  company: [
    { href: '/what-we-offer', label: 'What We Offer' },
    { href: '/for-schools', label: 'For Schools' },
    { href: '/for-schools/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
  resources: [
    { href: 'https://tdi.thinkific.com', label: 'Learning Hub', external: true },
    { href: 'https://tdi.thinkific.com/collections/downloads', label: 'Free Tools', external: true },
    { href: 'https://raehughart.substack.com', label: 'Blog', external: true },
    { href: 'https://open.spotify.com/show/1ZDo7psMhu9TTomUBKxVvO', label: 'Podcast', external: true },
  ],
  legal: [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
  ],
};

const socialLinks = [
  { href: 'https://www.instagram.com/teachersdeserveit/', icon: Instagram, label: 'Instagram' },
  { href: 'https://www.linkedin.com/in/rae-hughart/', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://www.facebook.com/profile.php?id=61568079585675', icon: Facebook, label: 'Facebook' },
  { href: 'mailto:info@teachersdeserveit.com', icon: Mail, label: 'Email' },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--tdi-navy)' }}>
      <div className="container-wide mx-auto px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Teachers Deserve It</h3>
            <p className="text-white/70 text-sm mb-6">
              Professional development that actually works—practical strategies, real support, and a community that gets it.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target={social.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={social.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors text-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Teachers Deserve It. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
