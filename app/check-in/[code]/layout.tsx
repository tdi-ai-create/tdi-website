import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Absolute, because the root layout appends "| Teachers Deserve It" to every
  // title and the tab otherwise reads it twice.
  title: { absolute: 'Staff Check-in | Teachers Deserve It' },
  description: 'A short check-in for your school team.',
  // A school's check-in has no business in a search index.
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Standalone: no site header, no footer, no navigation away from the form. */}
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
          color: '#ffffff',
        }}
      >
        {children}
      </div>
    </>
  );
}
