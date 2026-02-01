import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Time | Para Workshop Tools',
  description: 'Interactive training games for paraprofessionals',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ParaGameToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts for game interface */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@300;400;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Standalone layout - no site header/footer */}
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </>
  );
}
