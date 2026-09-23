// ---------------------------------------------------------------------------
// Runtime switches for the funding portal.
//
// The Hub has hub_config and Creator Studio has creator_flags.ts. Funding had
// nothing, so every change to those screens was all or nothing at deploy time.
//
// This exists so the rebuilt funding screens can ship dark while the current
// portal keeps working, and so that turning them off again is one UPDATE rather
// than a deploy:
//
//   update funding_config set enabled = false where key = 'new_pages';
//
// Flags default OFF when the row is missing or the read fails. A flag that
// silently turns itself on because a query errored is worse than no flag, and
// here it would mean serving a half-finished screen to the person running the
// grant pipeline.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

export type FundingFlag = 'new_pages';

/**
 * Reads a flag. Never throws, and never returns true by accident: an error, a
 * missing row, and an explicit false all mean off.
 */
export async function fundingFlag(supabase: DbClient, key: FundingFlag): Promise<boolean> {
  const { data, error } = await supabase
    .from('funding_config')
    .select('enabled')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`[funding-flags] Could not read "${key}", treating as off:`, error.message);
    return false;
  }

  return data?.enabled === true;
}
