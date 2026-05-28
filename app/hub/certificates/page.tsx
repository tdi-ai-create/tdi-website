'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import EmptyState from '@/components/hub/EmptyState';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import {
  Award,
  Download,
  ExternalLink,
  Sparkles,
  Wrench,
  Library,
  Bookmark,
  Heart,
  Coffee,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  Printer,
  Star,
  Lock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ShareMenu from '@/components/hub/ShareMenu';
import {
  checkRecognitions,
  type Recognition,
  type EarnedRecognition,
  type RecognitionProgress,
  type RecognitionResult,
} from '@/lib/hub/recognitions';

// Map icon name strings to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Wrench,
  Library,
  Bookmark,
  Heart,
  Coffee,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
};

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

type TabType = 'certificates' | 'field-notes';

export default function CertificatesPage() {
  const { user, profile } = useHub();
  const { tUI } = useTranslation();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recognitionData, setRecognitionData] = useState<RecognitionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('certificates');

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // Load certificates and recognitions in parallel
        const [certsResult, recsResult] = await Promise.all([
          supabase
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
            .order('issued_at', { ascending: false }),
          checkRecognitions(user.id, supabase),
        ]);

        if (certsResult.data) {
          const formattedCerts: Certificate[] = certsResult.data.map((cert) => {
            const courseData = cert.course as
              | { title: string; slug: string }
              | { title: string; slug: string }[]
              | null;
            return {
              ...cert,
              course: Array.isArray(courseData)
                ? courseData[0]
                : courseData || { title: 'Unknown Course', slug: '' },
            };
          });
          setCertificates(formattedCerts);
        }

        setRecognitionData(recsResult);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePrint = useCallback((rec: Recognition) => {
    const displayName = profile?.display_name || 'Educator';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${rec.title} - Field Note</title>
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          @page { size: landscape; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            font-family: 'DM Sans', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #fff;
          }
          .certificate {
            width: 10in;
            height: 7.5in;
            padding: 1in;
            box-sizing: border-box;
            border: 3px solid #1e2749;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .certificate::before {
            content: '';
            position: absolute;
            inset: 8px;
            border: 1px solid #ffba06;
          }
          .org {
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: 14px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #1e2749;
            margin-bottom: 12px;
          }
          .divider {
            width: 60px;
            height: 3px;
            background: #ffba06;
            margin: 16px auto;
          }
          .title {
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: 36px;
            font-weight: 700;
            color: #1e2749;
            margin: 12px 0 8px;
          }
          .description {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 20px;
          }
          .note {
            font-style: italic;
            font-size: 15px;
            color: #1e2749;
            max-width: 500px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .name {
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: 22px;
            font-weight: 600;
            color: #1e2749;
            margin-bottom: 4px;
          }
          .date {
            font-size: 13px;
            color: #718096;
          }
          .footer {
            position: absolute;
            bottom: 40px;
            font-style: italic;
            font-size: 12px;
            color: #a0aec0;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="org">Teachers Deserve It</div>
          <div class="divider"></div>
          <div class="title">${rec.title}</div>
          <div class="description">${rec.description}</div>
          <div class="divider"></div>
          <div class="note">${rec.personalNote}</div>
          <div class="name">${displayName}</div>
          <div class="date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div class="footer">Just in case no one told you today, we see you.</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [profile?.display_name]);

  const getIcon = (iconName: string): LucideIcon => {
    return ICON_MAP[iconName] || Star;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-96 animate-pulse" />
        </div>
        <div className="flex gap-4 mb-8">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-100 rounded w-32 animate-pulse" />
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
            color: '#1e2749',
          }}
        >
          {tUI('Your Achievements')}
        </h1>
        <p
          className="text-gray-500 text-[15px] max-w-[560px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {tUI('Every step forward deserves to be seen. These are yours.')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 mb-8 p-1 rounded-lg w-fit"
        style={{ backgroundColor: '#f3f4f6' }}
      >
        <button
          onClick={() => setActiveTab('certificates')}
          className="px-5 py-2 rounded-md text-sm font-medium transition-all"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            backgroundColor: activeTab === 'certificates' ? '#fff' : 'transparent',
            color: activeTab === 'certificates' ? '#1e2749' : '#6b7280',
            boxShadow: activeTab === 'certificates' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {tUI('Certificates')}
        </button>
        <button
          onClick={() => setActiveTab('field-notes')}
          className="px-5 py-2 rounded-md text-sm font-medium transition-all"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            backgroundColor: activeTab === 'field-notes' ? '#fff' : 'transparent',
            color: activeTab === 'field-notes' ? '#1e2749' : '#6b7280',
            boxShadow: activeTab === 'field-notes' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {tUI('Field Notes')}
          {recognitionData && recognitionData.earned.length > 0 && (
            <span
              className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              {recognitionData.earned.length}
            </span>
          )}
        </button>
      </div>

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <>
          {certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="hub-card"
                  style={{ borderTop: '4px solid #E8B84B' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#FFF8E7' }}
                    >
                      <Award size={24} style={{ color: '#E8B84B' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold mb-1"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '16px',
                          color: '#1e2749',
                        }}
                      >
                        {cert.course.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className="inline-block text-[12px] font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: '#E8B84B',
                            color: '#1e2749',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {cert.pd_hours} {tUI('PD Hours')}
                        </span>
                        <span
                          className="text-[13px] text-gray-500"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {tUI('Issued')} {formatDate(cert.issued_at)}
                        </span>
                      </div>
                      <p
                        className="text-[12px] text-gray-400 font-mono mb-4"
                        style={{ fontFamily: 'monospace' }}
                      >
                        {tUI('Verification')}: {cert.verification_code}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={`/api/hub/certificate/${cert.verification_code}`}
                          download={`TDI-Certificate-${cert.verification_code}.pdf`}
                          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: '#E8B84B',
                            color: '#1e2749',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          <Download size={16} />
                          {tUI('Download PDF')}
                        </a>
                        <ShareMenu
                          type="certificate"
                          text={`PD Certificate for ${cert.course.title}`}
                          url={`https://www.teachersdeserveit.com/hub/verify/${cert.verification_code}`}
                          courseTitle={cert.course.title}
                          pdHours={cert.pd_hours}
                          buttonVariant="secondary"
                          buttonSize="md"
                        />
                        <Link
                          href={`/hub/verify/${cert.verification_code}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {tUI('Verify')}
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
                iconBgColor="#FFF8E7"
                title={tUI('No certificates yet.')}
                description={tUI(
                  'Complete a course to earn your first PD certificate. Your school can verify it anytime.'
                )}
                buttonText={tUI('Browse Courses')}
                buttonLink="/hub/courses"
              />
            </div>
          )}
        </>
      )}

      {/* Field Notes Tab */}
      {activeTab === 'field-notes' && recognitionData && (
        <div className="space-y-10">
          {/* Earned Section */}
          <section>
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#1e2749',
              }}
            >
              {tUI('Earned')}
            </h2>

            {recognitionData.earned.length > 0 ? (
              <div className="space-y-4">
                {recognitionData.earned.map((item) => {
                  const IconComponent = getIcon(item.recognition.icon);
                  return (
                    <div
                      key={item.recognition.id}
                      className="hub-card relative overflow-hidden"
                      style={{ borderLeft: '4px solid #ffba06' }}
                    >
                      {/* Gold accent top strip */}
                      <div
                        className="absolute top-0 right-0 w-24 h-24 opacity-[0.04] rounded-bl-full"
                        style={{ backgroundColor: '#ffba06' }}
                      />

                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#FFF8E7' }}
                        >
                          <IconComponent size={22} style={{ color: '#d4960a' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className="font-semibold"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '16px',
                                color: '#1e2749',
                              }}
                            >
                              {tUI(item.recognition.title)}
                            </h3>
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: '#ffba06' }}
                            />
                          </div>
                          <p
                            className="text-[14px] text-gray-600 mb-2"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {tUI(item.recognition.description)}
                          </p>
                          <p
                            className="text-[14px] mb-3 leading-relaxed"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontStyle: 'italic',
                              color: '#4a5568',
                            }}
                          >
                            {tUI(item.recognition.personalNote)}
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className="text-[12px] text-gray-400"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {tUI('Earned')} {formatDate(item.earnedAt)}
                            </span>
                            <button
                              onClick={() => handlePrint(item.recognition)}
                              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              <Printer size={14} />
                              {tUI('Print')}
                            </button>
                            <ShareMenu
                              type="tip"
                              text={`I earned "${item.recognition.title}" on the Teachers Deserve It Learning Hub! ${item.recognition.personalNote}`}
                              url="https://www.teachersdeserveit.com/hub"
                              buttonVariant="ghost"
                              buttonSize="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="hub-card py-10 text-center"
                style={{ backgroundColor: '#FFFDF5', border: '1px dashed #e5d9b6' }}
              >
                <Sparkles
                  size={28}
                  className="mx-auto mb-3"
                  style={{ color: '#d4960a' }}
                />
                <p
                  className="text-[15px] font-medium mb-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#1e2749',
                  }}
                >
                  {tUI('Your first Field Note is closer than you think')}
                </p>
                <p
                  className="text-[13px] text-gray-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {tUI('Keep exploring tools and using Moment Mode to earn recognitions.')}
                </p>
              </div>
            )}
          </section>

          {/* In Progress Section */}
          {recognitionData.progress.length > 0 && (
            <section>
              <h2
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#1e2749',
                }}
              >
                {tUI('In Progress')}
              </h2>
              <div className="space-y-3">
                {recognitionData.progress.map((item) => {
                  const IconComponent = getIcon(item.recognition.icon);
                  const percentage = Math.round(
                    (item.current / item.recognition.threshold) * 100
                  );
                  return (
                    <div
                      key={item.recognition.id}
                      className="hub-card"
                      style={{ borderLeft: '4px solid #e5e7eb' }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#f9fafb' }}
                        >
                          <IconComponent size={18} style={{ color: '#9ca3af' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-medium text-[15px] mb-1"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              color: '#1e2749',
                            }}
                          >
                            {tUI(item.recognition.title)}
                          </h3>
                          <p
                            className="text-[13px] text-gray-500 mb-3"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {tUI(item.recognition.description)}
                          </p>
                          {/* Progress bar */}
                          <div className="flex items-center gap-3">
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: '#f3f4f6' }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: '#ffba06',
                                }}
                              />
                            </div>
                            <span
                              className="text-[12px] text-gray-400 flex-shrink-0"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {item.current}/{item.recognition.threshold}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Coming Soon Section */}
          {recognitionData.available.length > 0 && (
            <section>
              <h2
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#9ca3af',
                }}
              >
                {tUI('Coming Soon')}
              </h2>
              <div className="space-y-2">
                {recognitionData.available.map((rec) => (
                  <div
                    key={rec.id}
                    className="hub-card opacity-50"
                    style={{
                      borderLeft: '4px solid #e5e7eb',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#f3f4f6' }}
                      >
                        <Lock size={14} style={{ color: '#d1d5db' }} />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-medium text-[14px]"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#9ca3af',
                          }}
                        >
                          {tUI(rec.title)}
                        </h3>
                        <p
                          className="text-[12px] text-gray-400"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {tUI(rec.description)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
