'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Users,
  Building,
  Hand,
  UserCheck,
  Megaphone,
  Target,
  Shuffle,
  Info,
  Loader2
} from 'lucide-react';

export default function PilotSelectionForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Selection Approach
    selectionMethods: [] as string[],
    pilotSize: '15',

    // Step 2: Building Selection
    selectedBuildings: [] as string[],
    buildingRationale: '',

    // Step 3: Para Identification
    knownParas: '',
    paraQualities: '',
    voluntaryInterest: '',

    // Step 4: Goals & Context
    topGoals: [] as string[],
    specificChallenges: '',
    successLookLike: '',
    additionalNotes: ''
  });

  const totalSteps = 4;

  // ASD4 Buildings (9 schools)
  const buildings = [
    'Addison Trail High School',
    'Army Trail Elementary',
    'Fullerton Elementary',
    'Indian Trail Elementary',
    'Lake Park Elementary',
    'Lincoln Elementary',
    'Stone Elementary',
    'Wesley Elementary',
    'Westfield Middle School'
  ];

  const selectionOptions = [
    {
      id: 'building',
      label: 'Building-Based',
      description: 'All paras at one or two specific schools',
      icon: Building
    },
    {
      id: 'voluntary',
      label: 'Voluntary Opt-In',
      description: 'Paras who want extra coaching and support',
      icon: Hand
    },
    {
      id: 'admin',
      label: 'Admin-Identified',
      description: 'Leadership selects paras who would benefit most',
      icon: UserCheck
    },
    {
      id: 'advocates',
      label: 'Loudest Advocates',
      description: 'Most enthusiastic paras who\'ll champion the work',
      icon: Megaphone
    },
    {
      id: 'need',
      label: 'Need-Based',
      description: 'Paras supporting highest-need students (behavior, IEP-heavy)',
      icon: Target
    },
    {
      id: 'mixed',
      label: 'Mixed Approach',
      description: 'Combination of methods above',
      icon: Shuffle
    }
  ];

  const goalOptions = [
    'Increase para confidence in student support strategies',
    'Improve teacher-para collaboration',
    'Reduce para stress and burnout',
    'Build de-escalation skills',
    'Strengthen small group instruction',
    'Improve para retention',
    'Create para leaders who can mentor others',
    'Better support for IEP/EL/504 students'
  ];

  const handleMethodToggle = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      selectionMethods: prev.selectionMethods.includes(methodId)
        ? prev.selectionMethods.filter(m => m !== methodId)
        : [...prev.selectionMethods, methodId]
    }));
  };

  const handleBuildingToggle = (building: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBuildings: prev.selectedBuildings.includes(building)
        ? prev.selectedBuildings.filter(b => b !== building)
        : [...prev.selectedBuildings, building]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      topGoals: prev.topGoals.includes(goal)
        ? prev.topGoals.filter(g => g !== goal)
        : prev.topGoals.length < 3
          ? [...prev.topGoals, goal]
          : prev.topGoals
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'c62a3d76-61c6-4168-938b-5271c96755bf',
          subject: 'ASD4 Pilot Group Selection Form Submitted',
          from_name: 'ASD4 Dashboard',

          // Form Data
          'Selection Methods': formData.selectionMethods.join(', '),
          'Pilot Group Size': formData.pilotSize,
          'Selected Buildings': formData.selectedBuildings.join(', ') || 'N/A',
          'Building Rationale': formData.buildingRationale || 'N/A',
          'Known Paras for Pilot': formData.knownParas || 'N/A',
          'What Makes Them Good Candidates': formData.paraQualities || 'N/A',
          'Voluntary Interest Notes': formData.voluntaryInterest || 'N/A',
          'Top Goals (up to 3)': formData.topGoals.join(', '),
          'Specific Challenges': formData.specificChallenges || 'N/A',
          'What Success Looks Like': formData.successLookLike || 'N/A',
          'Additional Notes': formData.additionalNotes || 'N/A'
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1e2749] mb-2">Pilot Group Selection Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you! Rae will review your selections and follow up to finalize your pilot group before your first observation.
          </p>
          <a
            href="/asd4-dashboard"
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2d3a5c] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-[#1e2749] text-white py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <a
            href="/asd4-dashboard"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold">Select Your Pilot Group</h1>
          <p className="text-white/80 mt-1">
            Choose 10-20 paras for focused observation and coaching support
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-[#1e2749]">
              {step === 1 && 'Selection Approach'}
              {step === 2 && 'Building Selection'}
              {step === 3 && 'Identify Paras'}
              {step === 4 && 'Goals & Context'}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ffba06] rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Step 1: Selection Approach */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">How do you want to select your pilot group?</h2>
              <p className="text-gray-600 text-sm">
                Select one or more approaches. We'll help you identify 10-20 paras for focused support.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-[#35A7FF]/10 border border-[#35A7FF]/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-[#1e2749] mb-1">Your Unique Setup</p>
                  <p>All 117 paras have Learning Hub memberships. The pilot group receives focused observation visits and personalized coaching. Their wins and strategies will be shared with the full team.</p>
                </div>
              </div>
            </div>

            {/* Selection Options */}
            <div className="space-y-3">
              {selectionOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.selectionMethods.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleMethodToggle(option.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#ffba06] bg-[#ffba06]/5'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#ffba06]' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#1e2749]' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1e2749]">{option.label}</span>
                          {isSelected && <CheckCircle className="w-5 h-5 text-[#ffba06]" />}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pilot Size Slider */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block font-semibold text-[#1e2749] mb-3">
                How many paras for the pilot group?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="25"
                  value={formData.pilotSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, pilotSize: e.target.value }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ffba06]"
                />
                <div className="w-16 text-center">
                  <span className="text-2xl font-bold text-[#1e2749]">{formData.pilotSize}</span>
                  <span className="text-xs text-gray-500 block">paras</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Recommended: 10-20 for focused impact</p>
            </div>
          </div>
        )}

        {/* Step 2: Building Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Which buildings are you considering?</h2>
              <p className="text-gray-600 text-sm">
                {formData.selectionMethods.includes('building')
                  ? 'Select the building(s) where your pilot paras work.'
                  : 'Even if not doing building-based selection, this helps us plan observation logistics.'}
              </p>
            </div>

            {/* Building Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {buildings.map((building) => {
                const isSelected = formData.selectedBuildings.includes(building);
                return (
                  <button
                    key={building}
                    onClick={() => handleBuildingToggle(building)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#ffba06] bg-[#ffba06]/5'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className={`w-4 h-4 ${isSelected ? 'text-[#ffba06]' : 'text-gray-400'}`} />
                        <span className={`font-medium ${isSelected ? 'text-[#1e2749]' : 'text-gray-700'}`}>
                          {building}
                        </span>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-[#ffba06]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Rationale */}
            {formData.selectedBuildings.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <label className="block font-semibold text-[#1e2749] mb-2">
                  Why these building(s)? (optional)
                </label>
                <textarea
                  value={formData.buildingRationale}
                  onChange={(e) => setFormData(prev => ({ ...prev, buildingRationale: e.target.value }))}
                  placeholder="E.g., highest para turnover, most engaged principal, highest student needs..."
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#ffba06]/50"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Identify Paras */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Help us identify pilot paras</h2>
              <p className="text-gray-600 text-sm">
                Share any names, qualities, or interest you've already noticed.
              </p>
            </div>

            {/* Known Names */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block font-semibold text-[#1e2749] mb-2">
                Any paras already come to mind?
              </label>
              <p className="text-sm text-gray-500 mb-3">
                List names of paras you're considering, or leave blank if undecided.
              </p>
              <textarea
                value={formData.knownParas}
                onChange={(e) => setFormData(prev => ({ ...prev, knownParas: e.target.value }))}
                placeholder="E.g., Maria Garcia, Scott Nyquist, Patricia Alvarado..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#ffba06]/50"
              />
            </div>

            {/* What makes good candidates */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block font-semibold text-[#1e2749] mb-2">
                What makes someone a good pilot candidate?
              </label>
              <textarea
                value={formData.paraQualities}
                onChange={(e) => setFormData(prev => ({ ...prev, paraQualities: e.target.value }))}
                placeholder="E.g., eager to learn, influences others, struggling but willing, natural leader..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#ffba06]/50"
              />
            </div>

            {/* Voluntary Interest */}
            {formData.selectionMethods.includes('voluntary') && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <label className="block font-semibold text-[#1e2749] mb-2">
                  Have any paras expressed interest in extra support?
                </label>
                <textarea
                  value={formData.voluntaryInterest}
                  onChange={(e) => setFormData(prev => ({ ...prev, voluntaryInterest: e.target.value }))}
                  placeholder="E.g., 'Three paras at Lincoln asked about getting more coaching after the Hub intro...'"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#ffba06]/50"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Goals & Context */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">What do you want to achieve?</h2>
              <p className="text-gray-600 text-sm">
                This helps us tailor observation focus and coaching conversations.
              </p>
            </div>

            {/* Goal Selection */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block font-semibold text-[#1e2749] mb-2">
                Top goals for your pilot group (select up to 3)
              </label>
              <div className="space-y-2">
                {goalOptions.map((goal) => {
                  const isSelected = formData.topGoals.includes(goal);
                  const isDisabled = !isSelected && formData.topGoals.length >= 3;
                  return (
                    <button
                      key={goal}
                      onClick={() => handleGoalToggle(goal)}
                      disabled={isDisabled}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-[#ffba06] bg-[#ffba06]/10'
                          : isDisabled
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isSelected ? 'text-[#1e2749] font-medium' : 'text-gray-700'}`}>
                          {goal}
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-[#ffba06]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.topGoals.length}/3 selected
              </p>
            </div>

            {/* Specific Challenges */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block font-semibold text-[#1e2749] mb-2">
                Any specific challenges these paras face?
              </label>
              <textarea
                value={formData.specificChallenges}
                onChange={(e) => setFormData(prev => ({ ...prev, specificChallenges: e.target.value }))}
                placeholder="E.g., high behavior classrooms, unclear expectations from teachers, limited training..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#ffba06]/50"
              />
            </div>

            {/* Success Definition */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block font-semibold text-[#1e2749] mb-2">
                What does success look like by May?
              </label>
              <textarea
                value={formData.successLookLike}
                onChange={(e) => setFormData(prev => ({ ...prev, successLookLike: e.target.value }))}
                placeholder="E.g., pilot paras reporting higher confidence, teachers noticing improved support, paras sharing strategies with peers..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#ffba06]/50"
              />
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <label className="block font-semibold text-[#1e2749] mb-2">
                Anything else we should know?
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any other context, concerns, or ideas..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#ffba06]/50"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1e2749] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && formData.selectionMethods.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                step === 1 && formData.selectionMethods.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#1e2749] text-white hover:bg-[#2d3a5c]'
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || formData.topGoals.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isSubmitting || formData.topGoals.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#ffba06] text-[#1e2749] hover:bg-[#e5a805]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Selection
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
