import {
  Gamepad2,
  Shuffle,
  Trophy,
  Eye,
  Star,
  HelpCircle,
  TrendingUp,
  Zap,
  Flame,
  RotateCcw,
  Target,
  Award,
  Repeat,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Gamepad2,
  Shuffle,
  Trophy,
  Eye,
  Star,
  HelpCircle,
  TrendingUp,
  Zap,
  Flame,
  RotateCcw,
  Target,
  Award,
  Repeat,
}

export function getLucideIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Star
}
