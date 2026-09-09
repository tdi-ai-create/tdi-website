'use client';

import { useRef, useState } from 'react';
import {
  FOCUS_PACKET_FULL_PATH,
  FOCUS_PACKET_GATED_CONTENTS,
  FOCUS_PACKET_GATED_PAGES,
  FOCUS_PACKET_PREVIEW_PAGES,
  FOCUS_PACKET_PREVIEW_PATH,
  FOCUS_PACKET_ROLES,
  FOCUS_PACKET_TOTAL_PAGES,
} from '@/lib/focus-packet';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = Partial<Record<'email' | 'role' | 'organization', string>>;

/**
 * The preview and the gate on the sample packet.
 *
 * Both halves live in one client component because the reveal replaces the
 * layout rather than filling a slot in it. The three preview pages are inside
 * the full packet, so once it opens the preview column retires instead of
 * sitting half empty beside it.
 *
 * The reveal does not wait on the email. A leader who typed their address has
 * done the thing we asked, and making them go find a message before they can
 * read page four would be a second ask we never advertised.
 */
export default function FocusPacketForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter an email address we can send this to.';
    if (!role) next.role = 'Choose the role that fits best.';
    if (!organization.trim()) next.organization = 'Tell us which district or school this is for.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFailed(null);

    try {
      const res = await fetch('/api/for-schools/focus-packet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role,
          organization: organization.trim(),
          name: name.trim(),
        }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        setFailed(detail?.error || 'That did not go through. Try once more.');
        return;
      }

      const data = await res.json();
      setEmailed(Boolean(data?.emailed));
      setRevealed(true);
      setTimeout(() => {
        revealRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } catch {
      setFailed('That did not go through. Try once more.');
    } finally {
      setSubmitting(false);
    }
  };

  if (revealed) {
    return (
      <div className="fs-packet-grid fs-packet-grid-open">
        <div className="fs-packet-reveal" ref={revealRef}>
          <h3>The full packet, all {FOCUS_PACKET_TOTAL_PAGES} pages.</h3>
          <p className="fs-packet-revealnote">
            {emailed
              ? `A copy is on its way to ${email.trim()}.`
              : `The copy to ${email.trim()} has not gone out yet. Use the download button, and email hello@teachersdeserveit.com if you want it sent again.`}
          </p>
          <object
            className="fs-packet-frame"
            data={`${FOCUS_PACKET_FULL_PATH}#view=FitH`}
            type="application/pdf"
            aria-label="The Focus sample packet, all pages"
          >
            <p>
              Your browser will not display the packet here.{' '}
              <a href={FOCUS_PACKET_FULL_PATH} target="_blank" rel="noopener noreferrer">
                Open it in a new tab
              </a>
              .
            </p>
          </object>
          <div className="fs-btnrow">
            <a
              className="fs-btn fs-btn-gold"
              href={FOCUS_PACKET_FULL_PATH}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download the packet
            </a>
            <a className="fs-btn fs-btn-ghost" href="/get-started">
              Request a quote
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fs-packet-grid">
      <div className="fs-packet-preview">
        <p className="fs-packet-eyebrow">Open to anyone, pages 1 to 3</p>
        <object
          className="fs-packet-frame"
          data={`${FOCUS_PACKET_PREVIEW_PATH}#view=FitH`}
          type="application/pdf"
          aria-label="The Focus sample packet, first three pages"
        >
          <p>
            Your browser will not display the preview here.{' '}
            <a href={FOCUS_PACKET_PREVIEW_PATH} target="_blank" rel="noopener noreferrer">
              Open the first three pages in a new tab
            </a>
            .
          </p>
        </object>
        <p className="fs-packet-openlink">
          <a href={FOCUS_PACKET_PREVIEW_PATH} target="_blank" rel="noopener noreferrer">
            Open the first three pages in a new tab
          </a>
        </p>
        <ul className="fs-packet-pages">
          {FOCUS_PACKET_PREVIEW_PAGES.map((page) => (
            <li key={page}>{page}</li>
          ))}
        </ul>
      </div>

      <form className="fs-packet-form" onSubmit={handleSubmit} noValidate>
        <h3>The other {FOCUS_PACKET_GATED_PAGES} pages</h3>
        <ul className="fs-packet-list">
          {FOCUS_PACKET_GATED_CONTENTS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="fs-packet-formnote">
          Tell us where to send it and the rest opens right here, straight away. A copy goes to your
          inbox at the same time so you can forward it.
        </p>

        <div className="fs-field-grid">
          <div className="fs-field">
            <label htmlFor="packet-email">Email</label>
            <input
              id="packet-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'packet-email-error' : undefined}
            />
            {errors.email && (
              <p className="fs-field-error" id="packet-email-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="fs-field">
            <label htmlFor="packet-role">Role</label>
            <select
              id="packet-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-invalid={errors.role ? true : undefined}
              aria-describedby={errors.role ? 'packet-role-error' : undefined}
            >
              <option value="">Select a role</option>
              {FOCUS_PACKET_ROLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="fs-field-error" id="packet-role-error">
                {errors.role}
              </p>
            )}
          </div>

          <div className="fs-field">
            <label htmlFor="packet-org">District or school</label>
            <input
              id="packet-org"
              name="organization"
              type="text"
              autoComplete="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              aria-invalid={errors.organization ? true : undefined}
              aria-describedby={errors.organization ? 'packet-org-error' : undefined}
            />
            {errors.organization && (
              <p className="fs-field-error" id="packet-org-error">
                {errors.organization}
              </p>
            )}
          </div>

          <div className="fs-field">
            <label htmlFor="packet-name">
              Name <span className="fs-optional">optional</span>
            </label>
            <input
              id="packet-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="fs-packet-submit">
          <button className="fs-btn fs-btn-gold" type="submit" disabled={submitting}>
            {submitting ? 'Opening it' : `Open the other ${FOCUS_PACKET_GATED_PAGES} pages`}
          </button>
          <span className="fs-packet-sub">No confirmation step. It opens on this page.</span>
        </div>

        <p className="fs-field-error" role="alert">
          {failed}
        </p>
      </form>
    </div>
  );
}
