'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDateOnly } from '@/lib/format-date';

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
// Cents shown where the exact figure is the one being chased. $2,332.20 rounded
// to $2,332 does not match the invoice the school is holding.
const exact = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/**
 * Where this school stands financially, read only, with a link into Billing.
 * Nothing here can change anything: Billing is the only writer.
 */
export default function PositionStrip({ partnershipId, userEmail }: { partnershipId: string; userEmail: string }) {
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    if (!partnershipId || !userEmail) return;
    fetch(`/api/tdi-admin/billing/position?partnershipId=${partnershipId}`, { headers: { 'x-user-email': userEmail } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setP)
      .catch(() => setP(null));
  }, [partnershipId, userEmail]);

  if (!p?.has_contract) return null;

  const cells = [
    ['Contracted', money(p.value), '#0B1120'],
    ['Collected', money(p.collected), p.collected > 0 ? '#059669' : '#94A3B8'],
    ['Outstanding', exact(p.outstanding), p.outstanding > 0 ? '#D97706' : '#94A3B8'],
    ['Not billed', money(p.not_billed), '#64748B'],
  ] as const;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Where they stand</span>
        <span className="text-[10px] text-gray-400">read only</span>
        <Link href="/tdi-admin/billing" className="ml-auto text-[10px] font-semibold" style={{ color: '#B45309' }}>
          Open in Billing →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {cells.map(([label, value, colour]) => (
          <div key={label} className="flex justify-between text-[11.5px]">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold tabular-nums" style={{ color: colour }}>{value}</span>
          </div>
        ))}
      </div>

      {p.overdue_count > 0 && (
        <div className="mt-2 text-[11.5px] font-semibold" style={{ color: '#DC2626' }}>
          {exact(p.overdue_amount)} overdue across {p.overdue_count} invoice{p.overdue_count > 1 ? 's' : ''}
        </div>
      )}
      {p.overdue_count === 0 && p.next_due && (
        <div className="mt-2 text-[11.5px] text-gray-500">
          {/* date column, so formatDateOnly rather than new Date, which renders a day early */}
          Next due {formatDateOnly(p.next_due.due_date, { day: 'numeric', month: 'short' })}, {exact(p.next_due.amount)}
        </div>
      )}

      {/* A part paid invoice is the one people get wrong. Say both halves so
          nobody chases the face value of something already half settled, and
          nobody assumes a payment closed it. */}
      {(p.part_paid ?? []).map((inv: { invoice_number: string; amount: number; paid: number; outstanding: number }) => (
        <div key={inv.invoice_number} className="mt-1 text-[11.5px] text-gray-600">
          <span className="font-semibold">{inv.invoice_number}</span> part paid.{' '}
          {exact(inv.paid)} of {exact(inv.amount)} received,{' '}
          <span className="font-semibold" style={{ color: '#B45309' }}>{exact(inv.outstanding)} still owed</span>
        </div>
      ))}
      {p.ready_to_bill > 0 && (
        <div className="mt-1 text-[11.5px] font-semibold" style={{ color: '#B45309' }}>
          {money(p.ready_to_bill)} delivered and ready to bill
        </div>
      )}
      {p.on_funding > 0 && (
        <div className="mt-1 text-[11.5px]" style={{ color: '#7C3AED' }}>
          {money(p.on_funding)} held for funding
        </div>
      )}
    </div>
  );
}
