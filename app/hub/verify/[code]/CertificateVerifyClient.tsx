'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Award, Calendar, Clock, User } from 'lucide-react';

interface CertificateData {
  id: string;
  verification_code: string;
  pd_hours: number;
  issued_at: string;
  user: {
    display_name: string | null;
  } | null;
  course: {
    title: string;
  } | null;
}

interface CertificateVerifyClientProps {
  code: string;
}

export default function CertificateVerifyClient({ code }: CertificateVerifyClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyCertificate() {
      try {
        const supabase = getSupabase();

        const { data, error: queryError } = await supabase
          .from('hub_certificates')
          .select(`
            id,
            verification_code,
            pd_hours,
            issued_at,
            user:hub_profiles!hub_certificates_user_id_fkey (
              display_name
            ),
            course:hub_courses!hub_certificates_course_id_fkey (
              title
            )
          `)
          .eq('verification_code', code)
          .single();

        if (queryError || !data) {
          setError('Certificate not found');
          setCertificate(null);
        } else {
          // Handle Supabase join results (returns arrays for joined tables)
          const certData: CertificateData = {
            id: data.id,
            verification_code: data.verification_code,
            pd_hours: data.pd_hours,
            issued_at: data.issued_at,
            user: Array.isArray(data.user) ? data.user[0] : data.user,
            course: Array.isArray(data.course) ? data.course[0] : data.course,
          };
          setCertificate(certData);
          setError(null);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Unable to verify certificate. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    verifyCertificate();
  }, [code]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            TDI Learning Hub
          </Link>
          <p
            className="text-gray-500 mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Certificate Verification
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          {isLoading ? (
            <div className="text-center py-8">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"
                style={{ backgroundColor: '#E8B84B' }}
              />
              <p
                className="text-gray-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Verifying certificate...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <XCircle size={32} className="text-red-500" />
              </div>
              <h2
                className="text-xl font-semibold mb-3"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#2B3A67',
                }}
              >
                Certificate not found
              </h2>
              <p
                className="text-gray-600 mb-6"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                We could not find a certificate with this verification code. Please check the code and try again.
              </p>
              <p
                className="text-sm text-gray-400"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Code entered: <span className="font-mono">{code}</span>
              </p>
            </div>
          ) : certificate ? (
            <div>
              {/* Verified Badge */}
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: '#D1FAE5' }}
                >
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    color: '#2B3A67',
                  }}
                >
                  Certificate Verified
                </h2>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <User size={20} className="text-gray-400 mt-0.5" />
                  <div>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Issued to
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      {certificate.user?.display_name || 'Teacher'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <Award size={20} className="text-gray-400 mt-0.5" />
                  <div>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Course completed
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      {certificate.course?.title || 'Course'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                    <Clock size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <p
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        PD Hours
                      </p>
                      <p
                        className="font-medium"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#2B3A67',
                        }}
                      >
                        {certificate.pd_hours}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                    <Calendar size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <p
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Issued
                      </p>
                      <p
                        className="font-medium"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#2B3A67',
                        }}
                      >
                        {formatDate(certificate.issued_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Code */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Verification code
                </p>
                <p
                  className="font-mono text-lg"
                  style={{ color: '#2B3A67' }}
                >
                  {certificate.verification_code}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p
            className="text-sm text-gray-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Issued by TDI Learning Hub
          </p>
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#2B3A67',
            }}
          >
            teachersdeserveit.com
          </Link>
        </div>
      </div>
    </div>
  );
}
