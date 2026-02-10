import { Metadata } from 'next';
import HubLayoutClient from './HubLayoutClient';

export const metadata: Metadata = {
  title: {
    default: 'TDI Learning Hub',
    template: '%s | TDI Learning Hub',
  },
  description: 'Professional development that fits your life. Courses, resources, and support for teachers who deserve it.',
};

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HubLayoutClient>{children}</HubLayoutClient>;
}
