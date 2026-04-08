"use client";

import { useState, useEffect } from "react";
import {
  Users, CheckCircle, Activity, Target, Calendar, Clock,
  MapPin, Mail, Phone, ArrowRight, ChevronDown, ChevronRight,
  TrendingUp, Star, BookOpen, Heart, Shield, Zap, Circle,
  Check, AlertCircle, Info, ExternalLink, BarChart3, Award,
  Repeat, CreditCard, FileText, GraduationCap, Lightbulb,
  MessageSquare, Rocket, Sparkles, TreePine, Flame
} from "lucide-react";

// === TDI COLOR PALETTE ===
const COLORS = {
  navy: "#1e2749",
  balticBlue: "#38618C",
  coolSky: "#35A7FF",
  coral: "#E07A5F",
  yellow: "#ffba06",
};

// === ROOSEVELT PILOT DATA ===
// Static fields: school identity info (does not change)
// Dynamic fields: fetched from /api/dashboard/roosevelt/scorecard via page.tsx server component
// and passed in as liveData prop, merged over defaults below.
interface RooseveltLiveData {
  staffCount?: number;
  contractedSeats?: number;
  hubLoggedIn?: number;
  phase?: string;
  phaseNum?: number;
  virtualSessionsDone?: number;
  virtualSessionsTotal?: number;
  daysRemaining?: number;
}

const PILOT_DEFAULTS = {
  school: "Roosevelt School",
  location: "Lodi, NJ",
  phase: "IGNITE",
  phaseNum: 1,
  pilotPeriod: "April – June 2026",
  staffCount: 18,
  contractedSeats: 18,
  hubLoggedIn: 0,
  deliverablesDone: 0,
  deliverablesTotal: 6,
  loveNotesSent: 0,
  virtualSessionsDone: 0,
  virtualSessionsTotal: 4,
  daysRemaining: 0,
  calendlyUrl: "https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone",
  tdiContact: {
    name: "Rae Hughart",
    title: "Founder - CEO",
    email: "hello@teachersdeserveit.com",
    calendly: "https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone",
  },
};

// Module-level mutable reference — updated by RooseveltDashboard on mount
// so sub-component functions (computeHealth, OverviewTab, etc.) get live values
// without requiring full prop-drilling through all function definitions.
let PILOT = { ...PILOT_DEFAULTS };

// === HEALTH INDICATOR (4-signal spec) ===
function computeHealth() {
  let score = 0;
  const pct = (PILOT.hubLoggedIn / PILOT.contractedSeats) * 100;
  if (pct >= 70) score++;
  // Deliverables on schedule (within 30 days) - mark true for pilot launch
  score++;
  // Partner responsive - manually set: yes for pilot
  score++;
  // No open blockers - yes for pilot launch
  score++;
  return {
    score,
    status: score === 4 ? "Strong" : score === 3 ? "On Track" : score === 2 ? "Building" : "Needs Attention",
    color: score === 4 ? "#22c55e" : score === 3 ? COLORS.coolSky : score === 2 ? COLORS.yellow : COLORS.coral,
    details: [
      `Hub logins: ${PILOT.hubLoggedIn}/${PILOT.contractedSeats} educators logged in`,
      "Deliverables are on schedule for the April - June pilot window",
      "Roosevelt leadership is engaged and responsive",
      "No open blockers - pilot launch is clean",
    ],
  };
}

// === DONUT RING COMPONENT ===
function DonutRing({ pct, size = 72, stroke = 8, color }: { pct: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// Hub login color threshold per spec
function hubLoginColor(pct: number) {
  if (pct >= 90) return "#1A6B6B"; // teal
  if (pct >= 70) return COLORS.navy; // navy
  if (pct >= 50) return COLORS.yellow; // amber
  return COLORS.coral;
}

// === STAT CARD ===
function StatCard({ label, value, sub, href, onClick }: { label: string; value: string; sub?: string; href?: string; onClick?: () => void }) {
  const inner = (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color: COLORS.navy }}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      {onClick && <p className="text-xs mt-2 group-hover:underline" style={{ color: COLORS.coolSky }}>View details <ArrowRight className="inline w-3 h-3" /></p>}
    </div>
  );
  if (onClick) return <div onClick={onClick}>{inner}</div>;
  return inner;
}

// === PHASE BADGE ===
function PhaseBadge({ phase }: { phase: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    IGNITE: { bg: COLORS.coral, text: "#fff" },
    ACCELERATE: { bg: COLORS.balticBlue, text: "#fff" },
    SUSTAIN: { bg: "#22c55e", text: "#fff" },
  };
  const c = colors[phase] || { bg: COLORS.navy, text: "#fff" };
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: c.bg, color: c.text }}>
      <Flame className="w-3 h-3" /> {phase}
    </span>
  );
}

// ============================================================
// TAB: OVERVIEW
// ============================================================
function OverviewTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const health = computeHealth();
  const hubPct = Math.round((PILOT.hubLoggedIn / PILOT.contractedSeats) * 100);
  const hubColor = hubLoginColor(hubPct);

  return (
    <div className="space-y-8">
      {/* Zone 1: Snapshot */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">How We&apos;re Doing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Educators Enrolled"
            value={`${PILOT.hubLoggedIn}/${PILOT.staffCount}`}
            sub="logged in to Hub"
            onClick={() => onTabChange("partnership")}
          />
          <StatCard
            label="Deliverables"
            value={`${PILOT.deliverablesDone}/${PILOT.deliverablesTotal}`}
            sub="completed on schedule"
            onClick={() => onTabChange("blueprint")}
          />
          <StatCard
            label="Hub Engagement"
            value={`${hubPct}%`}
            sub={`${PILOT.hubLoggedIn} of ${PILOT.staffCount} active`}
            onClick={() => onTabChange("partnership")}
          />
          <StatCard
            label="Current Phase"
            value={`Phase ${PILOT.phaseNum}`}
            sub={PILOT.phase}
            onClick={() => onTabChange("blueprint")}
          />
        </div>

        {/* Partnership Health Indicator */}
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: health.color }} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm" style={{ color: COLORS.navy }}>
                  Partnership Health: {health.status}
                </span>
                <span className="text-xs text-gray-400">({health.score}/4 signals healthy)</span>
              </div>
              <ul className="space-y-1">
                {health.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Zone 2A: Partnership Timeline */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Partnership Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Done */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Done</span>
            </div>
            <ul className="space-y-2">
              {[
                { label: "Pilot kickoff - Roosevelt onboarded", date: "Apr 1, 2026" },
                { label: "Hub accounts activated for all 24 educators", date: "Apr 3, 2026" },
              ].map((item, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-medium">{item.label}</span>
                  <span className="block text-gray-400">{item.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* In Progress - TDI-owned deliverables only */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4" style={{ color: COLORS.coolSky }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.balticBlue }}>In Progress</span>
            </div>
            <ul className="space-y-2">
              {[
                { label: "Ignite module delivery - all educators", detail: "April 2026" },
                { label: "Implementation tracking underway", detail: "Ongoing" },
              ].map((item, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-medium">{item.label}</span>
                  <span className="block text-gray-400">{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coming Soon */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: COLORS.yellow }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.yellow }}>Coming Soon</span>
            </div>
            <ul className="space-y-2">
              {[
                { label: "Virtual Strategy Session 1", date: "May 2026" },
                { label: "Mid-pilot survey deployment", date: "May 12, 2026" },
                { label: "Virtual Strategy Session 2", date: "Jun 2026" },
                { label: "Pilot outcome report", date: "Jun 30, 2026" },
              ].map((item, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <span className="font-medium">{item.label}</span>
                  <span className="block text-gray-400">{item.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Zone 2B + 2C: Value Mirror + Quick Win */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hub Login Donut */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center mb-3">
            <DonutRing pct={hubPct} color={hubColor} size={80} stroke={9} />
            <span className="absolute text-xl font-bold" style={{ color: hubColor }}>{hubPct}%</span>
          </div>
          <p className="text-xs font-semibold text-center" style={{ color: COLORS.navy }}>Hub Logins</p>
          <p className="text-xs text-gray-500 text-center mt-0.5">{PILOT.hubLoggedIn}/{PILOT.staffCount} logged in</p>
          <p className="text-xs text-gray-400 text-center mt-1">Goal: 100% by Observation Day</p>
        </div>

        {/* Investment Value Mirror */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: COLORS.navy }}>Pilot Value Mirror</p>
          <div className="space-y-3">
            {[
              { stat: `${hubPct}%`, label: "Hub login rate", sub: "Week 1 engagement" },
              { stat: "100%", label: "Account activation", sub: "All 24 seats live" },
              { stat: "3", label: "Months of support", sub: "April - June 2026" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{row.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: COLORS.balticBlue }}>{row.stat}</span>
                  <span className="block text-xs text-gray-400">{row.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Win Counter */}
        <div className="rounded-xl p-5 md:col-span-1 flex flex-col items-center justify-center" style={{ background: COLORS.navy }}>
          <div className="text-5xl font-black text-white mb-2">24</div>
          <p className="text-sm font-semibold text-white text-center">Educators ready for the pilot</p>
          <p className="text-xs text-center mt-1" style={{ color: COLORS.coolSky }}>Every seat activated - no educator left behind</p>
        </div>
      </section>

      {/* Zone 3: Actions Panel */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">What to Focus On</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Next to Unlock - amber */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Next to Unlock</span>
            </div>
            <ul className="space-y-3">
              <li className="text-xs text-gray-700">
                <p className="font-medium">Schedule Virtual Strategy Session 1</p>
                <p className="text-gray-500 mt-0.5">Your first live session with Rae - your pilot support starts here</p>
                <a
                  href={PILOT.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-amber-700 font-semibold hover:underline"
                >
                  Schedule via Calendly <ArrowRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* TDI Handling - blue */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" style={{ color: COLORS.balticBlue }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.balticBlue }}>TDI Handling</span>
            </div>
            <ul className="space-y-2">
              {[
                "Ignite module delivery being prepared for your cohort",
                "Implementation tracking dashboard active",
                "Mid-pilot survey scheduled for May 12",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: COLORS.balticBlue }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Already In Motion - green */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Already In Motion</span>
            </div>
            <ul className="space-y-2">
              {[
                { label: "All 24 Hub accounts activated", date: "Apr 3, 2026" },
                { label: "Pilot kickoff complete", date: "Apr 1, 2026" },
                { label: "Outcome report scheduled", date: "Jun 30, 2026" },
              ].map((item, i) => (
                <li key={i} className="text-xs text-gray-700">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-gray-400">{item.date}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// TAB: OUR PARTNERSHIP
// ============================================================
function OurPartnershipTab() {
  const hubPct = Math.round((PILOT.hubLoggedIn / PILOT.staffCount) * 100);

  return (
    <div className="space-y-6">
      {/* Partnership Goal Statement */}
      <div className="rounded-xl p-6 border-l-4" style={{ background: "#f0f4ff", borderColor: COLORS.navy }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.navy }}>Our Shared Goal</p>
        <p className="text-lg font-semibold text-gray-900 leading-relaxed">
          &ldquo;Every Roosevelt educator has the tools, support, and community they need to build a career worth staying in - starting with this pilot.&rdquo;
        </p>
        <p className="text-xs text-gray-500 mt-3">Established Spring 2026 - Tracked via Hub data, virtual sessions, and pilot surveys</p>
      </div>

      {/* Implementation Equation Banner */}
      <div className="rounded-xl p-5" style={{ background: COLORS.navy }}>
        <div className="flex flex-wrap items-center justify-center gap-2 text-white text-sm font-semibold">
          {["Strong Staff", "Strong Support", "Student Success", "Statewide Results"].map((step, i, arr) => (
            <span key={i} className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: COLORS.coolSky, color: COLORS.navy }}>{step}</span>
              {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-white opacity-60" />}
            </span>
          ))}
        </div>
        <p className="text-center text-xs mt-3 opacity-70 text-white">Phase progression is evidence-based, not time-based</p>
      </div>

      {/* Phase Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: COLORS.navy }}>Your Journey</p>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { phase: "IGNITE", num: 1, active: true },
            { phase: "ACCELERATE", num: 2, active: false },
            { phase: "SUSTAIN", num: 3, active: false },
          ].map((p, i) => (
            <span key={i} className="flex items-center gap-2">
              <span
                className={`relative px-4 py-2 rounded-full text-xs font-bold ${p.active ? "ring-2 ring-offset-2" : "opacity-40"}`}
                style={{
                  background: p.active ? COLORS.coral : "#e5e7eb",
                  color: p.active ? "#fff" : "#6b7280",
                  // @ts-expect-error -- Tailwind ring-color via CSS custom property
                  '--tw-ring-color': COLORS.coral,
                }}
              >
                {p.phase}
                {p.active && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-ping" />
                )}
              </span>
              {p.active && <span className="text-xs text-gray-400 font-medium">YOU ARE HERE</span>}
              {i < 2 && <ArrowRight className="w-4 h-4 text-gray-300" />}
            </span>
          ))}
        </div>
      </div>

      {/* Leading Indicators */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: COLORS.navy }}>Leading Indicators</p>
        <p className="text-xs text-gray-500 mb-4">Pilot baseline - survey data collected at mid-point (May 2026)</p>
        {[
          { label: "Hub Engagement", industry: 52, tdi: 84, school: hubPct, direction: "higher" },
          { label: "Educator Satisfaction", industry: 58, tdi: 87, school: null, direction: "higher" },
          { label: "Strategy Implementation", industry: 44, tdi: 78, school: null, direction: "higher" },
          { label: "Retention Intent", industry: 61, tdi: 88, school: null, direction: "higher" },
        ].map((ind, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <p className="text-xs font-semibold text-gray-700 mb-2">{ind.label}</p>
            {[
              { label: "Industry", value: ind.industry, color: COLORS.coral },
              { label: "TDI Avg", value: ind.tdi, color: COLORS.balticBlue },
              { label: "Roosevelt", value: ind.school, color: "#1A6B6B" },
            ].map((row, j) => (
              <div key={j} className="flex items-center gap-2 mb-1">
                <span className="w-16 text-xs text-gray-400 text-right">{row.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: row.value ? `${row.value}%` : "0%", background: row.color, opacity: row.value ? 1 : 0.3 }}
                  />
                </div>
                <span className="w-10 text-xs text-right" style={{ color: row.color }}>
                  {row.value ? `${row.value}%` : "TBD"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* What Success Looks Like */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: COLORS.navy }}>What Success Looks Like</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { goal: "80%+ Hub engagement by end of April", status: "in_progress" },
            { goal: "All 24 educators complete Ignite module", status: "in_progress" },
            { goal: "75%+ survey response rate at mid-pilot", status: "upcoming" },
            { goal: "Positive retention intent shift by June", status: "upcoming" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                item.status === "done" ? "bg-green-500" :
                item.status === "in_progress" ? "bg-blue-400" : "bg-gray-300"
              }`} />
              <span className="text-xs text-gray-700">{item.goal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: BLUEPRINT
// ============================================================
function BlueprintTab() {
  return (
    <div className="space-y-6">
      {/* Phase model */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: COLORS.navy }}>Pilot Blueprint - April to June 2026</p>
        <div className="space-y-4">
          {[
            {
              phase: "IGNITE", month: "April 2026", current: true,
              description: "Enrollment, orientation, and first module completion",
              deliverables: ["All educators onboarded and logged in by Apr 7", "Orientation module complete", "Ignite module started"],
              target: 80, actual: 75,
            },
            {
              phase: "ACCELERATE", month: "May 2026", current: false,
              description: "Core module completions and mid-pilot check-in survey",
              deliverables: ["Core Accelerate modules complete", "Mid-pilot survey collected by May 12", "Completion target: 75%+ by May 26"],
              target: 75, actual: 0,
            },
            {
              phase: "SUSTAIN", month: "June 2026", current: false,
              description: "Final module, capstone survey, and outcome reporting",
              deliverables: ["Final survey deployed Jun 9", "Outcome report ready Jun 23", "Pilot close Jun 30"],
              target: 70, actual: 0,
            },
          ].map((ph, i) => (
            <div key={i} className={`border rounded-xl p-5 ${ph.current ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-white"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold" style={{ color: COLORS.navy }}>Phase {i + 1} - {ph.phase}</span>
                    {ph.current && <span className="text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: COLORS.coolSky }}>Active</span>}
                  </div>
                  <p className="text-xs text-gray-500">{ph.month}</p>
                  <p className="text-xs text-gray-600 mt-1">{ph.description}</p>
                </div>
                <span className="text-2xl font-black" style={{ color: ph.actual > 0 ? COLORS.balticBlue : "#d1d5db" }}>
                  {ph.actual > 0 ? `${ph.actual}%` : "--"}
                </span>
              </div>
              {ph.actual > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>Target: {ph.target}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${ph.actual}%`, background: COLORS.balticBlue }} />
                  </div>
                </div>
              )}
              <ul className="space-y-1">
                {ph.deliverables.map((d, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3 flex-shrink-0 text-gray-300" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Included With Every Service - standard table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.navy }}>Included With Your Pilot</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Service</th>
              <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Included</th>
            </tr>
          </thead>
          <tbody>
            {[
              { service: "Learning Hub Membership", value: "24 STAFF", bold: true },
              { service: "Virtual Strategy Sessions", value: "2 SESSIONS", bold: true },
              { service: "Pilot Outcome Report", value: "1 REPORT", bold: true },
            ].map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-5 py-3 text-sm font-medium" style={{ color: COLORS.navy }}>{row.service}</td>
                <td className="px-5 py-3 text-right text-sm font-bold" style={{ color: "#1A6B6B" }}>{row.value}</td>
              </tr>
            ))}
            <tr><td colSpan={2} className="border-t-2 border-gray-200" /></tr>
            {[
              "Implementation tracking dashboard",
              "Access to On-Demand Request Pipeline",
              "Network News and Updates",
              "Expert Research and Professional Network",
            ].map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-5 py-3 text-sm text-gray-400">{row}</td>
                <td className="px-5 py-3 text-right text-xs font-semibold" style={{ color: "#1A6B6B" }}>INCLUDED</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// TAB: 2026-27 (Preview)
// ============================================================
function NextYearTab() {
  return (
    <div className="space-y-6">
      {/* Phase Hero */}
      <div className="rounded-xl p-6" style={{ background: COLORS.navy }}>
        <div className="flex items-start justify-between mb-3">
          <PhaseBadge phase="ACCELERATE" />
          <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: COLORS.yellow, color: COLORS.navy }}>Preview</span>
        </div>
        <h2 className="text-2xl font-black text-white mt-4 mb-2">Year 2 - 2026-27</h2>
        <p className="text-sm opacity-80 text-white leading-relaxed">
          Roosevelt&apos;s pilot results will determine the right Year 2 path. Based on what your educators accomplish April - June, we&apos;ll design a full-year partnership that builds on that momentum.
        </p>
      </div>

      {/* Growth Story */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: COLORS.navy }}>The Growth Story</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg p-4 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Pilot 2026</p>
            <ul className="space-y-1.5">
              {["Hub access for 24 educators", "2 virtual strategy sessions", "3-month pilot window", "Outcome report at close"].map((item, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg p-4" style={{ background: "#f0f7ff" }}>
            <p className="text-xs font-bold uppercase mb-2" style={{ color: COLORS.balticBlue }}>Year 2 - 2026-27</p>
            <ul className="space-y-1.5">
              {["Full-year Hub partnership", "In-person Observation Days", "Executive Impact Sessions", "Compliance analytics included"].map((item, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: COLORS.coolSky }} /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Why ACCELERATE banner */}
      <div className="rounded-xl p-5" style={{ background: COLORS.balticBlue }}>
        <p className="text-sm font-bold text-white mb-2">Why ACCELERATE in Year 2?</p>
        <p className="text-xs text-white opacity-80 leading-relaxed">
          Schools that move from pilot to full partnership see 65%+ sustained implementation rates vs. under 10% for Hub-only memberships. ACCELERATE builds the systems your staff needs to make this permanent.
        </p>
      </div>

      {/* Section 10 - GATED (pilot - no funding conversation yet) */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 opacity-40 pointer-events-none">
        <p className="text-center text-gray-500 text-sm py-4">
          Your Year 2 funding options will appear here once we&apos;ve had a chance to walk through your plan together.
        </p>
        <div className="flex justify-center">
          <button className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 border border-gray-200 cursor-not-allowed">
            Schedule That Conversation
          </button>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="rounded-xl p-6 text-center" style={{ background: COLORS.coral }}>
        <p className="text-white font-bold text-lg mb-2">Ready to Talk Year 2?</p>
        <p className="text-white opacity-80 text-sm mb-4">Let&apos;s look at your pilot results together and design the right next step for Roosevelt.</p>
        <a
          href={PILOT.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
          style={{ background: "#fff", color: COLORS.coral }}
        >
          Schedule a Conversation <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ============================================================
// TAB: TEAM
// ============================================================
function TeamTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TDI Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: COLORS.navy }}>Your TDI Contact</p>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: COLORS.balticBlue }}>
              RH
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{PILOT.tdiContact.name}</p>
              <p className="text-xs text-gray-500 mb-2">{PILOT.tdiContact.title}</p>
              <div className="space-y-1">
                <a
                  href={`https://mail.google.com/mail/?view=cm&to=${PILOT.tdiContact.email}&su=${encodeURIComponent("Roosevelt Pilot - Question")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: COLORS.coolSky }}
                >
                  <Mail className="w-3 h-3" /> {PILOT.tdiContact.email}
                </a>
                <a
                  href={PILOT.tdiContact.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: COLORS.coolSky }}
                >
                  <Calendar className="w-3 h-3" /> Schedule a session
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Partnership Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: COLORS.navy }}>Partnership Details</p>
          <dl className="space-y-2">
            {[
              { label: "Phase", value: `Phase ${PILOT.phaseNum} - ${PILOT.phase}` },
              { label: "Period", value: PILOT.pilotPeriod },
              { label: "Type", value: "Pilot - School" },
              { label: "Location", value: PILOT.location },
            ].map((row, i) => (
              <div key={i} className="flex justify-between text-xs">
                <dt className="text-gray-400">{row.label}</dt>
                <dd className="font-medium text-gray-700">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: BILLING
// ============================================================
function BillingTab() {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: COLORS.navy }}>Billing Information</p>
        <p className="text-sm text-gray-600 mb-4">
          All billing details, payment schedules, and investment information are managed through Anchor. Contact us for access.
        </p>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
          <Mail className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.balticBlue }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: COLORS.navy }}>Billing Contact</p>
            <a
              href={`https://mail.google.com/mail/?view=cm&to=Billing@Teachersdeserveit.com&su=${encodeURIComponent("Roosevelt Pilot - Billing Question")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline"
              style={{ color: COLORS.coolSky }}
            >
              Billing@Teachersdeserveit.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "partnership", label: "Our Partnership" },
  { id: "blueprint", label: "Blueprint" },
  { id: "nextyear", label: "2026-27", preview: true },
  { id: "team", label: "Team" },
  { id: "billing", label: "Billing" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function RooseveltDashboard({ liveData }: { liveData?: RooseveltLiveData }) {
  // Merge live data from server-side fetch over defaults.
  // Updates the module-level PILOT reference so computeHealth() and tab
  // sub-components pick up real DB values without prop-drilling.
  if (liveData) {
    PILOT = { ...PILOT_DEFAULTS, ...liveData };
  }

  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const changeTab = (tab: string) => {
    setActiveTab(tab as TabId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <a href="https://teachersdeserveit.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold tracking-wide uppercase mb-2 block" style={{ color: COLORS.coolSky }}>
                Teachers Deserve It
              </a>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black" style={{ color: COLORS.navy }}>{PILOT.school}</h1>
                <PhaseBadge phase={PILOT.phase} />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {PILOT.location} - {PILOT.pilotPeriod}
              </p>
            </div>
            <a
              href={PILOT.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap flex-shrink-0"
              style={{ background: COLORS.balticBlue }}
            >
              <Calendar className="w-3 h-3" /> Schedule Session
            </a>
          </div>
        </div>
      </header>

      {/* Sticky Tab Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`flex items-center gap-1 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-white border-transparent"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                style={activeTab === tab.id ? { borderBottomColor: COLORS.navy, color: COLORS.navy, borderBottomWidth: "2px", fontWeight: 700 } : {}}
              >
                {tab.label}
                {"preview" in tab && tab.preview && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: COLORS.yellow, color: COLORS.navy, fontSize: "9px" }}>
                    PREVIEW
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "overview" && <OverviewTab onTabChange={changeTab} />}
        {activeTab === "partnership" && <OurPartnershipTab />}
        {activeTab === "blueprint" && <BlueprintTab />}
        {activeTab === "nextyear" && <NextYearTab />}
        {activeTab === "team" && <TeamTab />}
        {activeTab === "billing" && <BillingTab />}
      </main>
    </div>
  );
}
