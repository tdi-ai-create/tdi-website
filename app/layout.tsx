import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmailPopup } from "@/components/EmailPopup";

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
      <body className="antialiased">
        <GoogleAnalytics />
        <ScrollToTop />
        <AnnouncementBar />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <EmailPopup />
      </body>
    </html>
  );
}
