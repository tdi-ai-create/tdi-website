export interface FeaturedTeamMember {
  name: string
  title: string
  description: string
  imageSlug: string
}

export interface TeamMember {
  name: string
  title: string
  imageSlug: string
  isHuman: boolean
}

export const founder: FeaturedTeamMember = {
  name: 'Rae Hughart',
  title: 'CEO & Founder',
  description: 'I started Teachers Deserve It because I watched too many incredible educators burn out alone. We\'re building something different here. A team and a community that gives teachers what they actually need to thrive.',
  imageSlug: 'rae-hughart',
}

export const leadership: FeaturedTeamMember[] = [
  { name: 'Kristin Williams', title: 'Chief Marketing Officer', description: 'Marketing leader connecting TDI\'s story to educators everywhere.', imageSlug: 'kristin-williams' },
  { name: 'Omar Garcia', title: 'Chief Financial Officer', description: 'Financial strategy keeping TDI sustainable and scaling smart.', imageSlug: 'omar-garcia' },
]

export const team: TeamMember[] = [
  { name: 'Jim Ford', title: 'District Outreach', imageSlug: 'jim-ford', isHuman: true },
  { name: 'Bella Dailey', title: 'Special Projects Lead', imageSlug: 'bella-dailey', isHuman: true },
  { name: 'Mel Martinez', title: 'Executive Assistant', imageSlug: 'mel-martinez', isHuman: true },
  { name: 'Holly Scott', title: 'Customer Success', imageSlug: 'holly-scott', isHuman: false },
  { name: 'Olivia Smith', title: 'Executive Ops', imageSlug: 'olivia-smith', isHuman: false },
  { name: 'Anne Marie Schmitt', title: 'Creator Studio Support Team', imageSlug: 'anne-marie-schmitt', isHuman: false },
  { name: 'Vanessa Thornton', title: 'Grant Writing Support Team', imageSlug: 'vanessa-thornton', isHuman: false },
  { name: 'Amara Obi', title: 'Grant Writing Support Team', imageSlug: 'amara-obi', isHuman: false },
  { name: 'Dr. Maya Johnson', title: 'Curriculum', imageSlug: 'maya-johnson', isHuman: false },
  { name: 'Dr. Jasmine Cole', title: 'Research', imageSlug: 'jasmine-cole', isHuman: false },
  { name: 'Izzy Reeves', title: 'Content', imageSlug: 'izzy-reeves', isHuman: false },
  { name: 'Zara Okonkwo', title: 'Social', imageSlug: 'zara-okonkwo', isHuman: false },
  { name: 'Lily Chen', title: 'Design', imageSlug: 'lily-chen', isHuman: false },
  { name: 'Quinn Nakamura', title: 'Product', imageSlug: 'quinn-nakamura', isHuman: false },
  { name: 'Rodrigo Vega', title: 'Data & Analytics', imageSlug: 'rodrigo-vega', isHuman: false },
  { name: 'Sebastian Cole', title: 'Legal', imageSlug: 'sebastian-cole', isHuman: false },
  { name: 'Sandra Reyes', title: 'Accounting', imageSlug: 'sandra-reyes', isHuman: false },
  { name: 'Victor Nash', title: 'Finance', imageSlug: 'victor-nash', isHuman: false },
  { name: 'Chris Copypaste', title: 'Engineering', imageSlug: 'chris-copypaste', isHuman: false },
  { name: 'Elena Vasquez', title: 'Sales Ops', imageSlug: 'elena-vasquez', isHuman: false },
  { name: 'Sophia Castillo', title: 'Sales Prep', imageSlug: 'sophia-castillo', isHuman: false },
  { name: 'Nora Reeves', title: 'COO', imageSlug: 'nora-reeves', isHuman: false },
  { name: 'Ravi Patel', title: 'Strategy', imageSlug: 'ravi-patel', isHuman: false },
]

// Backwards compat - keep these exports so other files don't break
export const featuredTeam = [founder, ...leadership]
export const supportingTeam = team

export function getInitials(name: string): string {
  return name.split(' ').filter(p => !['Dr.'].includes(p)).map(p => p[0]).join('').toUpperCase().slice(0, 2)
}
