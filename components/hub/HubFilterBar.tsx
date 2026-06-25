'use client';

import { useState } from 'react';
import { Heart, Info, ChevronDown, ChevronUp } from 'lucide-react';

export const ROLE_FILTERS = [
  { value: 'all', label: 'All Roles', short: 'All Roles' },
  { value: 'teacher', label: 'Teachers', short: 'Teachers' },
  { value: 'para', label: 'Paraprofessionals', short: 'Paras' },
  { value: 'leader', label: 'Leaders & Admin', short: 'Leaders' },
  { value: 'coach', label: 'Coaches', short: 'Coaches' },
] as const;

export const DANIELSON_DOMAINS = [
  { value: '1-planning', label: 'Planning & Prep', short: 'D1' },
  { value: '2-environment', label: 'Classroom Environment', short: 'D2' },
  { value: '3-instruction', label: 'Instruction', short: 'D3' },
  { value: '4-professional', label: 'Professional Responsibilities', short: 'D4' },
] as const;

interface HubFilterBarProps {
  categories: string[];
  totalCount: number;
  filteredCount: number;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
  capacityFilter: 'all' | 'low' | 'medium' | 'high';
  setCapacityFilter: (value: 'all' | 'low' | 'medium' | 'high') => void;
  danielsonFilter: string[];
  setDanielsonFilter: (value: string[] | ((prev: string[]) => string[])) => void;
  isFavorite: (id: string) => boolean;
  tUI: (key: string) => string;
  /** The noun to display, e.g. "quick wins" or "courses" */
  itemLabel: string;
  /** Static subtitle shown when no filters active */
  subtitle: string;
}

export default function HubFilterBar({
  categories,
  totalCount,
  filteredCount,
  roleFilter,
  setRoleFilter,
  activeFilter,
  setActiveFilter,
  capacityFilter,
  setCapacityFilter,
  danielsonFilter,
  setDanielsonFilter,
  isFavorite,
  tUI,
  itemLabel,
  subtitle,
}: HubFilterBarProps) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const hasAdvancedFilters = capacityFilter !== 'all' || danielsonFilter.length > 0;
  const isFiltered = activeFilter !== 'All' || roleFilter !== 'all' || hasAdvancedFilters;

  return (
    <>
      {/* Subtitle with live count */}
      <p
        className="text-[15px] mb-0"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#6B7280',
        }}
      >
        {isFiltered
          ? `${tUI('Showing')} ${filteredCount} ${tUI('of')} ${totalCount} ${tUI(itemLabel)}`
          : `${totalCount} ${tUI(itemLabel)} · ${tUI(subtitle)}`}
      </p>

      {/* Role dropdown + Category pills row */}
      <div className="flex items-center gap-3 mt-5 mb-2">
        {/* Role dropdown - pinned left */}
        <div className="relative flex-shrink-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2 rounded-full text-sm font-medium cursor-pointer transition-all"
            style={{
              backgroundColor: roleFilter !== 'all' ? '#1B2A4A' : 'white',
              color: roleFilter !== 'all' ? 'white' : '#6B7280',
              border: roleFilter !== 'all' ? 'none' : '1px solid rgba(0,0,0,0.08)',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
            }}
          >
            {ROLE_FILTERS.map(({ value, short }) => (
              <option key={value} value={value}>
                {value === 'all' ? tUI('I am a...') : tUI(short)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: roleFilter !== 'all' ? 'white' : '#6B7280' }}
          />
        </div>

        {/* Divider - pinned */}
        <div
          className="w-px h-6 flex-shrink-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
        />

        {/* Scrollable category pills + More Filters */}
        <style>{`.hub-filter-scroll::-webkit-scrollbar { display: none; }`}</style>
        <div
          className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 hub-filter-scroll"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((category) => {
            const isSaved = category === 'Saved';
            const isActive = activeFilter === category;
            return (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? (isSaved ? '#E53935' : '#1B2A4A') : 'white',
                  color: isActive ? 'white' : '#6B7280',
                  border: isActive ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isSaved && <Heart size={14} style={{ fill: isActive ? 'white' : 'none' }} />}
                {tUI(category)}
              </button>
            );
          })}

          {/* More Filters toggle - inside scroll area but at end */}
          <button
            onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 relative"
            style={{
              backgroundColor: moreFiltersOpen || hasAdvancedFilters ? '#1B2A4A' : 'transparent',
              color: moreFiltersOpen || hasAdvancedFilters ? 'white' : '#9CA3AF',
              border: moreFiltersOpen || hasAdvancedFilters ? 'none' : '1px dashed rgba(0,0,0,0.15)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
            }}
          >
            {tUI('More Filters')}
            {moreFiltersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {/* Active indicator dot */}
            {hasAdvancedFilters && !moreFiltersOpen && (
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: '#E53935', border: '2px solid #F0EEE9' }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Expanded: Effort Level + Danielson rows */}
      {moreFiltersOpen && (
        <div
          className="rounded-xl px-4 py-3 mb-2 mt-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          {/* Effort Level Filter Row */}
          <div data-tour="lift-filter" className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="text-[11px] font-bold tracking-wider flex-shrink-0"
              style={{
                color: '#9CA3AF',
                textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {tUI('Effort Level')}
              <span className="relative group" style={{ display: 'inline-flex' }}>
                <Info size={13} style={{ color: '#9CA3AF', cursor: 'help' }} />
                <span
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 rounded-lg text-left normal-case tracking-normal pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50"
                  style={{
                    background: '#1B2A4A',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                    Effort Level = how action-ready a resource is.
                  </strong>
                  <span style={{ display: 'block', marginBottom: 4 }}>
                    <strong>Grab & Go</strong> -- Open it, use it, done.
                  </span>
                  <span style={{ display: 'block', marginBottom: 4 }}>
                    <strong>Short Prep</strong> -- A few moments to think, then implement.
                  </span>
                  <span style={{ display: 'block' }}>
                    <strong>Deep Dive</strong> -- Deeper reflection and planning, then action.
                  </span>
                </span>
              </span>
            </span>
            {(
              [
                ['all', 'All'],
                ['low', 'Grab & Go'],
                ['medium', 'Short Prep'],
                ['high', 'Deep Dive'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setCapacityFilter(val)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  backgroundColor:
                    capacityFilter === val
                      ? val === 'low'
                        ? '#6BA368'
                        : val === 'medium'
                          ? '#E8B84B'
                          : val === 'high'
                            ? '#E8927C'
                            : '#1B2A4A'
                      : 'white',
                  color: capacityFilter === val ? 'white' : '#6B7280',
                  border: capacityFilter === val ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {tUI(label)}
              </button>
            ))}
          </div>

          {/* Danielson Framework Filter Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[11px] font-bold tracking-wider flex-shrink-0"
              style={{
                color: '#9CA3AF',
                textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tUI('Danielson Framework')}
            </span>
            {DANIELSON_DOMAINS.map((domain) => {
              const isActive = danielsonFilter.includes(domain.value);
              return (
                <button
                  key={domain.value}
                  onClick={() => {
                    setDanielsonFilter((prev: string[]) =>
                      prev.includes(domain.value)
                        ? prev.filter((d: string) => d !== domain.value)
                        : [...prev, domain.value]
                    );
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? '#1B2A4A' : 'white',
                    color: isActive ? 'white' : '#6B7280',
                    border: isActive ? 'none' : '1px solid rgba(0,0,0,0.08)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {tUI(domain.label)} ({domain.short})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
