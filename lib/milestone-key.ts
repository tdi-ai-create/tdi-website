// ---------------------------------------------------------------------------
// Which identifier is this.
//
// creator_milestones.id is a uuid. milestones.id is a text key like
// "assets_submitted". Both are typed `string`, so TypeScript cannot tell them
// apart, and on 31 August the admin creator page started sending the first
// where the routes expect the second.
//
// Every write button on that page broke: Approve, Request changes, Mark
// complete. The route looked up a uuid in a table keyed by text, found nothing,
// and answered "Milestone not found". The page then threw before reading the
// body, so Bella saw "Error approving milestone." with no reason at all. It
// stayed broken for eight days and was found by her, not by us.
//
// Nothing static catches it, because both are strings and the caller and the
// route live in different files. So it gets caught at runtime instead, and the
// error says which mistake was made rather than describing the symptom.
// ---------------------------------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True when this looks like a creator_milestones row id rather than a step key. */
export function looksLikeRecordId(value: unknown): boolean {
  return typeof value === 'string' && UUID.test(value.trim());
}

/**
 * The message a person should see when the wrong identifier arrives.
 *
 * Written for whoever is looking at the screen, not for the log. "Milestone not
 * found" sent Bella hunting for a missing milestone that was never missing.
 */
export function wrongIdentifierMessage(route: string): string {
  return (
    `This step could not be identified. The page sent a row id where ${route} expects ` +
    `a step key such as "assets_submitted". The step itself is fine; the button is ` +
    `passing the wrong field. Please report this rather than retrying, it will not fix itself.`
  );
}
