/**
 * What a school is told about how each of its goals is measured, and what
 * sharper measurement is available to them.
 *
 * Every field the "how" half reads was already being written. `benchmark_label`
 * carries a careful explanation of the instrument behind each goal, and it has
 * never been rendered anywhere a partner can see it. The goal cards showed a
 * ring, a number and a label truncated at 25 characters, so a principal looking
 * at "Confidence managing cla..." had no way to learn what produced the number.
 *
 * The second half is the asterisk. A goal is only as good as the instrument
 * behind it, and the instrument depends on what the school actually bought. A
 * Hub only partnership is measured by asking teachers; a partnership with
 * observation days is measured by watching classrooms. Saying so plainly is
 * honest, and it is also the moment a school that wants a sharper answer finds
 * out one exists.
 *
 * Two rules this file exists to enforce, because both are easy to break by
 * accident once this text is generated rather than written by hand:
 *
 *   1. No prices. Offering prices are internal. The page carries one starting
 *      figure for the whole of TDI and nothing per offering, and no price goes
 *      in the body of anything client facing. The call to action here is a
 *      conversation.
 *   2. Never a hard sell on a goal that is going well. The asterisk is framed
 *      as what we cannot see, which is information the school is owed whether
 *      or not they ever buy anything.
 */

/** The school facing lineup. Names only, never prices. */
export type Offering = 'pulse' | 'focus' | 'cohort' | 'blueprint';

export interface GoalMeasurementInput {
  kpi_key?: string | null;
  kpi_label?: string | null;
  /** Explanation of the instrument. Written per goal. */
  benchmark_label?: string | null;
  /** Where the number comes from. Falls back to this when no benchmark label. */
  data_source?: string | null;
  /** Per goal override for the asterisk body. Null means derive it. */
  deeper_measurement?: string | null;
  /** Per goal override for which offering to point at. Null means derive it. */
  suggested_offering?: Offering | null;
}

export interface ContractShape {
  observation_days_total?: number | null;
  virtual_sessions_total?: number | null;
  executive_sessions_total?: number | null;
}

export interface GoalMeasurement {
  /** How this goal is measured. Null when nothing was ever written. */
  how: string | null;
  /** Heading above the asterisk. */
  deeperHeading: string;
  /** The honest statement of what the current instrument cannot see. */
  deeper: string;
  /** Which offering answers that gap, and one line on why. Null if none fits. */
  offer: { name: string; why: string; href: string } | null;
}

/**
 * Copy per offering. Describes what it would add to a school that already has
 * the Hub, rather than restating the sales page.
 *
 * Each carries a deep link to its own card on /for-schools. A leader reading a
 * tooltip at 9pm should be able to go and read the whole thing themselves
 * without having to raise their hand with us first, which is also why there is
 * no price here and no "request a quote" framing. The page they land on offers
 * that when they are ready.
 */
const OFFERINGS: Record<Offering, { name: string; why: string; href: string }> = {
  pulse: {
    name: 'The Pulse',
    why: 'Weekly three second check ins on mood, energy, belonging, purpose and needs, with a monthly read on what is actually happening. It turns a goal you survey twice a year into one you can watch, and it never names an individual.',
    href: '/for-schools#pulse',
  },
  focus: {
    name: 'The Focus',
    why: 'Thirteen ready built tools across the year, one every three weeks, with two leadership sessions and implementation tracking. It is the answer when the goal is not knowledge but having something practical in hand on a Monday.',
    href: '/for-schools#focus',
  },
  cohort: {
    name: 'The Cohort',
    why: 'Four virtual sessions built around a named group of ten to fifteen staff, for the people carrying the most and getting the least. Use it when a goal belongs to one group rather than the whole building.',
    href: '/for-schools#cohort',
  },
  blueprint: {
    name: 'The Blueprint',
    why: 'Classroom observations while students are present, leadership coaching and vibe check surveys together. It is the only way to measure practice by seeing it rather than asking about it.',
    href: '/for-schools#blueprint',
  },
};

/**
 * Which offering answers the gap in a goal's measurement.
 *
 * Ordered by what is missing, not by price. A school with no one in its
 * buildings is pointed at seeing, a school that already has visits is pointed
 * at the thing between visits.
 */
export function suggestOffering(
  kpi: GoalMeasurementInput,
  contract: ContractShape | null | undefined
): Offering | null {
  if (kpi.suggested_offering) return kpi.suggested_offering;

  const text = `${kpi.kpi_key ?? ''} ${kpi.kpi_label ?? ''} ${kpi.data_source ?? ''}`.toLowerCase();
  const observationDays = contract?.observation_days_total ?? 0;

  // A goal about one named group is a Cohort question regardless of contract.
  if (/\bpara|paraprofessional|new teacher|first year|specialist|interventionist\b/.test(text)) {
    return 'cohort';
  }

  // Already observed. The gap is between the visits, not the absence of them.
  if (observationDays > 0) return 'focus';

  // Nobody is in the building. What the goal measures decides which gap bites.
  //
  // A goal resting on how people feel or how confident they are is measured by
  // asking, and the weakness of asking twice a year is the frequency. That is
  // the Pulse. A goal about strategies being used is measured by whether
  // anyone had something usable to hand, which is the Focus. Anything about
  // practice that we would rather see than ask about points at observation.
  if (/confiden|wellbeing|well being|wellness|stress|morale|retention|belonging|vibe/.test(text)) {
    return 'pulse';
  }
  if (/strateg|practice|implement|tried|applied|lesson|assessment|instruction|engagement/.test(text)) {
    return 'focus';
  }
  return 'blueprint';
}

const NO_VISITS =
  'This goal is measured by asking your team rather than by watching a classroom, because nobody from our side is in your building this year. That is an honest limit of the plan you have, not a problem with the goal.';

const HAS_VISITS =
  'This goal is measured by what we see in your classrooms, which is the strongest evidence available. What it cannot show is what happens in the weeks between visits.';

const VIRTUAL_ONLY =
  'This goal is measured through what your team reports and what they do in the Hub. Virtual sessions reach them, but nobody is in the room to see whether it held.';

export function deeperMeasurementFor(contract: ContractShape | null | undefined): {
  text: string;
  heading: string;
} {
  // Observation days are counted separately from sessions on purpose. An
  // executive session is leadership time and never produces classroom
  // evidence, so a partnership carrying only executive sessions is still, for
  // measurement purposes, a school nobody observes.
  const observationDays = contract?.observation_days_total ?? 0;
  const virtualSessions = contract?.virtual_sessions_total ?? 0;

  if (observationDays > 0) {
    return { text: HAS_VISITS, heading: 'What this does not show' };
  }
  if (virtualSessions > 0) {
    return { text: VIRTUAL_ONLY, heading: 'What this does not show' };
  }
  return { text: NO_VISITS, heading: 'What this does not show' };
}

export function goalMeasurement(
  kpi: GoalMeasurementInput,
  contract: ContractShape | null | undefined
): GoalMeasurement {
  const derived = deeperMeasurementFor(contract);
  const override = kpi.deeper_measurement?.trim();
  const offering = suggestOffering(kpi, contract);

  return {
    how: kpi.benchmark_label?.trim() || kpi.data_source?.trim() || null,
    deeperHeading: derived.heading,
    deeper: override || derived.text,
    offer: offering ? OFFERINGS[offering] : null,
  };
}

/**
 * How a goal's ring should render.
 *
 * The old maths was `target > 0 ? current / target : 0`, so a goal whose target
 * is deliberately not set yet drew an empty ring reading 0%. Four of those in a
 * row reads as a school failing at everything, when it actually means we have
 * not measured them yet. Rae's rule is that no school facing block renders a
 * zero it cannot justify, and that an empty block names what would fill it.
 */
export function goalProgress(kpi: {
  current_value?: number | null;
  target_value?: number | null;
  target_unit?: string | null;
}): { pct: number; display: string; awaitingBaseline: boolean } {
  const target = Number(kpi.target_value ?? 0);
  const unit = kpi.target_unit ?? '';

  // Null and zero mean different things and the card must not flatten them.
  // Null is "nobody has measured this yet", which is the honest state of a
  // goal whose baseline is still being collected. Zero is a real measurement
  // that happens to be zero, which a school is entitled to see as zero. The
  // old code coalesced null to 0 and rendered both as failure.
  const neverMeasured = kpi.current_value === null || kpi.current_value === undefined;

  if (!(target > 0) || neverMeasured) {
    return { pct: 0, display: 'Soon', awaitingBaseline: true };
  }

  const current = Number(kpi.current_value);
  return {
    pct: Math.min((current / target) * 100, 100),
    display: `${current}${unit}`,
    awaitingBaseline: false,
  };
}
