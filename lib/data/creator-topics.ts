export interface TopicConfig {
  background: string
  border: string
  iconColor: string
  icon: string // Lucide icon name
}

export const TOPIC_MAP: Record<string, TopicConfig> = {
  'Literacy': { background: '#E6F1FB', border: '#B5D4F4', iconColor: '#185FA5', icon: 'BookOpen' },
  'PE & Wellness': { background: '#E1F5EE', border: '#9FE1CB', iconColor: '#0F6E56', icon: 'Activity' },
  'Math': { background: '#FAECE7', border: '#F5C4B3', iconColor: '#993C1D', icon: 'Calculator' },
  'Science': { background: '#FAEEDA', border: '#FAC775', iconColor: '#854F0B', icon: 'FlaskConical' },
  'Art & SEL': { background: '#FBEAF0', border: '#F4C0D1', iconColor: '#993556', icon: 'Palette' },
  'Leadership': { background: '#EEEDFE', border: '#CECBF6', iconColor: '#534AB7', icon: 'GraduationCap' },
}

export const DEFAULT_TOPIC: TopicConfig = {
  background: '#F1F3F5',
  border: '#DEE2E6',
  iconColor: '#495057',
  icon: 'Sparkles',
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
