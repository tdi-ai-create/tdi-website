'use client';

import { useState } from 'react';
import {
  GraduationCap,
  MessageSquare,
  Target,
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function PartnerDataPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add metadata
    formData.append('subject', 'St. Peter Chanel Partnership Data Submitted');
    formData.append('from_name', 'TDI Partner Dashboard');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-lg text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Thank You, Paula!</h1>
          <p className="text-gray-600 mb-6">
            Your data has been submitted. Rae will update your dashboard with this information and follow up with you soon.
          </p>
          <a
            href="/stpchanel-dashboard"
            className="inline-flex items-center gap-2 bg-[#35A7FF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2089e5] transition-colors"
          >
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-[#1e2749] text-white rounded-t-2xl p-6">
          <div className="text-sm text-white/70 mb-1">Teachers Deserve It</div>
          <h1 className="text-2xl font-bold">St. Peter Chanel Partnership Data</h1>
        </div>

        {/* Intro */}
        <div className="bg-white border-x border-gray-200 p-6">
          <p className="text-gray-600">
            Hi Paula! This form helps us customize your dashboard with real school data and make sure we&apos;re focused on what matters most to you.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Takes about 5-10 minutes. You may need to reference your assessment data.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border-x border-b border-gray-200 rounded-b-2xl">

          {/* Hidden Web3Forms access key */}
          <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY_HERE" />
          <input type="hidden" name="school" value="St. Peter Chanel" />

          {/* SECTION 1: Student Performance */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-[#38618C]" />
              <h2 className="font-semibold text-[#1e2749]">Student Performance</h2>
            </div>

            {/* Q1 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your school-wide average classroom grade (approximately)?
              </label>
              <select name="avg_classroom_grade" required className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent">
                <option value="">Select...</option>
                <option value="A (90-100%)">A (90-100%)</option>
                <option value="B (80-89%)">B (80-89%)</option>
                <option value="C (70-79%)">C (70-79%)</option>
                <option value="D or below">D or below</option>
                <option value="Varies widely by grade">Varies widely by grade</option>
              </select>
            </div>

            {/* Q2 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What were your most recent benchmark/standardized test results?
                <span className="block text-gray-500 font-normal text-xs mt-1">Overall % proficient or Mastery+ — include the test name if possible</span>
              </label>
              <textarea
                name="benchmark_results"
                rows={3}
                placeholder="e.g., LEAP 2025: 42% Mastery+, iReady Fall: 38% on grade level..."
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>

            {/* Q3 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which grade levels show the biggest gap between classroom grades and test scores?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['PreK-K', '1st-2nd', '3rd-4th', '5th-6th', '7th-8th', 'Not sure', 'No significant gap'].map((grade) => (
                  <label key={grade} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="gap_grades" value={grade} className="rounded text-[#35A7FF]" />
                    {grade}
                  </label>
                ))}
              </div>
            </div>

            {/* Q4 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which subjects show the biggest gap?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['ELA/Reading', 'Math', 'Science', 'Social Studies', 'Not sure', 'No significant gap'].map((subject) => (
                  <label key={subject} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="gap_subjects" value={subject} className="rounded text-[#35A7FF]" />
                    {subject}
                  </label>
                ))}
              </div>
            </div>

            {/* Q5 */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do YOU think is causing the gap between classroom grades and test scores?
              </label>
              <textarea
                name="gap_cause_opinion"
                rows={3}
                placeholder="Your perspective on why this gap exists..."
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* SECTION 2: Partnership Feedback */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#38618C]" />
              <h2 className="font-semibold text-[#1e2749]">Partnership Feedback</h2>
            </div>

            {/* Q6 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s been most valuable about the TDI partnership so far?
              </label>
              <textarea
                name="most_valuable"
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>

            {/* Q7 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What could we do differently or better?
              </label>
              <textarea
                name="do_better"
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>

            {/* Q8 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are teachers responding to the personalized Love Notes?
              </label>
              <select name="love_note_response" className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent">
                <option value="">Select...</option>
                <option value="Very positively">Very positively</option>
                <option value="Mostly positive">Mostly positive</option>
                <option value="Mixed reactions">Mixed reactions</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            {/* Q9 */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Are there any specific teachers you&apos;d like us to focus on or check in with?
              </label>
              <textarea
                name="teacher_focus"
                rows={2}
                placeholder="Names and context (optional)..."
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* SECTION 3: Goals */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#38618C]" />
              <h2 className="font-semibold text-[#1e2749]">Goals</h2>
            </div>

            {/* Q10 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What does success look like for St. Peter Chanel by the end of this school year?
              </label>
              <textarea
                name="success_this_year"
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>

            {/* Q11 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What goals do you have for next school year that we should be thinking about?
              </label>
              <textarea
                name="goals_next_year"
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>

            {/* Q12 */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any concerns or challenges you want to make sure we address?
              </label>
              <textarea
                name="concerns"
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* SECTION 4: Scheduling */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#38618C]" />
              <h2 className="font-semibold text-[#1e2749]">Scheduling</h2>
            </div>

            {/* Q13 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What days/times work best for the virtual teacher sessions?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Days:</p>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <label key={day} className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                      <input type="checkbox" name="session_days" value={day} className="rounded text-[#35A7FF]" />
                      {day}
                    </label>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Times:</p>
                  {['Morning', 'Afternoon', 'After school'].map((time) => (
                    <label key={time} className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                      <input type="checkbox" name="session_times" value={time} className="rounded text-[#35A7FF]" />
                      {time}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Q14 */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred month for Spring Leadership Recap?
              </label>
              <select name="recap_month" className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent">
                <option value="">Select...</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
              </select>
            </div>
          </div>

          {/* SECTION 5: Anything Else */}
          <div className="p-6 border-b border-gray-100">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anything else you want Rae to know?
              </label>
              <textarea
                name="anything_else"
                rows={4}
                placeholder="This is your space — share anything on your mind..."
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-[#35A7FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="p-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#35A7FF] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#2089e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Partnership Data'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Rae will receive your responses and update your dashboard accordingly.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
