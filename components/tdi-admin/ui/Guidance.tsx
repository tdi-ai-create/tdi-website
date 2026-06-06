'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Tooltip - hover or tap to see contextual help
 * Usage: <Tooltip content="This connects to..."><span>Something</span></Tooltip>
 */
export function Tooltip({ children, content, position = 'top' }: {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const positionStyles: Record<string, React.CSSProperties> = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  };

  return (
    <div
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children}
      {show && (
        <div
          style={{
            position: 'absolute',
            ...positionStyles[position],
            background: '#1e2749',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.5,
            maxWidth: 280,
            whiteSpace: 'normal',
            zIndex: 50,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

/**
 * InfoDot - small "?" or "i" icon with tooltip
 * Usage: <InfoDot text="This pulls data from the Hub automatically." />
 */
export function InfoDot({ text, icon = '?' }: { text: string; icon?: '?' | 'i' }) {
  return (
    <Tooltip content={text}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#E5E7EB',
          color: '#6B7280',
          fontSize: 10,
          fontWeight: 700,
          cursor: 'help',
          marginLeft: 4,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
    </Tooltip>
  );
}

/**
 * ConnectionBadge - shows what this feature connects to
 * Usage: <ConnectionBadge from="Sales" to="Leadership" />
 */
export function ConnectionBadge({ from, to, description }: {
  from: string;
  to: string;
  description?: string;
}) {
  return (
    <Tooltip content={description || `Data flows from ${from} to ${to} automatically.`}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 999,
          background: '#DBEAFE',
          color: '#1E40AF',
          fontSize: 10,
          fontWeight: 600,
          cursor: 'help',
        }}
      >
        {from} &#8594; {to}
      </span>
    </Tooltip>
  );
}

/**
 * FirstTimeHint - shows a one-time suggestion that can be dismissed
 * Uses localStorage to remember dismissal
 */
export function FirstTimeHint({ id, children }: {
  id: string;
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(true); // Default hidden until checked

  useEffect(() => {
    const key = `tdi-hint-${id}`;
    const wasDismissed = localStorage.getItem(key) === '1';
    setDismissed(wasDismissed);
  }, [id]);

  if (dismissed) return null;

  return (
    <div
      style={{
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 12,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        fontSize: 13,
        color: '#92400E',
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>&#9733;</span>
      <div style={{ flex: 1 }}>{children}</div>
      <button
        onClick={() => {
          localStorage.setItem(`tdi-hint-${id}`, '1');
          setDismissed(true);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#D97706',
          cursor: 'pointer',
          fontSize: 16,
          padding: 0,
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        x
      </button>
    </div>
  );
}

/**
 * ConfirmAction - wraps a button with a "are you sure?" confirmation
 * Usage: <ConfirmAction message="This will provision Hub accounts for all 45 staff." onConfirm={doIt}><button>Provision</button></ConfirmAction>
 */
export function ConfirmAction({ children, message, detail, onConfirm, confirmLabel = 'Yes, continue', cancelLabel = 'Cancel' }: {
  children: React.ReactNode;
  message: string;
  detail?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div onClick={() => setShowConfirm(true)}>
        {children}
      </div>
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1e2749', marginBottom: 8 }}>{message}</p>
            {detail && <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{detail}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowConfirm(false); onConfirm(); }}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                  background: '#1e2749', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {confirmLabel}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10,
                  border: '1px solid #E5E7EB', background: 'white', color: '#6B7280',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * GUIDANCE_CONTENT - centralized tooltip/hint content for the entire system
 * Import this wherever you need guidance text to keep it consistent.
 */
export const GUIDANCE = {
  // Sales
  sales: {
    createPartnership: 'This creates a full Leadership Dashboard, provisions Hub access, sends a welcome email, and creates onboarding action items. For grant-funded deals, it also creates a funding pursuit.',
    signedStage: 'Moving a deal to Signed triggers the partnership creation flow. Make sure contract details are ready.',
    grantSupport: 'Grant-supported deals mean TDI is responsible for finding, drafting, and tracking funding. A funding pursuit will be auto-created.',
  },
  // Leadership
  leadership: {
    internalTab: 'This tab is only visible to the TDI team. Nothing here shows on the principal\'s dashboard.',
    kpiSelection: 'Pick 3-5 KPIs that align with what this school needs. Each one has benchmarks from TDI partner data and shows how TDI delivers results through your contract.',
    kpiAutoUpdate: 'Hub-connected KPIs (engagement, courses, field notes) update automatically every day. Survey-based KPIs (stress, retention) need manual updates after surveys.',
    batchProvision: 'This creates Hub All-Access accounts for every staff member in the roster who doesn\'t have one yet. Run this after the roster is uploaded.',
    prepareForCall: 'Generates a printable 1-page briefing with engagement data, KPI progress, recent notes, and AI-suggested talking points.',
    exportReports: 'If data is missing, the system will explain what\'s needed and offer to draft an email requesting it from the principal.',
    grantTracking: 'Shows funding pursuit status for grant-funded partnerships. Edit paths and track amounts in the Funding tab.',
    notes: 'Notes stay internal by default. You can mark individual notes as "shared with partner" to make them visible on the principal\'s dashboard.',
    meetings: 'Log every touchpoint. Meeting action items are referenced in the Prepare for Call briefing.',
  },
  // Client dashboard
  dashboard: {
    gaugeRings: 'These show your partnership KPIs when set by TDI. The progress updates automatically from your team\'s Hub activity.',
    actionItems: 'Complete these items to get your team up and running. Each one moves your partnership forward.',
    aiSummary: 'This summary updates in real time based on your team\'s activity. Screenshot it for board presentations.',
    healthBar: 'Partnership momentum is calculated from Hub engagement, deliverables completed, and pending items.',
  },
  // Funding
  funding: {
    planABCD: 'Plan A (federal formula) is always pursued first. Plans B-D are staged as fallback. We pursue multiple paths in parallel with a 15% buffer above the gap.',
    fundingPaths: 'Each path has its own status, contact, deadline, and amount. The total across all paths should exceed the contract gap.',
    pursuitPhases: 'Pursuits move through: intake, researching, strategy, writing, in review, delivered, submitted, awaiting decision, awarded/denied.',
  },
  // Hub
  hub: {
    educatorGoals: 'Set 3-5 specific goals for the year. Check in quarterly to review and adjust. Your goals are private but aggregate data helps your principal track school progress.',
    vibeCheck: 'Your daily wellness check is completely private. No one sees individual responses. If you log multiple tough days, TDI sends a personal check-in (names are never shared with your school).',
  },
};
