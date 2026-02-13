import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Session Survey | ASD4 Para Training',
  description: 'End-of-session survey for Addison School District 4 paraprofessionals',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Standalone layout - no site header/footer */}
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)',
        }}
      >
        {children}
      </div>
    </>
  );
}
