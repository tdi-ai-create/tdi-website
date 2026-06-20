export type Semester = 'fall' | 'spring' | 'out_of_session';

export interface SchoolYear {
  start: Date;
  end: Date;
}

export function currentSemester(date: Date, schoolYear: SchoolYear): Semester {
  const t = date.getTime();
  const s = schoolYear.start.getTime();
  const e = schoolYear.end.getTime();
  if (t < s || t > e) return 'out_of_session';
  const midpoint = s + (e - s) / 2;
  return t < midpoint ? 'fall' : 'spring';
}
