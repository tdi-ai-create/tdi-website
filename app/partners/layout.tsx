import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Portal | Teachers Deserve It',
  description: 'Access your TDI partnership dashboard',
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout provides a minimal experience for partner pages
  // No site nav, no announcement bar, no marketing popups
  // The dashboard has its own nav built-in
  // The login/reset pages have their own full-page layouts
  return (
    <>
      {children}
    </>
  );
}
