export interface FeaturedTeamMember {
  name: string
  title: string
  description: string
  imageSlug: string
}

export interface SupportingTeamMember {
  name: string
  title: string
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
  { name: 'Nora Reeves', title: 'COO' },
  { name: 'Amara Obi', title: 'Outreach' },
  { name: 'Anne Marie Schmitt', title: 'Outreach' },
  { name: 'Chris Copypaste', title: 'Engineering' },
  { name: 'Dr. Jasmine Cole', title: 'Research' },
  { name: 'Dr. Maya Johnson', title: 'Curriculum' },
  { name: 'Elena Vasquez', title: 'Sales Ops' },
  { name: 'Holly Scott', title: 'Customer Success' },
  { name: 'Izzy Reeves', title: 'Content' },
  { name: 'Lily Chen', title: 'Design' },
  { name: 'Olivia Smith', title: 'Executive Ops' },
  { name: 'Quinn Nakamura', title: 'Product' },
  { name: 'Ravi Patel', title: 'Strategy' },
  { name: 'Rodrigo Vega', title: 'Operations' },
  { name: 'Sandra Reyes', title: 'Accounting' },
  { name: 'Sebastian Cole', title: 'Legal' },
  { name: 'Sophia Castillo', title: 'Sales Prep' },
  { name: 'Vanessa Thornton', title: 'Sales Enablement' },
  { name: 'Victor Nash', title: 'Finance' },
  { name: 'Zara Okonkwo', title: 'Social' },
]

export function getInitials(name: string): string {
  return name.split(' ').filter(p => !['Dr.'].includes(p)).map(p => p[0]).join('').toUpperCase().slice(0, 2)
}
