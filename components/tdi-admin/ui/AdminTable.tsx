'use client';

import { ADMIN_SHADOWS } from './design-tokens';

interface AdminTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component for admin tables with consistent styling
 */
export function AdminTable({ children, className = '' }: AdminTableProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}
      style={{ boxShadow: ADMIN_SHADOWS.card }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

interface AdminTableHeaderProps {
  children: React.ReactNode;
}

/**
 * Table header wrapper
 */
export function AdminTableHeader({ children }: AdminTableHeaderProps) {
  return <thead className="bg-[#FAFAF8]">{children}</thead>;
}

interface AdminTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  hidden?: 'md' | 'lg' | 'xl';
}

/**
 * Table header cell with consistent styling
 */
export function AdminTableHeaderCell({
  children,
  className = '',
  hidden,
}: AdminTableHeaderCellProps) {
  const hiddenClass = hidden
    ? `hidden ${hidden}:table-cell`
    : '';

  return (
    <th
      className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 ${hiddenClass} ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </th>
  );
}

interface AdminTableBodyProps {
  children: React.ReactNode;
}

/**
 * Table body wrapper
 */
export function AdminTableBody({ children }: AdminTableBodyProps) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}

interface AdminTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  striped?: boolean;
  index?: number;
}

/**
 * Table row with hover state
 */
export function AdminTableRow({
  children,
  className = '',
  onClick,
  striped = false,
  index = 0,
}: AdminTableRowProps) {
  const stripedBg = striped && index % 2 === 1 ? 'bg-[#FAFAF8]' : 'bg-white';

  return (
    <tr
      onClick={onClick}
      className={`hover:bg-gray-50 transition-colors ${stripedBg} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
}

interface AdminTableCellProps {
  children: React.ReactNode;
  className?: string;
  hidden?: 'md' | 'lg' | 'xl';
}

/**
 * Table cell with consistent styling
 */
export function AdminTableCell({
  children,
  className = '',
  hidden,
}: AdminTableCellProps) {
  const hiddenClass = hidden
    ? `hidden ${hidden}:table-cell`
    : '';

  return (
    <td
      className={`px-4 py-3 ${hiddenClass} ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </td>
  );
}

interface AdminTableFooterProps {
  children: React.ReactNode;
}

/**
 * Table footer for pagination or summary info
 */
export function AdminTableFooter({ children }: AdminTableFooterProps) {
  return (
    <div
      className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </div>
  );
}

interface AdminTableEmptyProps {
  colSpan: number;
  message?: string;
}

/**
 * Empty state row for tables with no data
 */
export function AdminTableEmpty({
  colSpan,
  message = 'No data found',
}: AdminTableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-8 text-center text-gray-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {message}
      </td>
    </tr>
  );
}

export default AdminTable;
