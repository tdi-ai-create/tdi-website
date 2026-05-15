export interface FeaturedTeamMember {
  name: string
  title: string
  description: string
  imageSlug: string
}

export interface SupportingTeamMember {
  name: string
  title: string
  imageSlug: string
}

export const featuredTeam: FeaturedTeamMember[] = [
  { name: 'Rae Hughart', title: 'CEO & Founder', description: 'Educator turned founder, leading TDI\'s mission to serve teachers worldwide.', imageSlug: 'rae-hughart' },
  { name: 'Kristin Williams', title: 'Chief Marketing Officer', description: 'Marketing leader connecting TDI\'s story to educators everywhere.', imageSlug: 'kristin-williams' },
  { name: 'Omar Garcia', title: 'Chief Financial Officer', description: 'Financial strategy keeping TDI sustainable and scaling smart.', imageSlug: 'omar-garcia' },
  { name: 'Jim Ford', title: 'District Outreach', description: 'Connecting schools and districts with the right partnership.', imageSlug: 'jim-ford' },
  { name: 'Bella Daily', title: 'Special Projects Lead', description: 'Driving the work that doesn\'t fit anywhere else and matters most.', imageSlug: 'bella-daily' },
  { name: 'Mel Martinez', title: 'Executive Assistant', description: 'Keeping the leadership team in motion and on track.', imageSlug: 'mel-martinez' },
]

export const supportingTeam: SupportingTeamMember[] = [
  { name: 'Nora Reeves', title: 'COO', imageSlug: 'nora-reeves' },
  { name: 'Amara Obi', title: 'Outreach', imageSlug: 'amara-obi' },
  { name: 'Anne Marie Schmitt', title: 'Outreach', imageSlug: 'anne-marie-schmitt' },
  { name: 'Chris Copypaste', title: 'Engineering', imageSlug: 'chris-copypaste' },
  { name: 'Dr. Jasmine Cole', title: 'Research', imageSlug: 'jasmine-cole' },
  { name: 'Dr. Maya Johnson', title: 'Curriculum', imageSlug: 'maya-johnson' },
  { name: 'Elena Vasquez', title: 'Sales Ops', imageSlug: 'elena-vasquez' },
  { name: 'Holly Scott', title: 'Customer Success', imageSlug: 'holly-scott' },
  { name: 'Izzy Reeves', title: 'Content', imageSlug: 'izzy-reeves' },
  { name: 'Lily Chen', title: 'Design', imageSlug: 'lily-chen' },
  { name: 'Olivia Smith', title: 'Executive Ops', imageSlug: 'olivia-smith' },
  { name: 'Quinn Nakamura', title: 'Product', imageSlug: 'quinn-nakamura' },
  { name: 'Ravi Patel', title: 'Strategy', imageSlug: 'ravi-patel' },
  { name: 'Rodrigo Vega', title: 'Operations', imageSlug: 'rodrigo-vega' },
  { name: 'Sandra Reyes', title: 'Accounting', imageSlug: 'sandra-reyes' },
  { name: 'Sebastian Cole', title: 'Legal', imageSlug: 'sebastian-cole' },
  { name: 'Sophia Castillo', title: 'Sales Prep', imageSlug: 'sophia-castillo' },
  { name: 'Vanessa Thornton', title: 'Sales Enablement', imageSlug: 'vanessa-thornton' },
  { name: 'Victor Nash', title: 'Finance', imageSlug: 'victor-nash' },
  { name: 'Zara Okonkwo', title: 'Social', imageSlug: 'zara-okonkwo' },
]

export function getInitials(name: string): string {
  return name.split(' ').filter(p => !['Dr.'].includes(p)).map(p => p[0]).join('').toUpperCase().slice(0, 2)
}
