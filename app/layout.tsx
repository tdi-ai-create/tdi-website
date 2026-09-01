import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Header } from "@/components/layout/Header";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { Footer } from "@/components/layout/Footer";
import { EmailPopup } from "@/components/EmailPopup";
import { SubstackPopup } from "@/components/SubstackPopup";
import { SocialProofPopup } from "@/components/SocialProofPopup";
import { MainSiteWrapper } from "@/components/layout/MainSiteWrapper";
import { MomentModeProvider } from "@/components/hub/MomentModeContext";
import { PostHogProvider } from "@/components/PostHogProvider";
import DesiWrapper from "@/components/DesiWrapper";
import { SwagPopup } from "@/components/SwagPopup";

export const metadata: Metadata = {
  title: {
    default: "Teachers Deserve It | Professional Development That Actually Works",
    template: "%s | Teachers Deserve It",
  },
  description: "Join 100,000+ educators with PD that respects your time. Practical strategies, wellness support, and a community that gets it. For teachers and schools.",
  keywords: ["professional development", "teacher PD", "teacher wellness", "school PD", "teacher burnout", "education"],
  authors: [{ name: "Teachers Deserve It" }],
  creator: "Teachers Deserve It",
  metadataBase: new URL("https://teachersdeserveit.com"),
  // No title or description here on purpose. Next resolves og:title from the
  // page's own title (template included) and og:description from its
  // description, but only when they are absent here. Setting them pinned every
  // page's share card to the homepage: a link to /for-schools/request previewed
  // as the generic brand blurb, which is the opposite of what a share is for.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://teachersdeserveit.com",
    siteName: "Teachers Deserve It",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Teachers Deserve It",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  // No canonical here on purpose. A canonical in the root layout is inherited
  // by every page that does not set its own, so every page declared itself a
  // duplicate of the homepage and told search engines not to rank it
  // independently. /funding and /pd-diagnostic are exactly the pages an
  // educator would search for. Set alternates.canonical per route instead.
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Caveat:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Teachers Deserve It",
          "url": "https://www.teachersdeserveit.com",
          "logo": "https://www.teachersdeserveit.com/images/logo.webp",
          "description": "Research-backed professional development for schools, teachers, and paraprofessionals across all 50 states.",
          "sameAs": ["https://raehughart.substack.com"],
          "contactPoint": { "@type": "ContactPoint", "email": "hello@teachersdeserveit.com", "contactType": "customer service" }
        }) }} />
        <PostHogProvider>
        <MomentModeProvider>
          <GoogleAnalytics />
          <MicrosoftClarity />
          <ScrollToTop />
          {/* Skip link. Every page repeats the same nav before its content, so
              without this a keyboard or screen-reader user tabs the whole
              header again on every single page load just to reach what they
              came for. Visually hidden until focused, then it appears. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-[#1E2749] focus:shadow-lg focus:outline focus:outline-2 focus:outline-[#1E2749]"
          >
            Skip to main content
          </a>
          <MainSiteWrapper>
            <Header />
          </MainSiteWrapper>
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <MainSiteWrapper>
            <Footer />
            <EmailPopup />
            <SubstackPopup />
            <SocialProofPopup />
            <SwagPopup />
          </MainSiteWrapper>
          <DesiWrapper />
        </MomentModeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
