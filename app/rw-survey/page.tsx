'use client';

import React, { useState, useCallback, memo } from 'react';

// Component definitions moved outside to prevent re-creation on every render
const ScaleSelector = memo(({
  value,
  onChange,
  min,
  max,
  labels,
}: {
  value: number | null;
  onChange: (v: number) => void;
  min: number;
  max: number;
  labels: { [key: number]: string };
}) => (
  <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-lg font-medium transition-all ${
            value === n
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
    <div className="flex justify-between text-xs text-slate-500">
      {Object.entries(labels).map(([key, label]) => (
        <span key={key}>{key} = {label}</span>
      ))}
    </div>
  </div>
));
ScaleSelector.displayName = 'ScaleSelector';

const RadioGroup = memo(({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => (
  <div className="flex flex-wrap gap-3">
    {options.map(opt => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          value === opt
            ? 'bg-teal-600 text-white shadow-md'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
));
RadioGroup.displayName = 'RadioGroup';

const TextArea = memo(({
  value,
  onChange,
  placeholder,
  required = true,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={4}
    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none transition-all ${
      required && value.trim() === '' ? 'border-slate-200' : 'border-slate-200'
    }`}
  />
));
TextArea.displayName = 'TextArea';

const QuestionBlock = memo(({
  number,
  question,
  children,
  optional = false,
}: {
  number: number;
  question: string;
  children: React.ReactNode;
  optional?: boolean;
}) => (
  <div className="space-y-3">
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        Q{number}. {question}
        {optional && <span className="ml-2 text-slate-400 font-normal">(optional)</span>}
      </span>
    </label>
    {children}
  </div>
));
QuestionBlock.displayName = 'QuestionBlock';

type FormData = {
  // Section 1
  overall_stress_level: number | null;
  energy_level: number | null;
  confidence_level: number | null;
  team_morale: number | null;
  supported_by_leadership: number | null;
  // Section 2
  hours_worked_per_week: string;
  hours_feel_sustainable: string;
  time_biggest_drain: string;
  // Section 3
  pipeline_confidence: number | null;
  last_month_reflection: string;
  biggest_win_last_month: string;
  biggest_challenge_last_month: string;
  lead_or_deal_on_mind: string;
  // Section 4
  most_common_objection: string;
  part_of_process_feels_hard: string;
  something_being_avoided: string;
  tools_and_resources_adequate: string;
  tools_missing: string;
  // Section 5
  part_that_energizes: string;
  part_that_drains: string;
  product_knowledge_confidence: number | null;
  product_knowledge_gaps: string;
  // Section 6
  top_priority_next_4_weeks: string;
  what_success_looks_like: string;
  one_thing_to_do_differently: string;
  support_needed: string;
  // Section 7
  leadership_feedback: string;
  team_dynamic_feedback: string;
  safe_to_say: string;
  anything_else: string;
};

const initialFormData: FormData = {
  overall_stress_level: null,
  energy_level: null,
  confidence_level: null,
  team_morale: null,
  supported_by_leadership: null,
  hours_worked_per_week: '',
  hours_feel_sustainable: '',
  time_biggest_drain: '',
  pipeline_confidence: null,
  last_month_reflection: '',
  biggest_win_last_month: '',
  biggest_challenge_last_month: '',
  lead_or_deal_on_mind: '',
  most_common_objection: '',
  part_of_process_feels_hard: '',
  something_being_avoided: '',
  tools_and_resources_adequate: '',
  tools_missing: '',
  part_that_energizes: '',
  part_that_drains: '',
  product_knowledge_confidence: null,
  product_knowledge_gaps: '',
  top_priority_next_4_weeks: '',
  what_success_looks_like: '',
  one_thing_to_do_differently: '',
  support_needed: '',
  leadership_feedback: '',
  team_dynamic_feedback: '',
  safe_to_say: '',
  anything_else: '',
};

const SECTIONS = [
  'How You Are Doing Right Now',
  'Time & Workload',
  'Pipeline Honesty',
  'What Is Getting in the Way',
  'Feelings About the Work',
  'The Next 4 Weeks',
  'Leadership, Team & Anything Else',
];

export default function RWSurveyPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Stable handlers for text inputs to prevent cursor loss
  const handleTextChange = useCallback((field: keyof FormData) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const validateCurrentSection = (): boolean => {
    switch (currentSection) {
      case 0:
        return (
          formData.overall_stress_level !== null &&
          formData.energy_level !== null &&
          formData.confidence_level !== null &&
          formData.team_morale !== null &&
          formData.supported_by_leadership !== null
        );
      case 1:
        return (
          formData.hours_worked_per_week !== '' &&
          formData.hours_feel_sustainable !== '' &&
          formData.time_biggest_drain.trim() !== ''
        );
      case 2:
        return (
          formData.pipeline_confidence !== null &&
          formData.last_month_reflection.trim() !== '' &&
          formData.biggest_win_last_month.trim() !== '' &&
          formData.biggest_challenge_last_month.trim() !== '' &&
          formData.lead_or_deal_on_mind.trim() !== ''
        );
      case 3:
        return (
          formData.most_common_objection.trim() !== '' &&
          formData.part_of_process_feels_hard.trim() !== '' &&
          formData.something_being_avoided.trim() !== '' &&
          formData.tools_and_resources_adequate !== ''
        );
      case 4:
        return (
          formData.part_that_energizes.trim() !== '' &&
          formData.part_that_drains.trim() !== '' &&
          formData.product_knowledge_confidence !== null &&
          formData.product_knowledge_gaps.trim() !== ''
        );
      case 5:
        return (
          formData.top_priority_next_4_weeks.trim() !== '' &&
          formData.what_success_looks_like.trim() !== '' &&
          formData.one_thing_to_do_differently.trim() !== '' &&
          formData.support_needed.trim() !== ''
        );
      case 6:
        return (
          formData.leadership_feedback.trim() !== '' &&
          formData.team_dynamic_feedback.trim() !== '' &&
          formData.safe_to_say.trim() !== ''
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      setCurrentSection(prev => Math.min(prev + 1, SECTIONS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateCurrentSection()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/rw-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit survey');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thank you screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Thank you.</h1>
          <p className="text-slate-600 leading-relaxed mb-6">
            Your responses have been submitted anonymously. Pam will review all submissions together before our next team conversation — no individual answers will be called out.
          </p>
          <p className="text-slate-500 italic">
            This is how we get better together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-800 text-white py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold mb-2">RW Sales Team Reflection Survey</h1>
          <p className="text-slate-300 text-sm">Anonymous · Confidential · Honest</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Section {currentSection + 1} of {SECTIONS.length}
            </span>
            <span className="text-sm text-slate-500">
              {SECTIONS[currentSection]}
            </span>
          </div>
          <div className="flex gap-1">
            {SECTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < currentSection
                    ? 'bg-teal-500'
                    : i === currentSection
                    ? 'bg-teal-300'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Intro (only on first section) */}
        {currentSection === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
            <p className="text-slate-700 leading-relaxed mb-3">
              This survey is completely anonymous. No names, no tracking, no way to identify who submitted what.
            </p>
            <p className="text-slate-700 leading-relaxed mb-3">
              Your honest answers are what make our team conversations actually useful. Take your time. Say what is real.
            </p>
            <p className="text-slate-600 text-sm">
              This takes about 10-15 minutes. All questions are required unless marked optional.
            </p>
          </div>
        )}

        {/* Section Header */}
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Section {currentSection + 1}: {SECTIONS[currentSection]}
        </h2>

        {/* Section Content */}
        <div className="space-y-8">
          {/* Section 1: How You Are Doing Right Now */}
          {currentSection === 0 && (
            <>
              <QuestionBlock number={1} question="Overall stress level right now">
                <ScaleSelector
                  value={formData.overall_stress_level}
                  onChange={v => updateField('overall_stress_level', v)}
                  min={1}
                  max={10}
                  labels={{ 1: 'Completely relaxed', 5: 'Managing', 10: 'Overwhelmed' }}
                />
              </QuestionBlock>

              <QuestionBlock number={2} question="Energy level this week">
                <ScaleSelector
                  value={formData.energy_level}
                  onChange={v => updateField('energy_level', v)}
                  min={1}
                  max={5}
                  labels={{ 1: 'Running on empty', 3: 'Holding steady', 5: 'Fully charged' }}
                />
              </QuestionBlock>

              <QuestionBlock number={3} question="Confidence in your ability to close deals right now">
                <ScaleSelector
                  value={formData.confidence_level}
                  onChange={v => updateField('confidence_level', v)}
                  min={1}
                  max={10}
                  labels={{ 1: 'Not confident at all', 5: 'Getting there', 10: 'Very confident' }}
                />
              </QuestionBlock>

              <QuestionBlock number={4} question="How would you rate team morale overall right now?">
                <ScaleSelector
                  value={formData.team_morale}
                  onChange={v => updateField('team_morale', v)}
                  min={1}
                  max={5}
                  labels={{ 1: 'Struggling', 3: 'Neutral', 5: 'Really strong' }}
                />
              </QuestionBlock>

              <QuestionBlock number={5} question="How supported do you feel by leadership?">
                <ScaleSelector
                  value={formData.supported_by_leadership}
                  onChange={v => updateField('supported_by_leadership', v)}
                  min={1}
                  max={5}
                  labels={{ 1: 'Not supported', 3: 'Somewhat', 5: 'Fully supported' }}
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 2: Time & Workload */}
          {currentSection === 1 && (
            <>
              <QuestionBlock number={6} question="Approximately how many hours per week are you working?">
                <select
                  value={formData.hours_worked_per_week}
                  onChange={handleTextChange('hours_worked_per_week')}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select...</option>
                  <option value="Under 30 hours">Under 30 hours</option>
                  <option value="30-40 hours">30-40 hours</option>
                  <option value="40-50 hours">40-50 hours</option>
                  <option value="50-60 hours">50-60 hours</option>
                  <option value="60+ hours">60+ hours</option>
                </select>
              </QuestionBlock>

              <QuestionBlock number={7} question="Does that feel sustainable?">
                <RadioGroup
                  value={formData.hours_feel_sustainable}
                  onChange={v => updateField('hours_feel_sustainable', v)}
                  options={['Yes', 'No', 'Sometimes']}
                />
              </QuestionBlock>

              <QuestionBlock number={8} question="What is taking up the most time that feels like a drain?">
                <TextArea
                  value={formData.time_biggest_drain}
                  onChange={handleTextChange('time_biggest_drain')}
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 3: Pipeline Honesty */}
          {currentSection === 2 && (
            <>
              <QuestionBlock number={9} question="How confident are you in your current pipeline leading to a close in the next 30 days?">
                <ScaleSelector
                  value={formData.pipeline_confidence}
                  onChange={v => updateField('pipeline_confidence', v)}
                  min={1}
                  max={10}
                  labels={{ 1: 'Not at all', 5: 'Maybe a few', 10: 'Very confident' }}
                />
              </QuestionBlock>

              <QuestionBlock number={10} question="Reflecting on the last month — what do you wish had gone differently?">
                <TextArea
                  value={formData.last_month_reflection}
                  onChange={handleTextChange('last_month_reflection')}
                />
              </QuestionBlock>

              <QuestionBlock number={11} question="What is one win from the last month, big or small, worth naming?">
                <TextArea
                  value={formData.biggest_win_last_month}
                  onChange={handleTextChange('biggest_win_last_month')}
                />
              </QuestionBlock>

              <QuestionBlock number={12} question="What was the hardest moment or biggest challenge last month?">
                <TextArea
                  value={formData.biggest_challenge_last_month}
                  onChange={handleTextChange('biggest_challenge_last_month')}
                />
              </QuestionBlock>

              <QuestionBlock number={13} question="Is there a lead or deal that is still on your mind? What happened?">
                <TextArea
                  value={formData.lead_or_deal_on_mind}
                  onChange={handleTextChange('lead_or_deal_on_mind')}
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 4: What Is Getting in the Way */}
          {currentSection === 3 && (
            <>
              <QuestionBlock number={14} question="What objection or pushback are you hearing most often from prospects?">
                <TextArea
                  value={formData.most_common_objection}
                  onChange={handleTextChange('most_common_objection')}
                />
              </QuestionBlock>

              <QuestionBlock number={15} question="What part of the sales process feels hardest or most uncomfortable right now?">
                <TextArea
                  value={formData.part_of_process_feels_hard}
                  onChange={handleTextChange('part_of_process_feels_hard')}
                />
              </QuestionBlock>

              <QuestionBlock number={16} question="Is there something you have been avoiding? (A follow-up, a conversation, a type of outreach?) What is behind that?">
                <TextArea
                  value={formData.something_being_avoided}
                  onChange={handleTextChange('something_being_avoided')}
                />
              </QuestionBlock>

              <QuestionBlock number={17} question="Do you have the tools, resources, and information you need to do your best work?">
                <RadioGroup
                  value={formData.tools_and_resources_adequate}
                  onChange={v => updateField('tools_and_resources_adequate', v)}
                  options={['Yes', 'No', 'Partially']}
                />
              </QuestionBlock>

              <QuestionBlock
                number={18}
                question="If no or partially — what is missing?"
                optional={formData.tools_and_resources_adequate === 'Yes'}
              >
                <TextArea
                  value={formData.tools_missing}
                  onChange={handleTextChange('tools_missing')}
                  required={formData.tools_and_resources_adequate !== 'Yes'}
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 5: Feelings About the Work */}
          {currentSection === 4 && (
            <>
              <QuestionBlock number={19} question="What part of this job energizes you most?">
                <TextArea
                  value={formData.part_that_energizes}
                  onChange={handleTextChange('part_that_energizes')}
                />
              </QuestionBlock>

              <QuestionBlock number={20} question="What part drains you most?">
                <TextArea
                  value={formData.part_that_drains}
                  onChange={handleTextChange('part_that_drains')}
                />
              </QuestionBlock>

              <QuestionBlock number={21} question="How confident do you feel in your product knowledge — being able to answer tough questions from prospects?">
                <ScaleSelector
                  value={formData.product_knowledge_confidence}
                  onChange={v => updateField('product_knowledge_confidence', v)}
                  min={1}
                  max={5}
                  labels={{ 1: 'Not confident', 3: 'Getting there', 5: 'Very confident' }}
                />
              </QuestionBlock>

              <QuestionBlock number={22} question="What gaps in product knowledge would you like more support with?">
                <TextArea
                  value={formData.product_knowledge_gaps}
                  onChange={handleTextChange('product_knowledge_gaps')}
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 6: The Next 4 Weeks */}
          {currentSection === 5 && (
            <>
              <QuestionBlock number={23} question="What is your top priority or focus for the next 4 weeks?">
                <TextArea
                  value={formData.top_priority_next_4_weeks}
                  onChange={handleTextChange('top_priority_next_4_weeks')}
                />
              </QuestionBlock>

              <QuestionBlock number={24} question="What does a successful next 4 weeks look like for you, in your own words?">
                <TextArea
                  value={formData.what_success_looks_like}
                  onChange={handleTextChange('what_success_looks_like')}
                />
              </QuestionBlock>

              <QuestionBlock number={25} question="What is one thing you want to do differently going into the next month?">
                <TextArea
                  value={formData.one_thing_to_do_differently}
                  onChange={handleTextChange('one_thing_to_do_differently')}
                />
              </QuestionBlock>

              <QuestionBlock number={26} question="What support would make the biggest difference for you right now?">
                <TextArea
                  value={formData.support_needed}
                  onChange={handleTextChange('support_needed')}
                />
              </QuestionBlock>
            </>
          )}

          {/* Section 7: Leadership, Team & Anything Else */}
          {currentSection === 6 && (
            <>
              <QuestionBlock number={27} question="What could leadership do differently that would help you most?">
                <TextArea
                  value={formData.leadership_feedback}
                  onChange={handleTextChange('leadership_feedback')}
                />
              </QuestionBlock>

              <QuestionBlock number={28} question="Is there anything about how the team operates that you think could be better?">
                <TextArea
                  value={formData.team_dynamic_feedback}
                  onChange={handleTextChange('team_dynamic_feedback')}
                />
              </QuestionBlock>

              <QuestionBlock number={29} question="This is your space. Is there something you have wanted to say but have not felt like there was room to say it?">
                <TextArea
                  value={formData.safe_to_say}
                  onChange={handleTextChange('safe_to_say')}
                />
              </QuestionBlock>

              <QuestionBlock number={30} question="Anything else you want to share?" optional>
                <TextArea
                  value={formData.anything_else}
                  onChange={handleTextChange('anything_else')}
                  required={false}
                />
              </QuestionBlock>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSection === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentSection === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Previous
          </button>

          {currentSection < SECTIONS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateCurrentSection()}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                validateCurrentSection()
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-teal-300 text-white cursor-not-allowed'
              }`}
            >
              Next Section
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!validateCurrentSection() || isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                validateCurrentSection() && !isSubmitting
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-teal-300 text-white cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </button>
          )}
        </div>

        {/* Validation hint */}
        {!validateCurrentSection() && (
          <p className="mt-4 text-center text-sm text-slate-500">
            Please complete all required questions to continue.
          </p>
        )}
      </div>
    </div>
  );
}
