import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Studio | Teachers Deserve It",
  description: "TDI Creator Studio - Track your course progress and connect with the TDI team.",
};

export default function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout removes the main site header/footer/popups
  // The dashboard page renders its own minimal header
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {children}
    </div>
  );
}
