import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  LayoutDashboard,
  Sparkles,
  Lock,
  ArrowLeft,
} from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="w-full pt-6 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pt-8 pb-16 md:pt-12 md:pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo.webp"
                alt="Teachers Deserve It"
                width={140}
                height={42}
                className="h-10 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-base">
              Choose where you&apos;d like to go
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1: Learning Hub */}
            <a
              href="https://tdi.thinkific.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out cursor-pointer border-t-4 border-[#4ecdc4] p-6 md:p-8 flex flex-col"
            >
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-5">
                <BookOpen className="w-7 h-7 text-[#4ecdc4]" />
              </div>
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
                Learning Hub
              </h2>
              <p className="text-gray-600 text-sm mb-6 flex-1">
                Access your courses, resources, and strategies from the TDI library. Over 33 courses designed by real educators.
              </p>
              <div className="w-full bg-[#4ecdc4] text-white py-2.5 rounded-lg font-semibold text-sm text-center hover:brightness-95 transition-all">
                Go to Learning Hub &rarr;
              </div>
            </a>

            {/* Card 2: Leadership Dashboard */}
            <a
              href="/partners/login"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out cursor-pointer border-t-4 border-[#1B2A4A] p-6 md:p-8 flex flex-col"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                <LayoutDashboard className="w-7 h-7 text-[#1B2A4A]" />
              </div>
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
                Leadership Dashboard
              </h2>
              <p className="text-gray-600 text-sm mb-6 flex-1">
                View your partnership dashboard, track progress, complete action items, and connect with your TDI team.
              </p>
              <div className="w-full bg-[#1B2A4A] text-white py-2.5 rounded-lg font-semibold text-sm text-center hover:bg-[#2c3e5f] transition-colors">
                Go to Dashboard &rarr;
              </div>
            </a>

            {/* Card 3: Creator Portal */}
            <a
              href="/creator-portal"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out cursor-pointer border-t-4 border-[#FFBA06] p-6 md:p-8 flex flex-col"
            >
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-5">
                <Sparkles className="w-7 h-7 text-[#FFBA06]" />
              </div>
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
                Creator Portal
              </h2>
              <p className="text-gray-600 text-sm mb-6 flex-1">
                Manage your creator journey, track milestones, and collaborate with the TDI team to build courses that help educators.
              </p>
              <div className="w-full bg-[#FFBA06] text-[#1B2A4A] py-2.5 rounded-lg font-semibold text-sm text-center hover:bg-[#e5a805] transition-colors">
                Go to Creator Portal &rarr;
              </div>
            </a>
          </div>

          {/* Admin Bar */}
          <a
            href="/tdi-admin"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 w-full border border-gray-200 rounded-lg py-3 px-6 flex items-center justify-between hover:border-gray-300 transition-colors duration-200"
          >
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">TDI Team</span>
            </div>
            <span className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">
              Administrative Login &rarr;
            </span>
          </a>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Need help? Contact us at{' '}
              <a
                href="mailto:hello@teachersdeserveit.com"
                className="text-gray-500 hover:text-gray-700 underline"
              >
                hello@teachersdeserveit.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
