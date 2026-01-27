import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Creator Studio | Teachers Deserve It",
    template: "%s | Creator Studio",
  },
  description: "Create and manage your professional development courses with TDI.",
};

export default function CreatorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout uses a fixed fullscreen wrapper to override the parent layout's
  // header, footer, and announcement bar. The creator portal has its own navigation.
  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f5] overflow-auto">
      {children}
    </div>
  );
}
