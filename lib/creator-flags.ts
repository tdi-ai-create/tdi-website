// ---------------------------------------------------------------------------
// Runtime switches for Creator Studio.
//
// The Hub has hub_config for this. The creator portal had nothing, so every
// change here was all or nothing at deploy time, and rolling one back meant
// another deploy. A flag in the database means a bad change is undone with a
// single UPDATE while the code stays where it is.
//
//   update creator_config set enabled = true where key = 'step_engine';
//
// Flags default OFF when the row is missing or the read fails. A flag that
// silently turns itself on because a query errored is worse than no flag.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

export type CreatorFlag = 'step_engine';

/**
 * Reads a flag. Never throws, and never returns true by accident: an error, a
 * missing row, and an explicit false all mean off.
 */
export async function creatorFlag(supabase: DbClient, key: CreatorFlag): Promise<boolean> {
  const { data, error } = await supabase
    .from('creator_config')
    .select('enabled')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`[creator-flags] Could not read "${key}", treating as off:`, error.message);
    return false;
  }

  return data?.enabled === true;
}
