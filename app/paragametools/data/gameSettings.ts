// ── Game Settings Types ────────────────────────────────────────────────
// Shared across all games for difficulty, grade band, and role filtering.

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
export type GradeBand = 'k-2' | '3-5' | '6-8' | '9-12' | 'all'
export type EducatorRole = 'teacher' | 'para' | 'coach' | 'leader' | 'all'

export interface GameSettings {
  difficulty: Difficulty | 'all'
  gradeBand: GradeBand
  role: EducatorRole
}

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'all',
  gradeBand: 'all',
  role: 'all',
}

export const DIFFICULTY_CONFIG: {
  value: Difficulty | 'all'
  label: { en: string; es: string }
  description: { en: string; es: string }
  accent: string
}[] = [
  {
    value: 'all',
    label: { en: 'All Levels', es: 'Todos los niveles' },
    description: { en: 'Mix of everything', es: 'Mezcla de todo' },
    accent: '#7C9CBF',
  },
  {
    value: 'easy',
    label: { en: 'Warm Up', es: 'Calentamiento' },
    description: { en: 'Clear-cut scenarios', es: 'Escenarios claros' },
    accent: '#27AE60',
  },
  {
    value: 'medium',
    label: { en: 'Game On', es: 'A jugar' },
    description: { en: 'Requires some nuance', es: 'Requiere algo de matiz' },
    accent: '#F1C40F',
  },
  {
    value: 'hard',
    label: { en: 'Challenge', es: 'Desafio' },
    description: { en: 'Ambiguous, tricky calls', es: 'Llamadas ambiguas y complicadas' },
    accent: '#E74C3C',
  },
  {
    value: 'expert',
    label: { en: 'Expert', es: 'Experto' },
    description: { en: 'Real gray areas, no easy answers', es: 'Zonas grises reales, sin respuestas faciles' },
    accent: '#9333EA',
  },
]

export const GRADE_BAND_CONFIG: {
  value: GradeBand
  label: { en: string; es: string }
}[] = [
  { value: 'all', label: { en: 'All Grades', es: 'Todos los grados' } },
  { value: 'k-2', label: { en: 'K-2', es: 'K-2' } },
  { value: '3-5', label: { en: '3-5', es: '3-5' } },
  { value: '6-8', label: { en: '6-8', es: '6-8' } },
  { value: '9-12', label: { en: '9-12', es: '9-12' } },
]

export const ROLE_CONFIG: {
  value: EducatorRole
  label: { en: string; es: string }
}[] = [
  { value: 'all', label: { en: 'Any Role', es: 'Cualquier rol' } },
  { value: 'teacher', label: { en: 'Teacher', es: 'Maestro/a' } },
  { value: 'para', label: { en: 'Paraprofessional', es: 'Paraprofesional' } },
  { value: 'coach', label: { en: 'Coach', es: 'Coach' } },
  { value: 'leader', label: { en: 'School Leader', es: 'Lider escolar' } },
]

// ── Filtering ──────────────────────────────────────────────────────────

export interface TaggedItem {
  difficulty?: Difficulty
  gradeBand?: GradeBand | GradeBand[]
  roles?: EducatorRole | EducatorRole[]
}

/**
 * Filters items based on game settings.
 * Items without tags pass all filters (backwards-compatible).
 */
export function filterBySettings<T extends TaggedItem>(
  items: T[],
  settings: GameSettings
): T[] {
  return items.filter((item) => {
    // Difficulty filter
    if (settings.difficulty !== 'all' && item.difficulty && item.difficulty !== settings.difficulty) {
      return false
    }

    // Grade band filter
    if (settings.gradeBand !== 'all' && item.gradeBand) {
      const bands = Array.isArray(item.gradeBand) ? item.gradeBand : [item.gradeBand]
      if (!bands.includes('all') && !bands.includes(settings.gradeBand)) {
        return false
      }
    }

    // Role filter
    if (settings.role !== 'all' && item.roles) {
      const roles = Array.isArray(item.roles) ? item.roles : [item.roles]
      if (!roles.includes('all') && !roles.includes(settings.role)) {
        return false
      }
    }

    return true
  })
}
