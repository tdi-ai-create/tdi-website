export interface SwagProduct {
  id: string;
  name: string;
  colorName?: string;
  price: number;
  category: 'apparel' | 'stickers' | 'drinkware' | 'bags' | 'hats' | 'accessories';
  subBand?: string;
  description: string;
  details?: string;
  blurb?: string;
  images: string[];         // [front, back] — 2 images max
  printfulUrl: string;
  tag?: string;
  variants?: { label: string; value: string }[];
  drop: 'contract-hours' | 'after-hours' | 'both';
}

export type World = 'contract-hours' | 'after-hours';

export const SUB_BANDS = {
  'contract-hours': [
    { key: 'the-ask-me-drop', label: 'The Ask Me Drop' },
    { key: 'your-room', label: 'Your Room' },
    { key: 'the-desk', label: 'The Desk' },
    { key: 'the-carry', label: 'The Carry' },
  ],
  'after-hours': [
    { key: 'decompression', label: 'Decompression' },
    { key: 'do-not-disturb', label: 'Do Not Disturb' },
    { key: 'off-duty', label: 'Off Duty' },
  ],
} as const;
