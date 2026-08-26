/**
 * One place that knows how a school profile is shaped.
 *
 * The profile was written with JSON.stringify into a jsonb column in two
 * separate routes, so Postgres stored the *text* of the object rather than the
 * object. Every row came back as a JSON string. school_profile->>'ein'
 * returned nothing and the column could not be queried or validated at all.
 *
 * Three separate copies of a tolerant double-parse grew up to work around it,
 * and two other readers did a single parse, got a string back, and silently
 * showed nothing. One of those is the panel that displays the profile.
 *
 * Writers now store the object. This reader still accepts the old shape so a
 * row that has not been backfilled does not break, and can be simplified once
 * no double-encoded rows remain.
 */

export type SchoolProfile = Record<string, unknown>;

export function readSchoolProfile(raw: unknown): SchoolProfile {
  try {
    if (!raw) return {};
    const once = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // A second parse only happens for legacy double-encoded rows.
    const twice = typeof once === 'string' ? JSON.parse(once) : once;
    return twice && typeof twice === 'object' ? (twice as SchoolProfile) : {};
  } catch {
    return {};
  }
}

/**
 * What a writer hands the database. Returns the object itself, never a string.
 * Named so the fix is a thing rather than a deletion someone later re-adds.
 */
export function writeSchoolProfile(profile: unknown): SchoolProfile {
  if (!profile) return {};
  if (typeof profile === 'string') {
    // Tolerate a caller that already stringified, rather than storing text.
    return readSchoolProfile(profile);
  }
  return profile as SchoolProfile;
}
