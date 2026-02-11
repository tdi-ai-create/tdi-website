'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Download,
  Loader2,
  AlertCircle,
  Check,
  X,
  Users,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Types
interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  contact_name: string;
}

interface Organization {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  building_id?: string;
  building?: { name: string } | null;
}

interface SurveyResponse {
  id: string;
  staff_member_id: string;
  survey_type: string;
  stress_level: number | null;
  planning_hours: number | null;
  retention_intent: number | null;
  implementation_confidence: number | null;
  feeling_valued: number | null;
  submitted_at: string;
  staff_member?: StaffMember;
}

interface Building {
  id: string;
  name: string;
}

interface SurveyAverages {
  avg_stress: number | null;
  avg_planning_hours: number | null;
  avg_retention_intent: number | null;
  avg_implementation_confidence: number | null;
  avg_feeling_valued: number | null;
}

interface BulkRow {
  email: string;
  stress_level: number | null;
  planning_hours: number | null;
  retention_intent: number | null;
  implementation_confidence: number | null;
  feeling_valued: number | null;
  matched?: boolean;
  staff_name?: string;
  error?: string;
}

const SURVEY_TYPES = [
  { value: 'baseline', label: 'Baseline' },
  { value: 'mid_year', label: 'Mid-Year' },
  { value: 'end_of_year', label: 'End of Year' },
  { value: 'custom', label: 'Custom' },
];

// Check if user is TDI admin
async function checkTDIAdmin(email: string): Promise<boolean> {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

// Slider component with TDI colors
function SurveySlider({
  label,
  subLabel,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  isHighGood = true,
  showNumber = true,
}: {
  label: string;
  subLabel?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  isHighGood?: boolean;
  showNumber?: boolean;
}) {
  const displayValue = value ?? min;
  const pct = ((displayValue - min) / (max - min)) * 100;

  // Color based on value and whether high is good
  const getColor = () => {
    const normalized = pct / 100;
    if (isHighGood) {
      // High = teal, low = coral
      return normalized > 0.6 ? '#4ecdc4' : normalized > 0.3 ? '#E8B84B' : '#e76f51';
    } else {
      // High = coral (bad), low = teal (good)
      return normalized < 0.4 ? '#4ecdc4' : normalized < 0.7 ? '#E8B84B' : '#e76f51';
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
        </div>
        {showNumber && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? null : Number(e.target.value);
                if (v === null || (v >= min && v <= max)) {
                  onChange(v);
                }
              }}
              className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
            />
            <span className="text-xs text-gray-400">/ {max}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${getColor()} 0%, ${getColor()} ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
          }}
        />
      </div>
    </div>
  );
}

// Metric card component
function MetricCard({
  label,
  value,
  max,
  isHighGood = true,
  unit = '',
  previousValue,
}: {
  label: string;
  value: number | null;
  max?: number;
  isHighGood?: boolean;
  unit?: string;
  previousValue?: number | null;
}) {
  if (value === null) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-gray-300">—</p>
      </div>
    );
  }

  const displayValue = value.toFixed(1);
  const getColor = () => {
    if (max) {
      const normalized = value / max;
      if (isHighGood) {
        return normalized > 0.6 ? '#4ecdc4' : normalized > 0.3 ? '#E8B84B' : '#e76f51';
      } else {
        return normalized < 0.4 ? '#4ecdc4' : normalized < 0.7 ? '#E8B84B' : '#e76f51';
      }
    }
    return '#1e2749';
  };

  let delta = null;
  let deltaColor = '';
  if (previousValue !== undefined && previousValue !== null) {
    delta = ((value - previousValue) / previousValue) * 100;
    const improved = isHighGood ? delta > 0 : delta < 0;
    deltaColor = improved ? '#4ecdc4' : '#e76f51';
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color: getColor() }}>
        {displayValue}{unit}
        {max && <span className="text-sm text-gray-400"> / {max}</span>}
      </p>
      {delta !== null && (
        <div className="flex items-center justify-center gap-1 mt-1">
          {delta > 0 ? (
            <TrendingUp className="w-3 h-3" style={{ color: deltaColor }} />
          ) : delta < 0 ? (
            <TrendingDown className="w-3 h-3" style={{ color: deltaColor }} />
          ) : (
            <Minus className="w-3 h-3 text-gray-400" />
          )}
          <span className="text-xs" style={{ color: deltaColor }}>
            {delta > 0 ? '+' : ''}{delta.toFixed(0)}%
          </span>
        </div>
      )}
      <p className="text-[10px] text-gray-400 mt-1">
        {isHighGood ? '↑ Higher is better' : '↓ Lower is better'}
      </p>
    </div>
  );
}

export default function SurveyEntryPage() {
  const router = useRouter();
  const params = useParams();
  const partnershipId = params.id as string;

  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);

  // UI state
  const [surveyType, setSurveyType] = useState('baseline');
  const [customLabel, setCustomLabel] = useState('');
  const [entryMode, setEntryMode] = useState<'individual' | 'bulk'>('individual');

  // Individual entry state
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [formData, setFormData] = useState({
    stress_level: null as number | null,
    planning_hours: null as number | null,
    retention_intent: null as number | null,
    implementation_confidence: null as number | null,
    feeling_valued: null as number | null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Bulk upload state
  const [bulkData, setBulkData] = useState<BulkRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aggregation debounce
  const aggregateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalStaff: 0,
    respondedCount: 0,
    responseRate: 0,
  });

  // Previous survey averages (for comparison)
  const [previousAverages, setPreviousAverages] = useState<SurveyAverages | null>(null);

  const loadData = useCallback(async (email: string) => {
    try {
      // Load partnership details
      const partnershipRes = await fetch(`/api/admin/partnerships/${partnershipId}`, {
        headers: { 'x-user-email': email },
      });
      const partnershipData = await partnershipRes.json();

      if (partnershipData.success) {
        setPartnership(partnershipData.partnership);
        setOrganization(partnershipData.organization);
        setBuildings(partnershipData.buildings || []);

        // Load staff members
        const staffRes = await fetch(`/api/admin/partnerships/${partnershipId}`, {
          headers: { 'x-user-email': email },
        });
        const staffData = await staffRes.json();
        if (staffData.success && staffData.staff) {
          setStaffMembers(staffData.staff);
        }
      }

      // Load survey responses
      await loadSurveyResponses(email);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [partnershipId]);

  const loadSurveyResponses = useCallback(async (email: string) => {
    const res = await fetch(
      `/api/admin/surveys?partnership_id=${partnershipId}&survey_type=${surveyType}`,
      { headers: { 'x-user-email': email } }
    );
    const data = await res.json();
    if (data.success) {
      setSurveyResponses(data.responses || []);
      setStats(data.stats);
    }
  }, [partnershipId, surveyType]);

  // Load previous survey averages for comparison
  const loadPreviousAverages = useCallback(async (email: string) => {
    // Determine previous survey type
    const typeOrder = ['baseline', 'mid_year', 'end_of_year'];
    const currentIndex = typeOrder.indexOf(surveyType);
    if (currentIndex <= 0) {
      setPreviousAverages(null);
      return;
    }

    const previousType = typeOrder[currentIndex - 1];
    const res = await fetch(
      `/api/admin/surveys?partnership_id=${partnershipId}&survey_type=${previousType}`,
      { headers: { 'x-user-email': email } }
    );
    const data = await res.json();

    if (data.success && data.responses?.length > 0) {
      const responses = data.responses;
      const avg = (field: keyof typeof formData) => {
        const values = responses.filter((r: SurveyResponse) => r[field] != null).map((r: SurveyResponse) => Number(r[field]));
        return values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : null;
      };

      setPreviousAverages({
        avg_stress: avg('stress_level'),
        avg_planning_hours: avg('planning_hours'),
        avg_retention_intent: avg('retention_intent'),
        avg_implementation_confidence: avg('implementation_confidence'),
        avg_feeling_valued: avg('feeling_valued'),
      });
    } else {
      setPreviousAverages(null);
    }
  }, [partnershipId, surveyType]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.push('/creator-portal');
        return;
      }

      const isAdmin = await checkTDIAdmin(session.user.email);
      if (!isAdmin) {
        setAccessDenied(true);
        setIsLoading(false);
        return;
      }

      setUserEmail(session.user.email);
      await loadData(session.user.email);
    };

    checkAuth();
  }, [router, loadData]);

  // Reload responses when survey type changes
  useEffect(() => {
    if (userEmail) {
      loadSurveyResponses(userEmail);
      loadPreviousAverages(userEmail);
    }
  }, [surveyType, userEmail, loadSurveyResponses, loadPreviousAverages]);

  // Calculate current averages
  const currentAverages: SurveyAverages = {
    avg_stress: null,
    avg_planning_hours: null,
    avg_retention_intent: null,
    avg_implementation_confidence: null,
    avg_feeling_valued: null,
  };

  if (surveyResponses.length > 0) {
    const avg = (field: keyof typeof formData) => {
      const values = surveyResponses.filter((r) => r[field] != null).map((r) => Number(r[field]));
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    };

    currentAverages.avg_stress = avg('stress_level');
    currentAverages.avg_planning_hours = avg('planning_hours');
    currentAverages.avg_retention_intent = avg('retention_intent');
    currentAverages.avg_implementation_confidence = avg('implementation_confidence');
    currentAverages.avg_feeling_valued = avg('feeling_valued');
  }

  // Get responded staff IDs
  const respondedStaffIds = new Set(surveyResponses.map((r) => r.staff_member_id));

  // Get next unresponded staff member
  const getNextStaffId = () => {
    const currentIndex = staffMembers.findIndex((s) => s.id === selectedStaffId);
    for (let i = currentIndex + 1; i < staffMembers.length; i++) {
      if (!respondedStaffIds.has(staffMembers[i].id)) {
        return staffMembers[i].id;
      }
    }
    return '';
  };

  // Debounced aggregation
  const triggerAggregation = useCallback(async () => {
    if (!userEmail) return;

    if (aggregateTimeoutRef.current) {
      clearTimeout(aggregateTimeoutRef.current);
    }

    aggregateTimeoutRef.current = setTimeout(async () => {
      await fetch('/api/admin/surveys/aggregate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          partnership_id: partnershipId,
          survey_type: surveyType,
        }),
      });
    }, 5000);
  }, [userEmail, partnershipId, surveyType]);

  // Handle individual save
  const handleSave = async (andNext = false) => {
    if (!userEmail || !selectedStaffId) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/admin/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          partnership_id: partnershipId,
          staff_member_id: selectedStaffId,
          survey_type: surveyType,
          custom_label: surveyType === 'custom' ? customLabel : null,
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const staffName = staffMembers.find((s) => s.id === selectedStaffId);
        setSaveMessage(`Response saved for ${staffName?.first_name} ${staffName?.last_name}`);

        // Reload responses
        await loadSurveyResponses(userEmail);

        // Trigger aggregation (debounced)
        triggerAggregation();

        if (andNext) {
          const nextId = getNextStaffId();
          setSelectedStaffId(nextId);
          setFormData({
            stress_level: null,
            planning_hours: null,
            retention_intent: null,
            implementation_confidence: null,
            feeling_valued: null,
          });
        }

        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving survey response:', error);
      setSaveMessage('Failed to save response');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle CSV download template
  const handleDownloadTemplate = () => {
    const headers = [
      'Email',
      'Stress Level (1-10)',
      'Planning Hours',
      'Retention Intent (1-10)',
      'Implementation Confidence (1-10)',
      'Feeling Valued (1-10)',
    ];

    const rows = staffMembers.map((s) => [s.email, '', '', '', '', '']);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_template_${surveyType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);

    if (lines.length < 2) {
      setUploadMessage('CSV file is empty or has no data rows');
      return;
    }

    // Parse headers
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const emailIndex = headers.findIndex((h) => h.includes('email'));
    const stressIndex = headers.findIndex((h) => h.includes('stress'));
    const planningIndex = headers.findIndex((h) => h.includes('planning'));
    const retentionIndex = headers.findIndex((h) => h.includes('retention'));
    const implementationIndex = headers.findIndex((h) => h.includes('implementation') || h.includes('confidence'));
    const valuedIndex = headers.findIndex((h) => h.includes('valued'));

    if (emailIndex === -1) {
      setUploadMessage('CSV must have an Email column');
      return;
    }

    // Parse data rows
    const rows: BulkRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const email = values[emailIndex];
      if (!email) continue;

      const parseNum = (idx: number, min: number, max: number): number | null => {
        if (idx === -1) return null;
        const v = parseFloat(values[idx]);
        if (isNaN(v)) return null;
        if (v < min || v > max) return null;
        return v;
      };

      rows.push({
        email,
        stress_level: parseNum(stressIndex, 1, 10),
        planning_hours: parseNum(planningIndex, 0, 100),
        retention_intent: parseNum(retentionIndex, 1, 10),
        implementation_confidence: parseNum(implementationIndex, 1, 10),
        feeling_valued: parseNum(valuedIndex, 1, 10),
      });
    }

    // Match emails to staff members
    const staffByEmail = new Map(staffMembers.map((s) => [s.email.toLowerCase(), s]));
    const processedRows = rows.map((row) => {
      const staff = staffByEmail.get(row.email.toLowerCase());
      return {
        ...row,
        matched: !!staff,
        staff_name: staff ? `${staff.first_name} ${staff.last_name}` : undefined,
      };
    });

    setBulkData(processedRows);
    setUploadMessage('');
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    if (!userEmail || bulkData.length === 0) return;

    setIsUploading(true);
    setUploadMessage('');

    try {
      const res = await fetch('/api/admin/surveys/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          partnership_id: partnershipId,
          survey_type: surveyType,
          custom_label: surveyType === 'custom' ? customLabel : null,
          responses: bulkData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUploadMessage(`Imported ${data.imported} responses successfully!`);
        setBulkData([]);

        // Reload responses
        await loadSurveyResponses(userEmail);

        // Trigger immediate aggregation
        await fetch('/api/admin/surveys/aggregate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail,
          },
          body: JSON.stringify({
            partnership_id: partnershipId,
            survey_type: surveyType,
          }),
        });
      } else {
        setUploadMessage(data.error || 'Failed to import');
      }
    } catch (error) {
      console.error('Error importing surveys:', error);
      setUploadMessage('Failed to import responses');
    } finally {
      setIsUploading(false);
    }
  };

  // Access Denied state
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-[#1e2749] mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to TDI team members.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-lg hover:bg-[#2a3459] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading survey data...</p>
        </div>
      </div>
    );
  }

  const orgName = organization?.name || partnership?.contact_name || 'Partnership';
  const matchedCount = bulkData.filter((r) => r.matched).length;
  const notFoundCount = bulkData.filter((r) => !r.matched).length;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={140}
              height={42}
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm bg-[#1e2749] text-white px-3 py-1 rounded-full">
                TDI Admin
              </span>
              <span className="text-sm text-gray-600">Survey Data</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/admin/partnerships" className="hover:text-[#1e2749]">Admin</Link>
          <span className="mx-2">→</span>
          <Link href="/admin/partnerships" className="hover:text-[#1e2749]">Partnerships</Link>
          <span className="mx-2">→</span>
          <Link href={`/admin/partnerships/${partnershipId}`} className="hover:text-[#1e2749]">{orgName}</Link>
          <span className="mx-2">→</span>
          <span className="text-[#1e2749]">Survey Data</span>
        </nav>

        {/* Back link */}
        <Link
          href={`/admin/partnerships/${partnershipId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1e2749] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Partnership
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1e2749]">Survey Data Entry</h1>
              <p className="text-gray-600 mt-1">{orgName}</p>
            </div>

            {/* Survey Type Selector */}
            <div className="flex items-center gap-3">
              <select
                value={surveyType}
                onChange={(e) => setSurveyType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
              >
                {SURVEY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {surveyType === 'custom' && (
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Custom label..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              )}
            </div>
          </div>

          {/* Response Rate */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Response Rate</span>
              <span className="text-sm text-gray-600">
                {stats.respondedCount} of {stats.totalStaff} staff recorded ({stats.responseRate}%)
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stats.responseRate}%`,
                  backgroundColor:
                    stats.responseRate >= 75 ? '#4ecdc4' :
                    stats.responseRate >= 50 ? '#E8B84B' : '#e76f51',
                }}
              />
            </div>
          </div>
        </div>

        {/* Entry Mode Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setEntryMode('individual')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                entryMode === 'individual'
                  ? 'text-[#1e2749] border-b-2 border-[#1e2749]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              Individual Entry
            </button>
            <button
              onClick={() => setEntryMode('bulk')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                entryMode === 'bulk'
                  ? 'text-[#1e2749] border-b-2 border-[#1e2749]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Bulk CSV Upload
            </button>
          </div>

          <div className="p-6">
            {entryMode === 'individual' ? (
              /* Individual Entry Mode */
              <div>
                {/* Staff Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Staff Member
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => {
                      setSelectedStaffId(e.target.value);
                      // Load existing response if any
                      const existingResponse = surveyResponses.find(
                        (r) => r.staff_member_id === e.target.value
                      );
                      if (existingResponse) {
                        setFormData({
                          stress_level: existingResponse.stress_level,
                          planning_hours: existingResponse.planning_hours,
                          retention_intent: existingResponse.retention_intent,
                          implementation_confidence: existingResponse.implementation_confidence,
                          feeling_valued: existingResponse.feeling_valued,
                        });
                      } else {
                        setFormData({
                          stress_level: null,
                          planning_hours: null,
                          retention_intent: null,
                          implementation_confidence: null,
                          feeling_valued: null,
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  >
                    <option value="">Select staff member...</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name}
                        {staff.building?.name ? ` — ${staff.building.name}` : ''}
                        {respondedStaffIds.has(staff.id) ? ' ✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Survey Form */}
                {selectedStaffId && (
                  <div className="space-y-6">
                    <SurveySlider
                      label="How stressed do you feel?"
                      subLabel="10 = extremely stressed"
                      value={formData.stress_level}
                      onChange={(v) => setFormData({ ...formData, stress_level: v })}
                      isHighGood={false}
                    />

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weekly planning hours
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={40}
                        step={0.5}
                        value={formData.planning_hours ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            planning_hours: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                        placeholder="e.g., 4.5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                      />
                    </div>

                    <SurveySlider
                      label="How likely to return next year?"
                      subLabel="10 = definitely returning"
                      value={formData.retention_intent}
                      onChange={(v) => setFormData({ ...formData, retention_intent: v })}
                      isHighGood={true}
                    />

                    <SurveySlider
                      label="Confidence implementing new strategies?"
                      subLabel="10 = very confident"
                      value={formData.implementation_confidence}
                      onChange={(v) => setFormData({ ...formData, implementation_confidence: v })}
                      isHighGood={true}
                    />

                    <SurveySlider
                      label="How valued do you feel?"
                      subLabel="10 = extremely valued"
                      value={formData.feeling_valued}
                      onChange={(v) => setFormData({ ...formData, feeling_valued: v })}
                      isHighGood={true}
                    />

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="flex-1 bg-[#1e2749] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Save &amp; Next
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>

                    {saveMessage && (
                      <div className={`p-3 rounded-lg text-sm ${
                        saveMessage.includes('Failed')
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {saveMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Bulk Upload Mode */
              <div>
                {/* Download Template */}
                <div className="mb-6">
                  <button
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Template includes all staff emails. Fill in the survey values and upload.
                  </p>
                </div>

                {/* Upload Zone */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#80a4ed] transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && fileInputRef.current) {
                      const dt = new DataTransfer();
                      dt.items.add(file);
                      fileInputRef.current.files = dt.files;
                      handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Drop CSV file here or click to browse</p>
                  <p className="text-sm text-gray-400 mt-1">Only .csv files are accepted</p>
                </div>

                {uploadMessage && !bulkData.length && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    uploadMessage.includes('Failed') || uploadMessage.includes('empty')
                      ? 'bg-red-50 text-red-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {uploadMessage}
                  </div>
                )}

                {/* Preview Table */}
                {bulkData.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#1e2749]">Preview</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">{matchedCount} matched</span>
                        <span className="text-red-600">{notFoundCount} not found</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-700">Stress</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-700">Planning</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-700">Retention</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-700">Confidence</th>
                            <th className="px-4 py-3 text-center font-medium text-gray-700">Valued</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkData.slice(0, 20).map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-2">{row.email}</td>
                              <td className={`px-4 py-2 ${row.matched ? 'text-green-600' : 'text-red-600'}`}>
                                {row.matched ? row.staff_name : 'Not found'}
                              </td>
                              <td className="px-4 py-2 text-center">{row.stress_level ?? '—'}</td>
                              <td className="px-4 py-2 text-center">{row.planning_hours ?? '—'}</td>
                              <td className="px-4 py-2 text-center">{row.retention_intent ?? '—'}</td>
                              <td className="px-4 py-2 text-center">{row.implementation_confidence ?? '—'}</td>
                              <td className="px-4 py-2 text-center">{row.feeling_valued ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {bulkData.length > 20 && (
                        <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center border-t border-gray-200">
                          Showing first 20 of {bulkData.length} rows
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={handleBulkImport}
                        disabled={isUploading || matchedCount === 0}
                        className="bg-[#1e2749] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Import {matchedCount} Responses
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setBulkData([]);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    {uploadMessage && (
                      <div className={`mt-4 p-3 rounded-lg text-sm ${
                        uploadMessage.includes('Failed')
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {uploadMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Survey Summary Dashboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1e2749] mb-6">
            Survey Summary: {SURVEY_TYPES.find((t) => t.value === surveyType)?.label}
          </h2>

          {/* Current Averages */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <MetricCard
              label="Avg. Stress"
              value={currentAverages.avg_stress}
              max={10}
              isHighGood={false}
              previousValue={previousAverages?.avg_stress}
            />
            <MetricCard
              label="Planning Hours"
              value={currentAverages.avg_planning_hours}
              isHighGood={true}
              unit=" hrs/wk"
              previousValue={previousAverages?.avg_planning_hours}
            />
            <MetricCard
              label="Retention Intent"
              value={currentAverages.avg_retention_intent}
              max={10}
              isHighGood={true}
              previousValue={previousAverages?.avg_retention_intent}
            />
            <MetricCard
              label="Implementation"
              value={currentAverages.avg_implementation_confidence}
              max={10}
              isHighGood={true}
              previousValue={previousAverages?.avg_implementation_confidence}
            />
            <MetricCard
              label="Feeling Valued"
              value={currentAverages.avg_feeling_valued}
              max={10}
              isHighGood={true}
              previousValue={previousAverages?.avg_feeling_valued}
            />
          </div>

          {/* Per-Building Breakdown (district only) */}
          {partnership?.partnership_type === 'district' && buildings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Per-Building Breakdown
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Building</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Responses</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Stress</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Retention</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Implementation</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Valued</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildings.map((building, idx) => {
                      const buildingStaff = staffMembers.filter((s) => s.building_id === building.id);
                      const buildingResponses = surveyResponses.filter((r) =>
                        buildingStaff.some((s) => s.id === r.staff_member_id)
                      );

                      const avg = (field: keyof typeof formData) => {
                        const values = buildingResponses
                          .filter((r) => r[field] != null)
                          .map((r) => Number(r[field]));
                        return values.length > 0
                          ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
                          : '—';
                      };

                      return (
                        <tr key={building.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium">{building.name}</td>
                          <td className="px-4 py-3 text-center">{buildingResponses.length}</td>
                          <td className="px-4 py-3 text-center">{avg('stress_level')}</td>
                          <td className="px-4 py-3 text-center">{avg('retention_intent')}</td>
                          <td className="px-4 py-3 text-center">{avg('implementation_confidence')}</td>
                          <td className="px-4 py-3 text-center">{avg('feeling_valued')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
