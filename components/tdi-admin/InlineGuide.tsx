'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'

/**
 * SectionGuide - Collapsible "How this works" block for any admin section.
 * Collapsed by default. Stays out of the way for experienced users.
 */
export function SectionGuide({ title, items, id }: {
  title?: string
  items: string[]
  id?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HelpCircle size={13} />
        <span>{title || 'How this works'}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-600 space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-300 font-mono flex-shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * ActionTooltip - Small info icon that shows a tooltip on hover.
 * Use next to buttons to explain what they do.
 */
export function ActionTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)

  return (
    <span className="relative inline-flex items-center ml-1">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help text-gray-300 hover:text-gray-500 transition-colors"
      >
        <Info size={13} />
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-gray-800 text-white text-xs max-w-[260px] w-max z-50 shadow-lg whitespace-normal leading-relaxed">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-800" />
        </span>
      )}
    </span>
  )
}

/**
 * EmptyStateGuide - Friendly message when a section has no data yet.
 * Disappears once data exists.
 */
export function EmptyStateGuide({ icon, title, description, action }: {
  icon?: React.ReactNode
  title: string
  description: string
  action?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {icon && <div className="text-gray-300 mb-3">{icon}</div>}
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-xs text-gray-400 max-w-sm">{description}</p>
      {action && (
        <p className="text-xs text-teal-600 mt-2 font-medium">{action}</p>
      )}
    </div>
  )
}

/**
 * Pre-built guide content for each major section.
 * Import the one you need and pass it to SectionGuide.
 */
export const GUIDE_CONTENT = {
  actionItems: [
    'Action items track what needs to happen next for this partnership.',
    'Set priority (high/medium/low) and assign an owner.',
    'Items auto-sort by priority and due date.',
    'Mark items complete as they get done. The timeline updates automatically.',
    'Overdue items show a red flag. Follow up within 48 hours.',
  ],
  internalNotes: [
    'Notes are internal only. The principal cannot see them.',
    'Tag each note with a type: general, strategy, concern, win, or follow-up.',
    'Use "concern" for anything that needs attention. These are flagged in reports.',
    'Use "win" to document positive moments. These help with renewal conversations.',
    'Add notes after every call, email, or interaction. Nothing should go unrecorded.',
  ],
  meetings: [
    'Log every meeting: check-ins, onboarding calls, observation debriefs, renewals.',
    'Include attendees, a brief summary, and any action items discussed.',
    'Meeting records feed into the timeline and pre-call briefings.',
    'Use "Prepare for Call" before scheduled meetings to auto-generate talking points.',
  ],
  billing: [
    'Each line item represents a contracted service (observation, virtual session, etc.).',
    '"Mark Delivered" records the service date and changes status to Delivered.',
    '"Send Invoice" generates a branded PDF and emails it to the school contact.',
    'You can edit the recipient email, PO number, and notes before sending.',
    '"Record Payment" logs the payment and sends a confirmation email to the school.',
    'Follow-up reminders go out automatically at 14, 30, 45, and 60 days.',
  ],
  observations: [
    'Create an observation entry for each school visit.',
    'During the visit, take notes (you can upload photos of your notepad).',
    'After the visit, add strategy tags, growth indicators, and coaching themes.',
    'Draft Love Notes: positive teacher observations to share with the principal.',
    'Review and finalize Love Notes before sending. These are the most impactful thing we do.',
  ],
  kpis: [
    'Select KPIs from the menu that matter most to this partnership.',
    'Categories: implementation, wellness, baseline.',
    'Set a baseline value, then update the current value as data comes in.',
    'KPI progress is included in board summaries and renewal conversations.',
    'Aim for 5-10 KPIs per partnership. Too many dilutes focus.',
  ],
  timeline: [
    'The timeline shows the partnership journey in chronological order.',
    'Events are auto-generated when sessions are completed, invoices sent, etc.',
    'You can also add manual timeline entries for milestones.',
    'Use the filter to focus on notes, meetings, or action items.',
    'This is what the principal sees in their Partner Dashboard.',
  ],
  videoUpload: [
    'Select a lesson from the sidebar, then upload a video in the editor.',
    'Videos upload to our storage first, then Cloudflare processes them (1-3 min).',
    'Max file size: 500MB. The limit is shown next to the upload buttons.',
    'Green dot = video uploaded. Red dot = still needs a video.',
    'Use "Bulk Upload Videos" to upload multiple files at once with auto-matching.',
    'Use "Bulk Upload Content" for a mix of videos and PDFs together.',
  ],
  staffRoster: [
    'The principal uploads their staff roster through their Partner Dashboard.',
    'Hub accounts are auto-provisioned for each staff member.',
    'Welcome emails go out automatically when accounts are created.',
    'Staff photos can be uploaded individually or in bulk (ZIP file).',
    'Over-contract alerts notify you if more staff are added than the contracted seats.',
  ],
}
