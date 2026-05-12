import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Affiliate Link | Creator Studio",
  description: "Share your unique affiliate link and earn 50% on every paid conversion.",
};

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {children}
    </div>
  );
}
