'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import EmptyState from '@/components/hub/EmptyState';
import { getSupabase } from '@/lib/supabase';
import { Award, Download, Link as LinkIcon, ExternalLink, Check } from 'lucide-react';

interface Certificate {
  id: string;
  course_id: string;
  pd_hours: number;
  certificate_url: string;
  verification_code: string;
  issued_at: string;
  course: {
    title: string;
    slug: string;
  };
}

export default function CertificatesPage() {
  const { user } = useHub();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCertificates() {
      if (!user?.id) return;

      const supabase = getSupabase();
      setIsLoading(true);

      try {
        const { data } = await supabase
          .from('hub_certificates')
          .select(`
            id,
            course_id,
            pd_hours,
            certificate_url,
            verification_code,
            issued_at,
            course:hub_courses(title, slug)
          `)
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false });

        if (data) {
          const formattedCerts: Certificate[] = data.map((cert) => {
            const courseData = cert.course as { title: string; slug: string } | { title: string; slug: string }[] | null;
            return {
              ...cert,
              course: Array.isArray(courseData) ? courseData[0] : courseData || { title: 'Unknown Course', slug: '' },
            };
          });
          setCertificates(formattedCerts);
        }
      } catch (error) {
        console.error('Error loading certificates:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCertificates();
  }, [user?.id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCopyVerification = async (code: string) => {
    const verificationUrl = `${window.location.origin}/hub/verify/${code}`;
    await navigator.clipboard.writeText(verificationUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-96 animate-pulse" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="hub-card h-40 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-4 bg-gray-100 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Your Certificates
        </h1>
        <p
          className="text-gray-500 text-[15px] max-w-[560px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Every completed course earns PD hours. Share these with your school.
        </p>
      </div>

      {/* Certificates List */}
      {certificates.length > 0 ? (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="hub-card"
              style={{ borderTop: '4px solid #E8B84B' }}
            >
              <div className="flex items-start gap-4">
                {/* Award Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#FFF8E7' }}
                >
                  <Award size={24} style={{ color: '#E8B84B' }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold mb-1"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '16px',
                      color: '#2B3A67',
                    }}
                  >
                    {cert.course.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="inline-block text-[12px] font-medium px-2 py-1 rounded"
                      style={{
                        backgroundColor: '#E8B84B',
                        color: '#2B3A67',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {cert.pd_hours} PD Hours
                    </span>
                    <span
                      className="text-[13px] text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Issued {formatDate(cert.issued_at)}
                    </span>
                  </div>

                  <p
                    className="text-[12px] text-gray-400 font-mono mb-4"
                    style={{ fontFamily: "monospace" }}
                  >
                    Verification: {cert.verification_code}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: '#E8B84B',
                        color: '#2B3A67',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <Download size={16} />
                      Download PDF
                    </a>

                    <button
                      onClick={() => handleCopyVerification(cert.verification_code)}
                      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border-2 transition-colors"
                      style={{
                        borderColor: '#E5E5E5',
                        color: '#2B3A67',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {copiedCode === cert.verification_code ? (
                        <>
                          <Check size={16} className="text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <LinkIcon size={16} />
                          Share
                        </>
                      )}
                    </button>

                    <Link
                      href={`/hub/verify/${cert.verification_code}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Verify
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="hub-card py-16"
          style={{ backgroundColor: '#FFF8E7', border: 'none' }}
        >
          <EmptyState
            icon={Award}
            iconBgColor="#FEF3C7"
            title="No certificates yet."
            description="Complete a course to earn your first PD certificate. Your school can verify it anytime."
            buttonText="Browse Courses"
            buttonLink="/hub/courses"
          />
        </div>
      )}
    </div>
  );
}
