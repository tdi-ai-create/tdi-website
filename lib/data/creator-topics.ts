export interface TopicConfig {
  background: string
  border: string
  iconColor: string
  icon: string // Lucide React component name (PascalCase)
  group: string
}

export const TOPIC_GROUPS = [
  'Core Academic',
  'Whole-Child & Wellness',
  'Classroom Practice',
  'Specialized Roles',
  'Leadership & Systems',
] as const

export const TOPIC_MAP: Record<string, TopicConfig> = {
  // Core Academic
  'Literacy': { background: '#E6F1FB', border: '#B5D4F4', iconColor: '#185FA5', icon: 'BookOpen', group: 'Core Academic' },
  'Writing & Composition': { background: '#FBEAF0', border: '#F4C0D1', iconColor: '#993556', icon: 'PenLine', group: 'Core Academic' },
  'Reading Intervention': { background: '#E6F1FB', border: '#B5D4F4', iconColor: '#185FA5', icon: 'BookMarked', group: 'Core Academic' },
  'Math': { background: '#FAECE7', border: '#F5C4B3', iconColor: '#993C1D', icon: 'Calculator', group: 'Core Academic' },
  'Science': { background: '#FAEEDA', border: '#FAC775', iconColor: '#854F0B', icon: 'FlaskConical', group: 'Core Academic' },
  'Social Studies': { background: '#F1EFE8', border: '#D3D1C7', iconColor: '#5F5E5A', icon: 'Globe', group: 'Core Academic' },
  'World Languages': { background: '#EEEDFE', border: '#CECBF6', iconColor: '#534AB7', icon: 'Languages', group: 'Core Academic' },

  // Whole-Child & Wellness
  'Art & SEL': { background: '#FBEAF0', border: '#F4C0D1', iconColor: '#993556', icon: 'Palette', group: 'Whole-Child & Wellness' },
  'PE & Wellness': { background: '#E1F5EE', border: '#9FE1CB', iconColor: '#0F6E56', icon: 'Activity', group: 'Whole-Child & Wellness' },
  'Mental Health & Trauma-Informed': { background: '#EEEDFE', border: '#CECBF6', iconColor: '#534AB7', icon: 'HeartHandshake', group: 'Whole-Child & Wellness' },
  'Music & Performing Arts': { background: '#FAEEDA', border: '#FAC775', iconColor: '#854F0B', icon: 'Music', group: 'Whole-Child & Wellness' },
  'Library & Media': { background: '#EAF3DE', border: '#C0DD97', iconColor: '#3B6D11', icon: 'Library', group: 'Whole-Child & Wellness' },
  'Counseling & Student Services': { background: '#EEEDFE', border: '#CECBF6', iconColor: '#534AB7', icon: 'HeartPulse', group: 'Whole-Child & Wellness' },

  // Classroom Practice
  'Classroom Management': { background: '#E1F5EE', border: '#9FE1CB', iconColor: '#0F6E56', icon: 'LayoutGrid', group: 'Classroom Practice' },
  'Behavior Management': { background: '#FCEBEB', border: '#F7C1C1', iconColor: '#A32D2D', icon: 'Lightbulb', group: 'Classroom Practice' },
  'Differentiation & UDL': { background: '#E6F1FB', border: '#B5D4F4', iconColor: '#185FA5', icon: 'Route', group: 'Classroom Practice' },
  'Assessment & Grading': { background: '#FAEEDA', border: '#FAC775', iconColor: '#854F0B', icon: 'ClipboardCheck', group: 'Classroom Practice' },
  'Lesson Planning': { background: '#FBEAF0', border: '#F4C0D1', iconColor: '#993556', icon: 'NotebookPen', group: 'Classroom Practice' },
  'Curriculum & Instructional Design': { background: '#EEEDFE', border: '#CECBF6', iconColor: '#534AB7', icon: 'PencilRuler', group: 'Classroom Practice' },

  // Specialized Roles
  'Early Childhood / Pre-K': { background: '#EAF3DE', border: '#C0DD97', iconColor: '#3B6D11', icon: 'Baby', group: 'Specialized Roles' },
  'Special Education': { background: '#EEEDFE', border: '#CECBF6', iconColor: '#534AB7', icon: 'Puzzle', group: 'Specialized Roles' },
  'Bilingual & ESL': { background: '#E6F1FB', border: '#B5D4F4', iconColor: '#185FA5', icon: 'MessagesSquare', group: 'Specialized Roles' },
  'Gifted & Talented': { background: '#FAEEDA', border: '#FAC775', iconColor: '#854F0B', icon: 'Star', group: 'Specialized Roles' },
  'Para-Educator Support': { background: '#E1F5EE', border: '#9FE1CB', iconColor: '#0F6E56', icon: 'Users', group: 'Specialized Roles' },
  'New Teacher Support': { background: '#FAECE7', border: '#F5C4B3', iconColor: '#993C1D', icon: 'Sprout', group: 'Specialized Roles' },
  'Substitute & Guest Teacher Support': { background: '#F1EFE8', border: '#D3D1C7', iconColor: '#5F5E5A', icon: 'Clock', group: 'Specialized Roles' },

  // Leadership & Systems
  'Leadership & Admin': { background: '#EEEDFE', border: '#CECBF6', iconColor: '#534AB7', icon: 'GraduationCap', group: 'Leadership & Systems' },
  'Coaching & PD Design': { background: '#E6F1FB', border: '#B5D4F4', iconColor: '#185FA5', icon: 'Target', group: 'Leadership & Systems' },
  'Family & Community': { background: '#FBEAF0', border: '#F4C0D1', iconColor: '#993556', icon: 'HomeIcon', group: 'Leadership & Systems' },
  'EdTech Integration': { background: '#F1EFE8', border: '#D3D1C7', iconColor: '#5F5E5A', icon: 'Laptop', group: 'Leadership & Systems' },
  'Equity & Inclusion': { background: '#FAECE7', border: '#F5C4B3', iconColor: '#993C1D', icon: 'Scale', group: 'Leadership & Systems' },
}

export const DEFAULT_TOPIC: TopicConfig = {
  background: '#F1F3F5',
  border: '#DEE2E6',
  iconColor: '#495057',
  icon: 'Sparkles',
  group: 'Core Academic',
}

export function getTopicConfig(topic: string | null | undefined): TopicConfig {
  if (!topic) return DEFAULT_TOPIC
  const config = TOPIC_MAP[topic]
  if (!config) {
    console.warn(`[creator-topics] Unmapped topic: "${topic}"`)
    return DEFAULT_TOPIC
  }
  return config
}

export function getAllTopics(): string[] {
  return Object.keys(TOPIC_MAP)
}

export function getTopicsByGroup(): Record<string, string[]> {
  const grouped: Record<string, string[]> = {}
  for (const [name, config] of Object.entries(TOPIC_MAP)) {
    if (!grouped[config.group]) grouped[config.group] = []
    grouped[config.group].push(name)
  }
  return grouped
}
