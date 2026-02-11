'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, ChevronDown, Eye } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/hub-auth';
import { isAdmin } from '@/lib/hub/admin';
import {
  generateEmailHTML,
  getEmailSubject,
  sampleEmailData,
  type EmailType,
} from '@/lib/hub/emails';

const EMAIL_OPTIONS: { value: EmailType; label: string; description: string }[] = [
  {
    value: 'welcome',
    label: 'Welcome Email',
    description: 'Sent immediately after first sign-in',
  },
  {
    value: 'nudge',
    label: 'Week 2 Nudge',
    description: 'Sent 14 days after signup if no enrollments',
  },
  {
    value: 'digest',
    label: 'Monthly Digest',
    description: 'Sent on the 1st of each month',
  },
];

export default function AdminEmailsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailType>('welcome');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/hub/login');
          return;
        }

        const adminStatus = await isAdmin(user.id, user.email || undefined);
        if (!adminStatus) {
          router.push('/hub');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/hub');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3A67]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const selectedOption = EMAIL_OPTIONS.find((e) => e.value === selectedEmail)!;
  const emailHtml = generateEmailHTML(selectedEmail, sampleEmailData[selectedEmail]);
  const emailSubject = getEmailSubject(selectedEmail);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/hub/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-[#2B3A67]">
                  Email Templates
                </h1>
                <p className="text-sm text-gray-500">
                  Preview email templates with sample data
                </p>
              </div>
            </div>

            {/* Email Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[240px]"
              >
                <Mail size={18} className="text-[#2B3A67]" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedOption.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedOption.description}
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {EMAIL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedEmail(option.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedEmail === option.value ? 'bg-[#2B3A67]/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Mail
                          size={18}
                          className={
                            selectedEmail === option.value
                              ? 'text-[#2B3A67]'
                              : 'text-gray-400'
                          }
                        />
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              selectedEmail === option.value
                                ? 'text-[#2B3A67]'
                                : 'text-gray-900'
                            }`}
                          >
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Line */}
        <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Subject:</span>
            <span className="font-medium text-gray-900">{emailSubject}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="text-gray-500">From:</span>
            <span className="text-gray-900">
              Teachers Deserve It &lt;hub@teachersdeserveit.com&gt;
            </span>
          </div>
        </div>

        {/* Preview Label */}
        <div className="flex items-center gap-2 mb-4">
          <Eye size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">
            Preview (rendered with sample data)
          </span>
        </div>

        {/* Email Frame */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <iframe
            srcDoc={emailHtml}
            title="Email Preview"
            className="w-full border-0"
            style={{ height: '800px' }}
          />
        </div>

        {/* Sample Data Info */}
        <div className="mt-6 p-4 bg-[#2B3A67]/5 rounded-lg">
          <h3 className="text-sm font-medium text-[#2B3A67] mb-2">
            Sample Data Used
          </h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(sampleEmailData[selectedEmail], null, 2)}
          </pre>
        </div>

        {/* Notes */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-sm font-medium text-amber-800 mb-2">
            Implementation Notes
          </h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>
              &bull; Email sending is not yet configured. These are template
              previews only.
            </li>
            <li>
              &bull; Welcome email: Triggered on first sign-in (not yet
              implemented)
            </li>
            <li>
              &bull; Week 2 Nudge: Requires a scheduled job (cron) to check
              users
            </li>
            <li>
              &bull; Monthly Digest: Requires a scheduled job on the 1st of each
              month
            </li>
            <li>
              &bull; Provider options: Resend, SendGrid, or AWS SES
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
