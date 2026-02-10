import { Metadata } from 'next';
import CertificateVerifyClient from './CertificateVerifyClient';

export const metadata: Metadata = {
  title: 'Verify Certificate | TDI Learning Hub',
  description: 'Verify a professional development certificate from the TDI Learning Hub',
};

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { code } = await params;

  return <CertificateVerifyClient code={code} />;
}
