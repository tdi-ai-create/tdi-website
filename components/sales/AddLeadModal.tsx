'use client';

import { useState } from 'react';
import type { CreateLeadInput, LeadSource, LeadHeat, ContactRole } from '@/types/leads';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: (leadId: string) => void;
}

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'podcast_guest', label: 'Podcast guest' },
  { value: 'conference', label: 'Conference' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_inbound', label: 'Cold inbound' },
  { value: 'jim_outreach', label: "Jim's outreach" },
  { value: 'existing_customer_renewal', label: 'Existing customer renewal' },
  { value: 'iasa', label: 'IASA' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'other', label: 'Other' },
];

const ROLE_OPTIONS: { value: ContactRole; label: string }[] = [
  { value: 'superintendent', label: 'Superintendent' },
  { value: 'assistant_superintendent', label: 'Assistant Superintendent' },
  { value: 'principal', label: 'Principal' },
  { value: 'assistant_principal', label: 'Assistant Principal' },
  { value: 'director_of_curriculum', label: 'Director of Curriculum' },
  { value: 'director_of_special_ed', label: 'Director of Special Ed' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'paraprofessional', label: 'Paraprofessional' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'other', label: 'Other' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

export default function AddLeadModal({ isOpen, onClose, onLeadCreated }: AddLeadModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [districtName, setDistrictName] = useState('');

  const [form, setForm] = useState<CreateLeadInput>({
    district_name: '',
    source: 'cold_inbound',
  });

  if (!isOpen) return null;

  const updateField = <K extends keyof CreateLeadInput>(
    key: K,
    value: CreateLeadInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = form.district_name.trim().length > 1 && form.source;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create lead');
      }

      setDistrictName(form.district_name);
      setStep(3);
      onLeadCreated?.(data.lead.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setForm({ district_name: '', source: 'cold_inbound' });
    setDistrictName('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', padding: 16,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'white', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0a0f1e', margin: 0 }}>
            {step === 3 ? 'Lead added' : 'Add new lead'}
          </h2>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20, lineHeight: 1 }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: step === 1 ? '#059669' : '#9CA3AF', fontWeight: step === 1 ? 600 : 400 }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 11,
                background: step === 1 ? '#059669' : '#E5E7EB',
                color: step === 1 ? 'white' : '#9CA3AF',
              }}>1</span>
              Quick capture
            </div>
            <span style={{ color: '#D1D5DB' }}>&rarr;</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: step === 2 ? '#059669' : '#9CA3AF', fontWeight: step === 2 ? 600 : 400 }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 11,
                background: step === 2 ? '#059669' : '#E5E7EB',
                color: step === 2 ? 'white' : '#9CA3AF',
              }}>2</span>
              Optional details
            </div>
          </div>
        )}

        {/* Step 1: Quick capture */}
        {step === 1 && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                District or school name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.district_name}
                onChange={(e) => updateField('district_name', e.target.value)}
                placeholder="e.g. Naperville District 203"
                style={inputStyle}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                State
              </label>
              <select
                value={form.state_code || ''}
                onChange={(e) => updateField('state_code', e.target.value || undefined)}
                style={inputStyle}
              >
                <option value="">Select state (helps AI research)</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Contact name
                </label>
                <input
                  type="text"
                  value={form.contact_name || ''}
                  onChange={(e) => updateField('contact_name', e.target.value)}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Role
                </label>
                <select
                  value={form.contact_role || ''}
                  onChange={(e) => updateField('contact_role', e.target.value as ContactRole)}
                  style={inputStyle}
                >
                  <option value="">Select role</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Source <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={form.source}
                onChange={(e) => updateField('source', e.target.value as LeadSource)}
                style={inputStyle}
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#991B1B' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 4 }}>
              <button
                onClick={() => setStep(2)}
                style={{ fontSize: 13, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Add more details &rarr;
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleClose}
                  style={{ padding: '8px 16px', fontSize: 13, color: '#374151', background: 'white', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  style={{
                    padding: '8px 16px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                    border: 'none', cursor: 'pointer', color: 'white',
                    background: !canSubmit || submitting ? '#D1D5DB' : '#10B981',
                  }}
                >
                  {submitting ? 'Saving...' : 'Save & research'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Optional details */}
        {step === 2 && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.contact_email || ''}
                  onChange={(e) => updateField('contact_email', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.contact_phone || ''}
                  onChange={(e) => updateField('contact_phone', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Estimated deal size
              </label>
              <input
                type="number"
                value={form.estimated_deal_size || ''}
                onChange={(e) => updateField('estimated_deal_size', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g. 30000"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Initial heat
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['hot', 'warm', 'cold'] as LeadHeat[]).map((h) => {
                  const isActive = form.initial_heat === h;
                  const colors = {
                    hot: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
                    warm: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
                    cold: { bg: '#F9FAFB', border: '#D1D5DB', text: '#374151' },
                  };
                  const c = colors[h];
                  return (
                    <button
                      key={h}
                      onClick={() => updateField('initial_heat', h)}
                      style={{
                        padding: '8px 16px', fontSize: 13, borderRadius: 8, cursor: 'pointer',
                        border: `1px solid ${isActive ? c.border : '#D1D5DB'}`,
                        background: isActive ? c.bg : 'white',
                        color: isActive ? c.text : '#6B7280',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Notes for AI research
              </label>
              <textarea
                value={form.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                placeholder="Anything that helps Claude research this lead better - context from a conversation, specific pain points mentioned, etc."
                style={{ ...inputStyle, resize: 'vertical' as const }}
              />
            </div>

            {error && (
              <div style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#991B1B' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 4 }}>
              <button
                onClick={() => setStep(1)}
                style={{ fontSize: 13, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                &larr; Back
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleClose}
                  style={{ padding: '8px 16px', fontSize: 13, color: '#374151', background: 'white', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  style={{
                    padding: '8px 16px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                    border: 'none', cursor: 'pointer', color: 'white',
                    background: !canSubmit || submitting ? '#D1D5DB' : '#10B981',
                  }}
                >
                  {submitting ? 'Saving...' : 'Save & research'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: '#ECFDF5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 10l3 3 7-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0a0f1e', margin: 0 }}>
                  {districtName} added to pipeline
                </h3>
                <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 1.5 }}>
                  Claude is researching this district now. You&apos;ll see the strategic brief,
                  decision-maker intel, funding signals, and lead score on the card in about 60-90 seconds.
                </p>
              </div>
            </div>

            <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
              <strong>What&apos;s happening:</strong> Web search is running on the district name,
              superintendent, recent state report cards, ESSER status, and TDI partner proximity.
              Every claim will have a source link. If data isn&apos;t publicly available, Claude will
              say so rather than guess.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
              <button
                onClick={reset}
                style={{ padding: '8px 16px', fontSize: 13, color: '#374151', background: 'white', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer' }}
              >
                Add another
              </button>
              <button
                onClick={handleClose}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer', color: 'white', background: '#10B981' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
