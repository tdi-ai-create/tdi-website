'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Upload, FileText, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const theme = {
  accent: '#6366F1',
  accentLight: '#EEF2FF',
};

interface ParsedSubscriber {
  email: string;
  name: string;
  type: string;
}

interface ImportResults {
  total_processed: number;
  new_profiles: number;
  new_memberships: number;
  upgraded: number;
  already_correct: number;
  skipped_protected: number;
  skipped_author_comp: number;
  errors: number;
  error_details: string[];
}

type ImportState = 'upload' | 'preview' | 'processing' | 'complete';

function parseCSV(text: string): ParsedSubscriber[] {
  const lines = text.split('\n');
  if (lines.length < 2) return [];

  // Parse header to find column indices
  const header = parseCSVLine(lines[0]);
  const emailIdx = header.findIndex(h => h.toLowerCase().trim() === 'email');
  const nameIdx = header.findIndex(h => h.toLowerCase().trim() === 'name');
  const typeIdx = header.findIndex(h => h.toLowerCase().trim() === 'type');

  if (emailIdx === -1) return [];

  const subscribers: ParsedSubscriber[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    const email = fields[emailIdx]?.trim();
    if (!email) continue;

    subscribers.push({
      email,
      name: nameIdx >= 0 ? (fields[nameIdx]?.trim() || '') : '',
      type: typeIdx >= 0 ? (fields[typeIdx]?.trim() || 'Free') : 'Free',
    });
  }

  return subscribers;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

export default function SubstackImportPage() {
  const [state, setState] = useState<ImportState>('upload');
  const [subscribers, setSubscribers] = useState<ParsedSubscriber[]>([]);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, batch: 0, totalBatches: 0 });
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const cancelledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError('No valid subscribers found in the CSV. Make sure it has an "Email" column.');
        return;
      }
      setSubscribers(parsed);
      setState('preview');
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const cancelImport = () => {
    cancelledRef.current = true;
    setCancelled(true);
  };

  const startImport = async () => {
    setState('processing');
    setError(null);
    setCancelled(false);
    cancelledRef.current = false;

    const CHUNK_SIZE = 50;
    const DELAY_MS = 500;
    const MAX_RETRIES = 3;
    const chunks: ParsedSubscriber[][] = [];
    for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
      chunks.push(subscribers.slice(i, i + CHUNK_SIZE));
    }

    setProgress({ current: 0, total: subscribers.length, batch: 0, totalBatches: chunks.length });

    const aggregated: ImportResults = {
      total_processed: 0,
      new_profiles: 0,
      new_memberships: 0,
      upgraded: 0,
      already_correct: 0,
      skipped_protected: 0,
      skipped_author_comp: 0,
      errors: 0,
      error_details: [],
    };

    for (let i = 0; i < chunks.length; i++) {
      if (cancelledRef.current) break;

      setProgress(prev => ({ ...prev, batch: i + 1, current: i * CHUNK_SIZE }));

      let success = false;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const res = await fetch('/api/tdi-admin/substack-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscribers: chunks[i] }),
          });

          const data = await res.json();

          if (!data.success) {
            if (attempt === MAX_RETRIES) {
              aggregated.errors += chunks[i].length;
              aggregated.error_details.push(`Batch ${i + 1} failed after ${MAX_RETRIES} attempts: ${data.error}`);
            }
            // Wait longer before retry
            await new Promise(r => setTimeout(r, DELAY_MS * attempt * 2));
            continue;
          }

          const r = data.results;
          aggregated.total_processed += r.total_processed;
          aggregated.new_profiles += r.new_profiles;
          aggregated.new_memberships += r.new_memberships;
          aggregated.upgraded += r.upgraded;
          aggregated.already_correct += r.already_correct;
          aggregated.skipped_protected += r.skipped_protected;
          aggregated.skipped_author_comp += r.skipped_author_comp;
          aggregated.errors += r.errors;
          aggregated.error_details.push(...r.error_details);
          success = true;
          break;
        } catch (err) {
          if (attempt === MAX_RETRIES) {
            aggregated.errors += chunks[i].length;
            aggregated.error_details.push(`Batch ${i + 1} network error after ${MAX_RETRIES} attempts`);
          }
          // Wait longer before retry
          await new Promise(r => setTimeout(r, DELAY_MS * attempt * 2));
        }
      }

      // Delay between batches to avoid rate limits
      if (success && i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    setProgress(prev => ({ ...prev, current: subscribers.length }));
    setResults(aggregated);
    setState('complete');
  };

  const reset = () => {
    setState('upload');
    setSubscribers([]);
    setResults(null);
    setProgress({ current: 0, total: 0, batch: 0, totalBatches: 0 });
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Compute preview stats
  const paidCount = subscribers.filter(s =>
    s.type === 'Yearly Subscriber' || s.type === 'Monthly Subscriber' || s.type === 'Founding Member'
  ).length;
  const freeCount = subscribers.filter(s =>
    s.type !== 'Yearly Subscriber' && s.type !== 'Monthly Subscriber' && s.type !== 'Founding Member' && s.type !== 'Author' && s.type !== 'Comp'
  ).length;
  const skippedCount = subscribers.filter(s => s.type === 'Author' || s.type === 'Comp').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/tdi-admin/hub/operations"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={14} />
            Back to Operations
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Import Substack Subscribers
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Sync your Substack subscriber list into the Learning Hub.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* State 1: Upload */}
        {state === 'upload' && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={40} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700">
              Upload your Substack subscriber export (CSV)
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Export from Substack: Settings &gt; Subscribers &gt; Export
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Drop a file here or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}

        {/* State 2: Preview */}
        {state === 'preview' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accentLight }}>
                <FileText size={20} style={{ color: theme.accent }} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{subscribers.length.toLocaleString()} total subscribers</p>
                <p className="text-sm text-gray-500">Ready to process</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Paid subscribers (essentials tier)</span>
                <span className="font-medium text-gray-900">{paidCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Free subscribers (free tier)</span>
                <span className="font-medium text-gray-900">{freeCount.toLocaleString()}</span>
              </div>
              {skippedCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Will be skipped (Author/Comp)</span>
                  <span className="font-medium text-gray-500">{skippedCount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              {paidCount > 0 && `${paidCount.toLocaleString()} paid subscribers will get essentials tier. `}
              {freeCount > 0 && `${freeCount.toLocaleString()} free subscribers will get free tier.`}
            </p>

            {subscribers.length > 1000 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>This may take a few minutes for large exports.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={startImport}
                className="px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors hover:opacity-90"
                style={{ backgroundColor: theme.accent }}
              >
                Start Import
              </button>
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* State 3: Processing */}
        {state === 'processing' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Loader2 size={24} className="animate-spin" style={{ color: theme.accent }} />
              <div>
                <p className="font-semibold text-gray-900">Importing subscribers...</p>
                <p className="text-sm text-gray-500">
                  Processing batch {progress.batch} of {progress.totalBatches}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                    backgroundColor: theme.accent,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                {progress.current.toLocaleString()} of {progress.total.toLocaleString()} subscribers
              </p>
            </div>

            <button
              onClick={cancelImport}
              disabled={cancelled}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelled ? 'Cancelling after current batch...' : 'Cancel Import'}
            </button>
          </div>
        )}

        {/* State 4: Complete */}
        {state === 'complete' && results && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={18} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Import Complete</p>
                <p className="text-sm text-green-700">
                  Processed {results.total_processed.toLocaleString()} subscribers
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">New profiles created</span>
                <span className="font-medium text-gray-900">{results.new_profiles.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New memberships added</span>
                <span className="font-medium text-gray-900">{results.new_memberships.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upgraded (free to essentials)</span>
                <span className="font-medium text-gray-900">{results.upgraded.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Already correct (no change)</span>
                <span className="font-medium text-gray-900">{results.already_correct.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skipped (protected district partners)</span>
                <span className="font-medium text-gray-900">{results.skipped_protected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skipped (Author/Comp)</span>
                <span className="font-medium text-gray-900">{results.skipped_author_comp.toLocaleString()}</span>
              </div>
              {results.errors > 0 && (
                <div className="flex justify-between text-red-700">
                  <span>Errors</span>
                  <span className="font-medium">{results.errors.toLocaleString()}</span>
                </div>
              )}
            </div>

            {results.error_details.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-red-600 font-medium">
                  View error details ({results.error_details.length})
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto bg-red-50 rounded-lg p-3 space-y-1 text-xs text-red-700 font-mono">
                  {results.error_details.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              </details>
            )}

            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors hover:opacity-90"
              style={{ backgroundColor: theme.accent }}
            >
              Import Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
