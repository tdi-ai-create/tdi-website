// Force dynamic rendering for all admin pages (no static generation)
export const dynamic = 'force-dynamic';

import AdminLayoutClient from './AdminLayoutClient';

export default function TDIAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
