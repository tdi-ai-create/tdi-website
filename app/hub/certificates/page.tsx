'use client';

import Link from 'next/link';
import { Award, Download, ExternalLink, ArrowLeft } from 'lucide-react';

export default function CertificatesPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          My Certificates
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Your earned PD certificates. Download or share with your school.
        </p>
      </div>

      {/* Empty State */}
      <div
        className="hub-card text-center py-16"
        style={{ backgroundColor: '#FFF8E7', border: 'none' }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: '#E8B84B' }}
        >
          <Award size={28} style={{ color: '#2B3A67' }} />
        </div>
        <h2
          className="text-xl font-semibold mb-3"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          No certificates yet
        </h2>
        <p
          className="text-gray-600 max-w-md mx-auto mb-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Complete a course to earn your first certificate. Each certificate includes your PD hours and a verification code for your records.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/hub/courses"
            className="hub-btn-primary inline-flex items-center gap-2"
          >
            Browse courses
          </Link>
          <Link
            href="/hub"
            className="hub-btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-6 rounded-lg border border-gray-200 bg-white">
        <h3
          className="font-semibold mb-3"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          About your certificates
        </h3>
        <ul
          className="space-y-2 text-gray-600"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <li className="flex items-start gap-2">
            <Download size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#E8B84B' }} />
            <span>Download as PDF for your professional records</span>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#E8B84B' }} />
            <span>Each certificate has a unique verification code</span>
          </li>
          <li className="flex items-start gap-2">
            <Award size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#E8B84B' }} />
            <span>PD hours are automatically calculated from course duration</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
