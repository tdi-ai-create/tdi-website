'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCertificateByCode, formatCertificateDate } from '@/lib/certificate';
import { Award, CheckCircle, XCircle, Download } from 'lucide-react';

interface CertificateData {
  id: string;
  verification_code: string;
  pd_hours: number;
  issued_at: string;
  certificate_url: string | null;
  user_name: string;
  course_title: string;
  course_category: string;
}

interface CertificateVerifyClientProps {
  code: string;
}

export default function CertificateVerifyClient({ code }: CertificateVerifyClientProps) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function verifyCertificate() {
      if (!code) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getCertificateByCode(code);
        if (data) {
          setCertificate(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error verifying certificate:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    verifyCertificate();
  }, [code]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Verifying certificate...
          </p>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <XCircle size={40} style={{ color: '#DC2626' }} />
          </div>
          <h1
            className="font-bold mb-3"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
          >
            Certificate Not Found
          </h1>
          <p
            className="text-gray-500 mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            We couldn&apos;t find a certificate with the code <span className="font-mono font-medium">{code}</span>.
            Please check the verification code and try again.
          </p>
          <Link
            href="/hub"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Go to Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  // Valid certificate
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="max-w-2xl mx-auto">
        {/* Verification Badge */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#D1FAE5' }}
          >
            <CheckCircle size={40} style={{ color: '#059669' }} />
          </div>
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '28px',
              color: '#2B3A67',
            }}
          >
            Certificate Verified
          </h1>
          <p
            className="text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            This is an authentic certificate issued by The Teacher Development Initiative.
          </p>
        </div>

        {/* Certificate Card */}
        <div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          style={{ border: '1px solid #E5E5E5' }}
        >
          {/* Gold Banner */}
          <div
            className="h-2"
            style={{ backgroundColor: '#E8B84B' }}
          />

          <div className="p-8">
            {/* Award Icon */}
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <Award size={32} style={{ color: '#E8B84B' }} />
              </div>
            </div>

            {/* Certificate Details */}
            <div className="text-center space-y-4">
              <div>
                <p
                  className="text-sm text-gray-500 mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  This certifies that
                </p>
                <h2
                  className="font-bold"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '24px',
                    color: '#2B3A67',
                  }}
                >
                  {certificate.user_name}
                </h2>
              </div>

              <div>
                <p
                  className="text-sm text-gray-500 mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  has successfully completed
                </p>
                <h3
                  className="font-semibold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '18px',
                    color: '#2B3A67',
                  }}
                >
                  {certificate.course_title}
                </h3>
              </div>

              {/* PD Hours Badge */}
              <div className="pt-2">
                <span
                  className="inline-block text-sm font-semibold px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {certificate.pd_hours} Professional Development Hour{certificate.pd_hours !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Issue Date */}
              <p
                className="text-sm text-gray-500 pt-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Issued on {formatCertificateDate(certificate.issued_at)}
              </p>

              {/* Verification Code */}
              <p
                className="text-xs text-gray-400 font-mono pt-4"
              >
                Verification Code: {certificate.verification_code}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="px-8 py-4 flex justify-center"
            style={{ backgroundColor: '#FAFAF8', borderTop: '1px solid #E5E5E5' }}
          >
            <a
              href={`/api/hub/certificate/${certificate.verification_code}`}
              download={`TDI-Certificate-${certificate.verification_code}.pdf`}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Download size={16} />
              Download Certificate
            </a>
          </div>
        </div>

        {/* TDI Branding */}
        <div className="text-center mt-8">
          <p
            className="text-sm text-gray-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Verified by
          </p>
          <p
            className="font-bold mt-1"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '16px',
              color: '#2B3A67',
            }}
          >
            The Teacher Development Initiative
          </p>
          <p
            className="text-xs text-gray-400 mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            tdi.education
          </p>
        </div>
      </div>
    </div>
  );
}
