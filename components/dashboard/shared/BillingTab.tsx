'use client';

import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Mail,
  Calendar,
  Users,
  Eye,
  Video,
  BarChart2,
} from 'lucide-react';

interface Partnership {
  id: string;
  contract_start?: string | null;
  contract_end?: string | null;
  contract_signed_date?: string | null;
  contract_url?: string | null;
  contract_signed?: boolean;
  staff_enrolled?: number;
  observation_days_total?: number;
  virtual_sessions_total?: number;
  executive_sessions_total?: number;
}

interface BillingTabProps {
  partnership: Partnership | null;
  schoolName: string;
}

export default function BillingTab({ partnership, schoolName }: BillingTabProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const contractStart = formatDate(partnership?.contract_start);
  const contractEnd = formatDate(partnership?.contract_end);
  const contractSigned = formatDate(partnership?.contract_signed_date);
  const isSigned = partnership?.contract_signed || partnership?.contract_signed_date;

  return (
    <div className="space-y-6">
      {/* Section 1: Contract Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#1e2749]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#1e2749]" />
          </div>
          <h2 className="text-xl font-bold text-[#1e2749]">Your Partnership Agreement</h2>
        </div>

        <div className="space-y-4">
          {/* Partnership Period */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="text-sm font-medium text-gray-500 sm:w-40">Partnership Period</span>
            <span className="text-[#1e2749]">
              {contractStart && contractEnd
                ? `${contractStart} - ${contractEnd}`
                : 'Contact TDI for details'}
            </span>
          </div>

          {/* Agreement Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="text-sm font-medium text-gray-500 sm:w-40">Agreement Status</span>
            {isSigned ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full w-fit">
                <CheckCircle className="w-4 h-4" />
                Signed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full w-fit">
                <Calendar className="w-4 h-4" />
                Pending
              </span>
            )}
          </div>

          {/* Signed Date */}
          {contractSigned && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-sm font-medium text-gray-500 sm:w-40">Signed</span>
              <span className="text-[#1e2749]">{contractSigned}</span>
            </div>
          )}
        </div>

        {/* View Agreement Button */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          {partnership?.contract_url ? (
            <a
              href={partnership.contract_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e2749] text-white rounded-lg font-medium hover:bg-[#2a3a5a] transition-colors"
            >
              View Signed Agreement
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Contact us to access your agreement documents.
            </p>
          )}
        </div>
      </div>

      {/* Section 2: What's Included */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-[#1e2749] mb-6">What&apos;s Included in Your Partnership</h2>

        <div className="space-y-4">
          {/* Learning Hub Memberships */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-[#4ecdc4] flex-shrink-0" />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-[#1e2749]">Learning Hub Memberships</span>
            </div>
            <span className="ml-auto font-semibold text-[#1e2749]">
              {partnership?.staff_enrolled ?? 0} members
            </span>
          </div>

          {/* Observation Days */}
          <div className={`flex items-center gap-4 p-4 rounded-xl ${(partnership?.observation_days_total ?? 0) > 0 ? 'bg-gray-50' : 'bg-gray-50/50'}`}>
            {(partnership?.observation_days_total ?? 0) > 0 ? (
              <CheckCircle className="w-5 h-5 text-[#4ecdc4] flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            <div className="flex items-center gap-2">
              <Eye className={`w-4 h-4 ${(partnership?.observation_days_total ?? 0) > 0 ? 'text-gray-400' : 'text-gray-300'}`} />
              <span className={`font-medium ${(partnership?.observation_days_total ?? 0) > 0 ? 'text-[#1e2749]' : 'text-gray-400'}`}>
                Observation Days
              </span>
            </div>
            <span className={`ml-auto font-semibold ${(partnership?.observation_days_total ?? 0) > 0 ? 'text-[#1e2749]' : 'text-gray-400'}`}>
              {(partnership?.observation_days_total ?? 0) > 0 ? `${partnership?.observation_days_total} days` : '-'}
            </span>
          </div>

          {/* Virtual Sessions */}
          <div className={`flex items-center gap-4 p-4 rounded-xl ${(partnership?.virtual_sessions_total ?? 0) > 0 ? 'bg-gray-50' : 'bg-gray-50/50'}`}>
            {(partnership?.virtual_sessions_total ?? 0) > 0 ? (
              <CheckCircle className="w-5 h-5 text-[#4ecdc4] flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            <div className="flex items-center gap-2">
              <Video className={`w-4 h-4 ${(partnership?.virtual_sessions_total ?? 0) > 0 ? 'text-gray-400' : 'text-gray-300'}`} />
              <span className={`font-medium ${(partnership?.virtual_sessions_total ?? 0) > 0 ? 'text-[#1e2749]' : 'text-gray-400'}`}>
                Virtual Sessions
              </span>
            </div>
            <span className={`ml-auto font-semibold ${(partnership?.virtual_sessions_total ?? 0) > 0 ? 'text-[#1e2749]' : 'text-gray-400'}`}>
              {(partnership?.virtual_sessions_total ?? 0) > 0 ? `${partnership?.virtual_sessions_total} sessions` : '-'}
            </span>
          </div>

          {/* Executive Impact Sessions */}
          <div className={`flex items-center gap-4 p-4 rounded-xl ${(partnership?.executive_sessions_total ?? 0) > 0 ? 'bg-gray-50' : 'bg-gray-50/50'}`}>
            {(partnership?.executive_sessions_total ?? 0) > 0 ? (
              <CheckCircle className="w-5 h-5 text-[#4ecdc4] flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            <div className="flex items-center gap-2">
              <BarChart2 className={`w-4 h-4 ${(partnership?.executive_sessions_total ?? 0) > 0 ? 'text-gray-400' : 'text-gray-300'}`} />
              <span className={`font-medium ${(partnership?.executive_sessions_total ?? 0) > 0 ? 'text-[#1e2749]' : 'text-gray-400'}`}>
                Executive Impact Sessions
              </span>
            </div>
            <span className={`ml-auto font-semibold ${(partnership?.executive_sessions_total ?? 0) > 0 ? 'text-[#1e2749]' : 'text-gray-400'}`}>
              {(partnership?.executive_sessions_total ?? 0) > 0 ? `${partnership?.executive_sessions_total} sessions` : '-'}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 italic mt-6">
          For questions about your contract or services, contact our team below.
        </p>
      </div>

      {/* Section 3: Payment Policy */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-[#1e2749] mb-6">Payment Policy</h2>

        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e2749] mt-2 flex-shrink-0" />
            <span className="text-gray-700">Payment is due upon receipt of invoice</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e2749] mt-2 flex-shrink-0" />
            <span className="text-gray-700">Payment is processed automatically per your agreement terms</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e2749] mt-2 flex-shrink-0" />
            <span className="text-gray-700">Credit card processing fees are the responsibility of the partner school</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e2749] mt-2 flex-shrink-0" />
            <span className="text-gray-700">For billing questions or invoice disputes, contact our team directly</span>
          </li>
        </ul>
      </div>

      {/* Section 4: Billing Contact CTA */}
      <div className="rounded-2xl p-8 md:p-10 text-center" style={{ backgroundColor: '#1B2A4A' }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-white" />
          <h3 className="text-xl md:text-2xl font-bold text-white">Questions About Your Invoice?</h3>
        </div>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">
          Our team is here to help with any billing questions, payment concerns, or contract clarifications.
          Reach out and we&apos;ll get back to you within one business day.
        </p>

        <a
          href={`mailto:omar@teachersdeserveit.com?subject=Billing Question - ${encodeURIComponent(schoolName)}&body=Hi Omar, I have a question about my partnership billing.`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-[#1e2749] transition-all hover:opacity-90"
          style={{ backgroundColor: '#F59E0B' }}
        >
          Contact Our Billing Team
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
