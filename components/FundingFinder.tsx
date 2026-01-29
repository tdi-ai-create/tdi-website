'use client';

import { useState } from 'react';
import {
  CheckCircle,
  School,
  DollarSign,
  Target,
  User,
} from 'lucide-react';

type Step = 'commitments' | 'school-info' | 'funding-context' | 'goals' | 'contact' | 'success';

interface FormData {
  // Commitments
  commitment1: boolean;
  commitment2: boolean;
  commitment3: boolean;
  commitment4: boolean;
  // School Info
  schoolName: string;
  district: string;
  state: string;
  schoolType: string;
  studentCount: string;
  titleIStatus: string;
  // Funding Context
  currentBudget: string;
  budgetCycle: string;
  previousFunding: string;
  decisionMakers: string;
  // Goals
  primaryGoal: string;
  timeline: string;
  additionalContext: string;
  // Contact
  name: string;
  email: string;
  phone: string;
  role: string;
  bestTimeToCall: string;
}

const initialFormData: FormData = {
  commitment1: false,
  commitment2: false,
  commitment3: false,
  commitment4: false,
  schoolName: '',
  district: '',
  state: '',
  schoolType: '',
  studentCount: '',
  titleIStatus: '',
  currentBudget: '',
  budgetCycle: '',
  previousFunding: '',
  decisionMakers: '',
  primaryGoal: '',
  timeline: '',
  additionalContext: '',
  name: '',
  email: '',
  phone: '',
  role: '',
  bestTimeToCall: '',
};

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export default function FundingFinder() {
  const [step, setStep] = useState<Step>('commitments');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const allCommitmentsChecked = formData.commitment1 && formData.commitment2 && formData.commitment3 && formData.commitment4;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '340a4593-a336-405f-a644-2b2867f96047',
          subject: `Funding Finder Request: ${formData.schoolName}`,
          from_name: formData.name,
          replyto: formData.email,
          // Formatted message
          message: `
FUNDING FINDER REQUEST
======================

SCHOOL INFORMATION
------------------
School Name: ${formData.schoolName}
District: ${formData.district || 'Not provided'}
State: ${formData.state}
School Type: ${formData.schoolType}
Student Count: ${formData.studentCount || 'Not provided'}
Title I Status: ${formData.titleIStatus || 'Not provided'}

FUNDING CONTEXT
---------------
Current PD Budget: ${formData.currentBudget || 'Not provided'}
Budget Cycle End: ${formData.budgetCycle || 'Not provided'}
Previous Grant Funding: ${formData.previousFunding || 'Not provided'}
Decision Makers: ${formData.decisionMakers || 'Not provided'}

GOALS
-----
Primary Goal: ${formData.primaryGoal}
Timeline: ${formData.timeline}
Additional Context: ${formData.additionalContext || 'None provided'}

CONTACT INFORMATION
-------------------
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Role: ${formData.role}
Best Time to Call: ${formData.bestTimeToCall || 'Not specified'}
          `.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
      } else {
        setSubmitError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('Unable to submit form. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    const steps: Step[] = ['commitments', 'school-info', 'funding-context', 'goals', 'contact'];
    const currentIndex = steps.indexOf(step);
    if (step === 'success') return 100;
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ffba06] focus:ring-2 focus:ring-[#ffba06]/20 outline-none transition-all";
  const selectClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ffba06] focus:ring-2 focus:ring-[#ffba06]/20 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-medium text-[#1e2749] mb-2";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step !== 'success' && (
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ffba06] transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Step {['commitments', 'school-info', 'funding-context', 'goals', 'contact'].indexOf(step) + 1} of 5
          </p>
        </div>
      )}

      {/* Step 1: Commitments */}
      {step === 'commitments' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#1e2749] mb-2">Before We Find Your Funding...</h3>
            <p className="text-gray-600">Just confirm you're ready to let us do the heavy lifting.</p>
          </div>

          <div className="space-y-4">
            {[
              { field: 'commitment1' as const, label: 'Yes, research my funding options for me', subtext: "You don't have to research anything" },
              { field: 'commitment2' as const, label: 'Yes, write my grant language for me', subtext: "You don't have to write a single word" },
              { field: 'commitment3' as const, label: 'Yes, prepare my board proposal for me', subtext: "You just review and submit" },
              { field: 'commitment4' as const, label: 'Yes, I want this free service', subtext: "No obligation, no pressure" },
            ].map(({ field, label, subtext }) => (
              <label
                key={field}
                className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  formData[field]
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData[field]}
                  onChange={(e) => updateFormData(field, e.target.checked)}
                  className="w-5 h-5 mt-1 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: '#1e2749' }}>{label}</span>
                    {formData[field] && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{subtext}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={() => setStep('school-info')}
            disabled={!allCommitmentsChecked}
            className="w-full py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: allCommitmentsChecked ? '#ffba06' : '#e5e7eb',
              color: '#1e2749'
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: School Info */}
      {step === 'school-info' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#1e2749] flex items-center justify-center mx-auto mb-4">
              <School className="w-8 h-8 text-[#ffba06]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1e2749] mb-2">Tell Us About Your School</h3>
            <p className="text-gray-600">This helps us identify the best funding options</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>School Name *</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => updateFormData('schoolName', e.target.value)}
                className={inputClass}
                placeholder="e.g., Lincoln Elementary School"
              />
            </div>

            <div>
              <label className={labelClass}>District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => updateFormData('district', e.target.value)}
                className={inputClass}
                placeholder="e.g., Springfield Public Schools"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>School Type *</label>
                <select
                  value={formData.schoolType}
                  onChange={(e) => updateFormData('schoolType', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select Type</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="charter">Charter</option>
                  <option value="parochial">Parochial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Student Count</label>
                <select
                  value={formData.studentCount}
                  onChange={(e) => updateFormData('studentCount', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select Range</option>
                  <option value="under-200">Under 200</option>
                  <option value="200-500">200-500</option>
                  <option value="500-1000">500-1,000</option>
                  <option value="1000-2000">1,000-2,000</option>
                  <option value="over-2000">Over 2,000</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Title I Status</label>
                <select
                  value={formData.titleIStatus}
                  onChange={(e) => updateFormData('titleIStatus', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select Status</option>
                  <option value="title-i">Title I School</option>
                  <option value="non-title-i">Non-Title I</option>
                  <option value="not-sure">Not Sure</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('commitments')}
              className="flex-1 py-4 rounded-lg font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep('funding-context')}
              disabled={!formData.schoolName || !formData.state || !formData.schoolType}
              className="flex-1 py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Funding Context */}
      {step === 'funding-context' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#1e2749] flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-[#ffba06]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1e2749] mb-2">Current Funding Situation</h3>
            <p className="text-gray-600">Help us understand your budget landscape</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Current PD Budget (if known)</label>
              <select
                value={formData.currentBudget}
                onChange={(e) => updateFormData('currentBudget', e.target.value)}
                className={selectClass}
              >
                <option value="">Select Range</option>
                <option value="under-10k">Under $10,000</option>
                <option value="10k-25k">$10,000 - $25,000</option>
                <option value="25k-50k">$25,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="over-100k">Over $100,000</option>
                <option value="unknown">Not Sure</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>When does your budget cycle end?</label>
              <select
                value={formData.budgetCycle}
                onChange={(e) => updateFormData('budgetCycle', e.target.value)}
                className={selectClass}
              >
                <option value="">Select Timeframe</option>
                <option value="june">June (End of School Year)</option>
                <option value="september">September (Calendar Q3)</option>
                <option value="december">December (Calendar Year End)</option>
                <option value="other">Other</option>
                <option value="not-sure">Not Sure</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Have you used grant funding for PD before?</label>
              <select
                value={formData.previousFunding}
                onChange={(e) => updateFormData('previousFunding', e.target.value)}
                className={selectClass}
              >
                <option value="">Select Option</option>
                <option value="yes-title">Yes - Title II or other federal</option>
                <option value="yes-state">Yes - State grants</option>
                <option value="yes-foundation">Yes - Foundation/private grants</option>
                <option value="yes-multiple">Yes - Multiple sources</option>
                <option value="no">No - Never used grants for PD</option>
                <option value="not-sure">Not Sure</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Who approves PD spending at your school?</label>
              <select
                value={formData.decisionMakers}
                onChange={(e) => updateFormData('decisionMakers', e.target.value)}
                className={selectClass}
              >
                <option value="">Select Option</option>
                <option value="principal">Principal</option>
                <option value="curriculum-director">Curriculum Director</option>
                <option value="superintendent">Superintendent</option>
                <option value="school-board">School Board</option>
                <option value="committee">PD Committee</option>
                <option value="multiple">Multiple Approvers</option>
                <option value="not-sure">Not Sure</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('school-info')}
              className="flex-1 py-4 rounded-lg font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep('goals')}
              className="flex-1 py-4 rounded-lg font-bold transition-all"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Goals */}
      {step === 'goals' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#1e2749] flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-[#ffba06]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1e2749] mb-2">Your Goals</h3>
            <p className="text-gray-600">What are you hoping to achieve?</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Primary Goal for PD *</label>
              <select
                value={formData.primaryGoal}
                onChange={(e) => updateFormData('primaryGoal', e.target.value)}
                className={selectClass}
              >
                <option value="">Select Your Primary Goal</option>
                <option value="teacher-retention">Improve teacher retention</option>
                <option value="teacher-wellness">Support teacher wellness/prevent burnout</option>
                <option value="school-culture">Build stronger school culture</option>
                <option value="instructional">Enhance instructional practices</option>
                <option value="leadership">Develop teacher leadership</option>
                <option value="new-teachers">Support new teachers</option>
                <option value="team-building">Strengthen team collaboration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Ideal Timeline *</label>
              <select
                value={formData.timeline}
                onChange={(e) => updateFormData('timeline', e.target.value)}
                className={selectClass}
              >
                <option value="">When would you like to start?</option>
                <option value="asap">As soon as possible</option>
                <option value="this-semester">This semester</option>
                <option value="next-semester">Next semester</option>
                <option value="next-school-year">Next school year</option>
                <option value="exploring">Just exploring options</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Anything else we should know?</label>
              <textarea
                value={formData.additionalContext}
                onChange={(e) => updateFormData('additionalContext', e.target.value)}
                className={`${inputClass} min-h-[100px] resize-none`}
                placeholder="Share any specific challenges, previous PD experiences, or questions you have..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('funding-context')}
              className="flex-1 py-4 rounded-lg font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep('contact')}
              disabled={!formData.primaryGoal || !formData.timeline}
              className="flex-1 py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Contact */}
      {step === 'contact' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#1e2749] flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[#ffba06]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1e2749] mb-2">Almost Done!</h3>
            <p className="text-gray-600">How can we reach you?</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Your Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-yellow-400 focus:outline-none"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-yellow-400 focus:outline-none"
                placeholder="you@school.edu"
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-yellow-400 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Your Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => updateFormData('role', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select Role</option>
                  <option value="principal">Principal</option>
                  <option value="assistant-principal">Assistant Principal</option>
                  <option value="curriculum-director">Curriculum Director</option>
                  <option value="pd-coordinator">PD Coordinator</option>
                  <option value="department-head">Department Head</option>
                  <option value="teacher-leader">Teacher Leader</option>
                  <option value="superintendent">Superintendent</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Best Time to Call</label>
                <select
                  value={formData.bestTimeToCall}
                  onChange={(e) => updateFormData('bestTimeToCall', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select Time</option>
                  <option value="morning">Morning (8am-12pm)</option>
                  <option value="afternoon">Afternoon (12pm-4pm)</option>
                  <option value="after-school">After School (4pm-6pm)</option>
                  <option value="email-only">Email Only Please</option>
                </select>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('goals')}
              className="flex-1 py-4 rounded-lg font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email || !formData.role || isSubmitting}
              className="flex-1 py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              {isSubmitting ? 'Submitting...' : 'Find My Funding Options'}
            </button>
          </div>
        </div>
      )}

      {/* Success State */}
      {step === 'success' && (
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-[#1e2749] mb-4">
            You're on the List!
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our funding specialist will review your information and reach out within 24 hours
            with personalized funding options for <strong>{formData.schoolName}</strong>.
          </p>
          <div className="bg-[#f5f5f5] rounded-xl p-6 max-w-sm mx-auto">
            <p className="text-sm text-gray-600 mb-2">What happens next:</p>
            <ul className="text-left text-sm space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>We research funding options for your school</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>We prepare a customized funding plan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>We schedule a brief call to discuss options</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
