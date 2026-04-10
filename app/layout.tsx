import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmailPopup } from "@/components/EmailPopup";
import { SubstackPopup } from "@/components/SubstackPopup";
import { SocialProofPopup } from "@/components/SocialProofPopup";
import { MainSiteWrapper } from "@/components/layout/MainSiteWrapper";
import { MomentModeProvider } from "@/components/hub/MomentModeContext";
import DesiWrapper from "@/components/DesiWrapper";

export const metadata: Metadata = {
  title: {
    default: "Teachers Deserve It | Professional Development That Actually Works",
    template: "%s | Teachers Deserve It",
  },
  description: "Join 87,000+ educators with PD that respects your time. Practical strategies, wellness support, and a community that gets it. For teachers and schools.",
  keywords: ["professional development", "teacher PD", "teacher wellness", "school PD", "teacher burnout", "education"],
  authors: [{ name: "Teachers Deserve It" }],
  creator: "Teachers Deserve It",
  metadataBase: new URL("https://teachersdeserveit.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://teachersdeserveit.com",
    siteName: "Teachers Deserve It",
    title: "Teachers Deserve It | Professional Development That Actually Works",
    description: "Join 87,000+ educators with PD that respects your time. Practical strategies, wellness support, and a community that gets it.",
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
    title: "Teachers Deserve It | Professional Development That Actually Works",
    description: "Join 87,000+ educators with PD that respects your time. Practical strategies, wellness support, and a community that gets it.",
    images: ["/og-image.png"],
  },
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
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <MomentModeProvider>
          <GoogleAnalytics />
          <MicrosoftClarity />
          <ScrollToTop />
          <MainSiteWrapper>
            <Header />
          </MainSiteWrapper>
          <main className="min-h-screen">
            {children}
          </main>
          <MainSiteWrapper>
            <Footer />
            <EmailPopup />
            <SubstackPopup />
            <SocialProofPopup />
          </MainSiteWrapper>
          <DesiWrapper />
        </MomentModeProvider>
      </body>
    </html>
  );
}
