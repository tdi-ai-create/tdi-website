'use client';

import { useState } from 'react';
import {
  Building, Users, Calendar, Link, Target,
  CheckCircle, Send, AlertCircle
} from 'lucide-react';

export default function DashboardCreationForm() {
  const [formData, setFormData] = useState({
    // Section 1: School Info
    schoolName: '',
    schoolSlug: '',
    location: '',
    address: '',
    phone: '',
    website: '',

    // Section 2: Contacts
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactRole: '',
    secondaryContactName: '',
    secondaryContactEmail: '',

    // Section 3: Partnership Details
    audience: 'paraprofessional',
    totalEnrolled: '',
    startDate: '',
    endDate: '',
    hubAccessUntil: '',
    currentPhase: 'IGNITE',

    // Section 4: Deliverables
    observationDays: '2',
    virtualSessions: '4',
    execSessions: '2',
    bookIncluded: false,
    otherInclusions: '',

    // Section 5: Calendly Links
    observationCalendly: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-partnership-school-clone',
    virtualCalendly: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    execCalendly: 'https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone',

    // Section 6: Current Status
    kickoffComplete: false,
    hubActivated: true,
    currentLogins: '',

    // Section 7: Goal
    goalStatement: '',

    // Section 8: Schedule By Dates
    partnerDataBy: 'FEB 2026',
    pilotGroupBy: 'FEB 2026',
    obs1By: 'FEB 2026',
    obs2By: 'MAR 2026',
    virtual1By: 'FEB 2026',
    virtual2By: 'MAR 2026',
    virtual3By: 'APR 2026',
    virtual4By: 'APR 2026',
    exec2By: 'APR 2026',

    // Section 9: Year 2 Notes
    renewalNotes: '',

    // Section 10: Submitted By
    submittedBy: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getDefaultFormData = () => ({
    schoolName: '',
    schoolSlug: '',
    location: '',
    address: '',
    phone: '',
    website: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactRole: '',
    secondaryContactName: '',
    secondaryContactEmail: '',
    audience: 'paraprofessional',
    totalEnrolled: '',
    startDate: '',
    endDate: '',
    hubAccessUntil: '',
    currentPhase: 'IGNITE',
    observationDays: '2',
    virtualSessions: '4',
    execSessions: '2',
    bookIncluded: false,
    otherInclusions: '',
    observationCalendly: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-partnership-school-clone',
    virtualCalendly: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    execCalendly: 'https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone',
    kickoffComplete: false,
    hubActivated: true,
    currentLogins: '',
    goalStatement: '',
    partnerDataBy: 'FEB 2026',
    pilotGroupBy: 'FEB 2026',
    obs1By: 'FEB 2026',
    obs2By: 'MAR 2026',
    virtual1By: 'FEB 2026',
    virtual2By: 'MAR 2026',
    virtual3By: 'APR 2026',
    virtual4By: 'APR 2026',
    exec2By: 'APR 2026',
    renewalNotes: '',
    submittedBy: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: `🆕 New Dashboard Request: ${formData.schoolName}`,
          from_name: `TDI Dashboard Tool - ${formData.submittedBy}`,
          to: 'rae@teachersdeserveit.com',
          message: `
NEW DASHBOARD REQUEST
=====================

SCHOOL: ${formData.schoolName}
URL: teachersdeserveit.com/${formData.schoolSlug}-dashboard
Location: ${formData.location}

PRIMARY CONTACT: ${formData.primaryContactName} (${formData.primaryContactEmail})
SECONDARY: ${formData.secondaryContactName || 'None'}

AUDIENCE: ${formData.audience}
ENROLLED: ${formData.totalEnrolled}
PARTNERSHIP: ${formData.startDate} -  ${formData.endDate}
HUB ACCESS: Through ${formData.hubAccessUntil}
PHASE: ${formData.currentPhase}

DELIVERABLES:
- ${formData.observationDays} Observation Days
- ${formData.virtualSessions} Virtual Sessions
- ${formData.execSessions} Exec Sessions
- Book: ${formData.bookIncluded ? 'Yes' : 'No'}

CURRENT STATUS:
- Kickoff Complete: ${formData.kickoffComplete ? 'Yes' : 'No'}
- Hub Logins: ${formData.currentLogins} of ${formData.totalEnrolled}

GOAL: ${formData.goalStatement}

SUBMITTED BY: ${formData.submittedBy}
          `,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Error submitting form. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Submitted!</h2>
          <p className="text-gray-600 mb-4">
            The team has been notified. The dashboard will be live within 24-48 hours.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData(getDefaultFormData());
            }}
            className="text-blue-600 hover:underline"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full mb-4">
            Internal Use Only
          </span>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Creation Form
          </h1>
          <p className="text-gray-600">
            Fill out this form to request a new partner dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ===== SECTION 1: School Info ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">School Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School/District Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Addison School District 4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-1 hidden sm:inline">tdi.com/</span>
                  <input
                    type="text"
                    required
                    placeholder="asd4"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.schoolSlug}
                    onChange={(e) => setFormData({...formData, schoolSlug: e.target.value.toLowerCase().replace(/\s/g, '-')})}
                  />
                  <span className="text-gray-500 text-sm ml-1">-dashboard</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Letters, numbers, hyphens only. No spaces.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Addison, Illinois"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., 222 N. Kennedy Dr., Addison, IL 60101"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g., (630) 458-2425"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  placeholder="e.g., asd4.org"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 2: Contacts ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Contacts</h2>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Contact *</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Name"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.primaryContactName}
                  onChange={(e) => setFormData({...formData, primaryContactName: e.target.value})}
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.primaryContactEmail}
                  onChange={(e) => setFormData({...formData, primaryContactEmail: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Role (optional)"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.primaryContactRole}
                  onChange={(e) => setFormData({...formData, primaryContactRole: e.target.value})}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Secondary Contact (optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.secondaryContactName}
                  onChange={(e) => setFormData({...formData, secondaryContactName: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.secondaryContactEmail}
                  onChange={(e) => setFormData({...formData, secondaryContactEmail: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 3: Partnership Details ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Partnership Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audience *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.audience}
                  onChange={(e) => setFormData({...formData, audience: e.target.value})}
                >
                  <option value="teacher">Teachers</option>
                  <option value="paraprofessional">Paraprofessionals</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Enrolled *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g., 117"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.totalEnrolled}
                  onChange={(e) => setFormData({...formData, totalEnrolled: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partnership Start *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., January 2026"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partnership End *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., May 2026"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hub Access Until *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., January 2027"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.hubAccessUntil}
                  onChange={(e) => setFormData({...formData, hubAccessUntil: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Phase *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.currentPhase}
                  onChange={(e) => setFormData({...formData, currentPhase: e.target.value})}
                >
                  <option value="IGNITE">IGNITE (Phase 1) -  Building foundation</option>
                  <option value="ACCELERATE">ACCELERATE (Phase 2) -  Expanding team</option>
                  <option value="SUSTAIN">SUSTAIN (Phase 3) -  Embedding systems</option>
                </select>
              </div>
            </div>
          </div>

          {/* ===== SECTION 4: Deliverables ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-800">Contract Deliverables</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observation Days
                </label>
                <input
                  type="number"
                  placeholder="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.observationDays}
                  onChange={(e) => setFormData({...formData, observationDays: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Virtual Sessions
                </label>
                <input
                  type="number"
                  placeholder="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.virtualSessions}
                  onChange={(e) => setFormData({...formData, virtualSessions: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exec Sessions
                </label>
                <input
                  type="number"
                  placeholder="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.execSessions}
                  onChange={(e) => setFormData({...formData, execSessions: e.target.value})}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.bookIncluded}
                    onChange={(e) => setFormData({...formData, bookIncluded: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-gray-700">Book Included</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Inclusions (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Custom Growth Group sessions"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                value={formData.otherInclusions}
                onChange={(e) => setFormData({...formData, otherInclusions: e.target.value})}
              />
            </div>
          </div>

          {/* ===== SECTION 5: Calendly Links ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Link className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-800">Calendly Links</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Default links are pre-filled. Only change if this partner needs different links.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observation Days
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                  value={formData.observationCalendly}
                  onChange={(e) => setFormData({...formData, observationCalendly: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Virtual Sessions
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                  value={formData.virtualCalendly}
                  onChange={(e) => setFormData({...formData, virtualCalendly: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Executive Sessions
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm"
                  value={formData.execCalendly}
                  onChange={(e) => setFormData({...formData, execCalendly: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 6: Current Status ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-800">Current Status at Launch</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={formData.kickoffComplete}
                  onChange={(e) => setFormData({...formData, kickoffComplete: e.target.checked})}
                />
                <span className="text-sm font-medium text-gray-700">Kickoff (Exec Session 1) Complete</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={formData.hubActivated}
                  onChange={(e) => setFormData({...formData, hubActivated: e.target.checked})}
                />
                <span className="text-sm font-medium text-gray-700">Hub Access Activated</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Hub Logins
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="91"
                  className="w-24 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.currentLogins}
                  onChange={(e) => setFormData({...formData, currentLogins: e.target.value})}
                />
                <span className="text-gray-500">of {formData.totalEnrolled || '___'} enrolled</span>
              </div>
            </div>
          </div>

          {/* ===== SECTION 7: Goal ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-800">Partnership Goal</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Statement *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g., Equip paraprofessionals with practical strategies and resources to confidently support students and teachers."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                value={formData.goalStatement}
                onChange={(e) => setFormData({...formData, goalStatement: e.target.value})}
              />
            </div>
          </div>

          {/* ===== SECTION 8: Schedule By Dates ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Schedule By Dates</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">When should each item be scheduled by? All items should be scheduled by April at latest.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Partner Data Form</label>
                <input
                  type="text"
                  placeholder="FEB 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.partnerDataBy}
                  onChange={(e) => setFormData({...formData, partnerDataBy: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pilot Group</label>
                <input
                  type="text"
                  placeholder="FEB 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.pilotGroupBy}
                  onChange={(e) => setFormData({...formData, pilotGroupBy: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Observation 1</label>
                <input
                  type="text"
                  placeholder="FEB 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.obs1By}
                  onChange={(e) => setFormData({...formData, obs1By: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Observation 2</label>
                <input
                  type="text"
                  placeholder="MAR 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.obs2By}
                  onChange={(e) => setFormData({...formData, obs2By: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Virtual 1</label>
                <input
                  type="text"
                  placeholder="FEB 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.virtual1By}
                  onChange={(e) => setFormData({...formData, virtual1By: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Virtual 2</label>
                <input
                  type="text"
                  placeholder="MAR 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.virtual2By}
                  onChange={(e) => setFormData({...formData, virtual2By: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Virtual 3</label>
                <input
                  type="text"
                  placeholder="APR 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.virtual3By}
                  onChange={(e) => setFormData({...formData, virtual3By: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Virtual 4</label>
                <input
                  type="text"
                  placeholder="APR 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.virtual4By}
                  onChange={(e) => setFormData({...formData, virtual4By: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Exec Session 2</label>
                <input
                  type="text"
                  placeholder="APR 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.exec2By}
                  onChange={(e) => setFormData({...formData, exec2By: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* ===== SECTION 9: Year 2 Notes ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Year 2 / Renewal Notes</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What would Year 2 look like? Any special notes?
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Gradual rollout from pilot to full team over multiple semesters. May stay in ACCELERATE phase for 2+ years."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                value={formData.renewalNotes}
                onChange={(e) => setFormData({...formData, renewalNotes: e.target.value})}
              />
            </div>
          </div>

          {/* ===== SECTION 10: Submitted By ===== */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submitted By *
              </label>
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                value={formData.submittedBy}
                onChange={(e) => setFormData({...formData, submittedBy: e.target.value})}
              />
            </div>
          </div>

          {/* ===== SUBMIT ===== */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1e2749] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Dashboard Request'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
