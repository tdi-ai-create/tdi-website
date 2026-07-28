import type { SwagProduct } from './types';

const IMG = '/images/swag';
const fb = (base: string) => [`${IMG}/${base}-front.webp`, `${IMG}/${base}-back.webp`];
const single = (name: string) => [`${IMG}/${name}.webp`];
const multi = (base: string, count: number) => Array.from({ length: count }, (_, i) => `${IMG}/${base}-${i + 1}.webp`);

const TEE_SIZES = [
  { label: 'S', value: 's' }, { label: 'M', value: 'm' }, { label: 'L', value: 'l' },
  { label: 'XL', value: 'xl' }, { label: '2XL', value: '2xl' }, { label: '3XL', value: '3xl' },
];
const HOODIE_SIZES = TEE_SIZES;
const HAT_SIZES = [{ label: 'One Size', value: 'one-size' }];
const DRESS_SIZES = [
  { label: 'XS', value: 'xs' }, { label: 'S', value: 's' }, { label: 'M', value: 'm' },
  { label: 'L', value: 'l' }, { label: 'XL', value: 'xl' },
];
const PANTS_SIZES = [
  { label: 'S', value: 's' }, { label: 'M', value: 'm' }, { label: 'L', value: 'l' },
  { label: 'XL', value: 'xl' },
];

// ════════════════════════════════════════════════════════════
// CONTRACT HOURS
// ════════════════════════════════════════════════════════════

// Color hex values for dots
const HEX: Record<string, string> = {
  black: '#2D2D2D', blue: '#5B7B9A', green: '#6B8F71', grey: '#9CA3AF', sand: '#C2B280',
  stone: '#B8B0A0', anth: '#4A4A4A', pink: '#D4A0A0',
};

const CONTRACT_SHIRTS: SwagProduct[] = [
  // ── Ask Me (lead: Black) ──
  {
    id: 'ask-me',
    name: 'Ask Me',
    price: 38.00,
    category: 'apparel',
    description: 'Pigment-dyed heavyweight tee',
    blurb: 'The one that starts conversations in the grocery store.',
    images: fb('ask-me-black'),
    colorVariants: [
      { colorName: 'Black', colorHex: HEX.black, images: fb('ask-me-black') },
      { colorName: 'Blue', colorHex: HEX.blue, images: fb('ask-me-blue') },
      { colorName: 'Green', colorHex: HEX.green, images: fb('ask-me-green') },
      { colorName: 'Grey', colorHex: HEX.grey, images: fb('ask-me-grey') },
      { colorName: 'Sand', colorHex: HEX.sand, images: fb('ask-me-sand') },
    ],
    printfulUrl: 'https://tdi.printful.me/product/ask-me-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: TEE_SIZES,
    drop: 'contract-hours',
  },

  // ── Ask the Para (lead: Blue) ──
  {
    id: 'para-ask',
    name: 'Ask the Para',
    price: 33.50,
    category: 'apparel',
    description: 'Vintage fit tee',
    blurb: 'Because they always know.',
    images: fb('para-ask-green'),
    colorVariants: [
      { colorName: 'Black', colorHex: HEX.black, images: fb('para-ask-black') },
      { colorName: 'Blue', colorHex: HEX.blue, images: fb('para-ask-blue') },
      { colorName: 'Green', colorHex: HEX.green, images: fb('para-ask-green') },
      { colorName: 'Grey', colorHex: HEX.grey, images: fb('para-ask-grey') },
      { colorName: 'Sand', colorHex: HEX.sand, images: fb('para-ask-sand') },
    ],
    tag: 'Para Line',
    printfulUrl: 'https://tdi.printful.me/product/para-ask-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: TEE_SIZES,
    drop: 'contract-hours',
  },

  // ── The Staff (lead: Stone) ──
  {
    id: 'staff-tee',
    name: 'The Staff',
    price: 33.50,
    category: 'apparel',
    description: 'Vintage fit tee',
    blurb: 'The title that covers everything.',
    images: fb('staff-tee-blue'),
    colorVariants: [
      { colorName: 'Stone', colorHex: HEX.stone, images: fb('staff-tee-stone') },
      { colorName: 'Grey', colorHex: HEX.grey, images: fb('staff-tee-grey') },
      { colorName: 'Green', colorHex: HEX.green, images: fb('staff-tee-green') },
      { colorName: 'Blue', colorHex: HEX.blue, images: fb('staff-tee-blue') },
      { colorName: 'Black', colorHex: HEX.black, images: fb('staff-tee-black') },
    ],
    printfulUrl: 'https://tdi.printful.me/product/staff-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: TEE_SIZES,
    drop: 'contract-hours',
  },

  // ── The Good Stuff (lead: Green) ──
  {
    id: 'good-stuff',
    name: 'The Good Stuff',
    price: 36.00,
    category: 'apparel',
    description: 'Heather vintage tee',
    blurb: 'For the quiet list of things that should have been obvious.',
    images: single('good-stuff-tee-pink'),
    colorVariants: [
      { colorName: 'Anthracite', colorHex: HEX.anth, images: single('good-stuff-tee-anth') },
      { colorName: 'Blue', colorHex: HEX.blue, images: single('good-stuff-tee-blue') },
      { colorName: 'Green', colorHex: HEX.green, images: single('good-stuff-tee-green') },
      { colorName: 'Pink', colorHex: HEX.pink, images: single('good-stuff-tee-pink') },
      { colorName: 'Grey', colorHex: HEX.grey, images: single('good-stuff-tee-grey') },
      { colorName: 'Sand', colorHex: HEX.sand, images: single('good-stuff-tee-sand') },
    ],
    printfulUrl: 'https://tdi.printful.me/product/the-good-stuff-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: TEE_SIZES,
    drop: 'contract-hours',
  },
];

const CONTRACT_HATS: SwagProduct[] = [
  // ── The Room (4 colors) ──
  ...(['blue', 'red', 'green', 'navy'] as const).map(color => ({
    id: `room-hat-${color}`,
    name: 'The Room',
    colorName: color.charAt(0).toUpperCase() + color.slice(1),
    price: 26.00,
    category: 'hats' as const,
    description: 'Two-tone trucker cap',
    blurb: 'Your room. Your rules.',
    images: fb(`room-hat-${color}`),
    printfulUrl: 'https://tdi.printful.me/product/the-room-otto-trucker-hat',
    variants: HAT_SIZES,
    drop: 'contract-hours' as const,
  })),

  // ── The PA (4 colors) ──
  ...(['red', 'navy', 'blue', 'green'] as const).map(color => ({
    id: `pa-hat-${color}`,
    name: 'The PA',
    colorName: color.charAt(0).toUpperCase() + color.slice(1),
    price: 26.00,
    category: 'hats' as const,
    description: 'Two-tone trucker cap',
    blurb: 'Para pride on the brim.',
    images: fb(`pa-hat-${color}`),
    printfulUrl: 'https://tdi.printful.me/product/the-pa-otto-trucker-hat',
    tag: 'Para Line',
    variants: HAT_SIZES,
    drop: 'contract-hours' as const,
  })),
];

const CONTRACT_DRINKWARE: SwagProduct[] = [
  {
    id: 'good-pens-tumbler',
    name: 'The Good Pens',
    price: 28.00,
    category: 'drinkware' as const,
    description: '20oz insulated tumbler',
    blurb: 'The one you hide in your desk drawer.',
    images: multi('good-pens-tumbler-new', 2),
    printfulUrl: 'https://tdi.printful.me/product/good-pens-tumbler',
    drop: 'contract-hours' as const,
  },
  {
    id: 'best-part-mug',
    name: "Somebody's Best Part",
    price: 18.00,
    category: 'drinkware' as const,
    description: 'Ceramic coffee mug',
    blurb: 'For the mornings when coffee is the personality.',
    images: multi('best-part-mug-new', 3),
    printfulUrl: 'https://tdi.printful.me/product/best-part-mug',
    drop: 'contract-hours' as const,
  },
  // ── The Sleeve (eval tumbler) ──
  {
    id: 'tumbler-eval',
    name: 'The Sleeve',
    price: 28.00,
    category: 'drinkware' as const,
    description: '20oz insulated tumbler',
    blurb: 'Hydration with a point of view.',
    images: multi('tumbler-eval', 3),
    printfulUrl: 'https://tdi.printful.me/product/eval-tumbler',
    drop: 'contract-hours' as const,
  },
];

const CONTRACT_BAGS: SwagProduct[] = [
  {
    id: 'same-team-tote',
    name: 'Same Team',
    price: 22.00,
    category: 'bags' as const,
    description: 'Organic cotton tote',
    blurb: 'Carry the message.',
    images: multi('same-team-tote-new', 3),
    printfulUrl: 'https://tdi.printful.me/product/same-team-tote',
    drop: 'contract-hours' as const,
  },
  {
    id: 'hard-parts-tote',
    name: 'The Hard Parts',
    price: 22.00,
    category: 'bags' as const,
    description: 'Organic cotton tote',
    blurb: 'The bag that gets it.',
    images: multi('hard-parts-tote-new', 3),
    printfulUrl: 'https://tdi.printful.me/product/hard-parts-tote',
    drop: 'contract-hours' as const,
  },
  {
    id: 'eco-tote-tan',
    name: 'The Carry',
    price: 22.00,
    category: 'bags' as const,
    description: 'Eco-friendly tote',
    blurb: 'Simple. Clean. Ready.',
    images: fb('eco-tote-tan'),
    printfulUrl: 'https://tdi.printful.me/product/eco-tote',
    drop: 'contract-hours' as const,
  },
];

const CONTRACT_ACCESSORIES: SwagProduct[] = [
  {
    id: 'notebook-orange',
    name: 'The Notebook',
    price: 16.00,
    category: 'accessories' as const,
    description: 'Hardcover journal',
    blurb: 'Where the real lesson plans live.',
    images: multi('notebook-orange', 4),
    printfulUrl: 'https://tdi.printful.me/product/notebook',
    drop: 'contract-hours' as const,
  },
];

// ════════════════════════════════════════════════════════════
// AFTER HOURS
// ════════════════════════════════════════════════════════════

const AFTER_SHIRTS: SwagProduct[] = [
  // ── Top row: 4 hero products (most visual variety) ──

  // ── The Question Drop (hoodie, lead: Sand) ──
  {
    id: 'questions-hoodie',
    name: 'The Question Drop',
    price: 58.00,
    category: 'apparel' as const,
    description: 'Heavyweight hoodie',
    blurb: 'The hoodie that answers nothing.',
    images: single('questions-hoodie-sand'),
    colorVariants: [
      { colorName: 'Blue', colorHex: '#3B5998', images: [single('questions-hoodie-blue')[0], single('questions-hoodie-blue-back')[0]] },
      { colorName: 'Gray', colorHex: '#9CA3AF', images: single('questions-hoodie-gray') },
      { colorName: 'Sand', colorHex: '#C2B280', images: single('questions-hoodie-sand') },
      { colorName: 'Sage', colorHex: '#87A878', images: single('questions-hoodie-sage') },
    ],
    printfulUrl: 'https://tdi.printful.me/product/questions-hoodie',
    variants: HOODIE_SIZES,
    drop: 'after-hours' as const,
  },

  // ── The Sleepy Dress ──
  {
    id: 'sleepy-dress',
    name: 'The Sleepy Dress',
    price: 42.00,
    category: 'apparel' as const,
    description: 'T-shirt dress',
    blurb: 'From couch to brunch without trying.',
    images: multi('sleepy-dress', 3),
    printfulUrl: 'https://tdi.printful.me/product/sleepy-dress',
    variants: DRESS_SIZES,
    drop: 'after-hours' as const,
  },

  // ── The Binge Watch (shows pants) ──
  {
    id: 'shows-pants',
    name: 'The Binge Watch',
    price: 44.00,
    category: 'apparel' as const,
    description: 'Lounge pants',
    blurb: 'Three more episodes. Minimum.',
    images: fb('shows-pants'),
    printfulUrl: 'https://tdi.printful.me/product/shows-pants',
    variants: PANTS_SIZES,
    drop: 'after-hours' as const,
  },

  // ── The Closed Sign ──
  {
    id: 'closed-tee',
    name: 'The Closed Sign',
    price: 33.50,
    category: 'apparel' as const,
    description: 'Classic fit tee',
    blurb: 'Office hours are over.',
    images: single('closed-tee'),
    printfulUrl: 'https://tdi.printful.me/product/closed-sign-tee',
    variants: TEE_SIZES,
    drop: 'after-hours' as const,
  },

  // ── Row 2: grouped tees ──

  // ── The Inner Thought (lead: Blue) ──
  {
    id: 'thought-tee',
    name: 'The Inner Thought',
    price: 33.50,
    category: 'apparel' as const,
    description: 'Classic fit tee',
    blurb: 'The one you think but never say out loud.',
    images: single('thought-tee-blue'),
    colorVariants: [
      { colorName: 'Black', colorHex: '#2D2D2D', images: single('thought-tee-black') },
      { colorName: 'Blue', colorHex: '#3B5998', images: single('thought-tee-blue') },
      { colorName: 'White', colorHex: '#F5F5F5', images: single('thought-tee-white') },
    ],
    printfulUrl: 'https://tdi.printful.me/product/inner-thought-tee',
    variants: TEE_SIZES,
    drop: 'after-hours' as const,
  },

  // ── The Empty Calendar (lead: Black) ──
  {
    id: 'calendar-tee',
    name: 'The Empty Calendar',
    price: 33.50,
    category: 'apparel' as const,
    description: 'Classic fit tee',
    blurb: 'Nothing on the schedule and proud of it.',
    images: single('calendar-tee-black'),
    colorVariants: [
      { colorName: 'Black', colorHex: '#2D2D2D', images: single('calendar-tee-black') },
      { colorName: 'Blue', colorHex: '#3B5998', images: single('calendar-tee-blue') },
      { colorName: 'White', colorHex: '#F5F5F5', images: single('calendar-tee-white') },
    ],
    printfulUrl: 'https://tdi.printful.me/product/empty-calendar-tee',
    variants: TEE_SIZES,
    drop: 'after-hours' as const,
  },

  // ── The Needed Silence (lead: White) ──
  {
    id: 'silence-tee',
    name: 'The Needed Silence',
    price: 33.50,
    category: 'apparel' as const,
    description: 'Classic fit tee',
    blurb: 'Volume: off.',
    images: single('silence-tee-white'),
    colorVariants: [
      { colorName: 'Black', colorHex: '#2D2D2D', images: single('silence-tee-black') },
      { colorName: 'Blue', colorHex: '#3B5998', images: single('silence-tee-blue') },
      { colorName: 'White', colorHex: '#F5F5F5', images: single('silence-tee-white') },
    ],
    printfulUrl: 'https://tdi.printful.me/product/needed-silence-tee',
    variants: TEE_SIZES,
    drop: 'after-hours' as const,
  },

  // ── The Needed Intermission (knit tee) ──
  {
    id: 'intermission-knit',
    name: 'The Needed Intermission',
    price: 36.00,
    category: 'apparel' as const,
    description: 'Knitted classic tee',
    blurb: 'Halftime for humans.',
    images: single('intermission-knit'),
    printfulUrl: 'https://tdi.printful.me/product/intermission-knitted-classic-tee',
    variants: TEE_SIZES,
    drop: 'after-hours' as const,
  },
];

// ════════════════════════════════════════════════════════════
// STICKERS
// ════════════════════════════════════════════════════════════

const STICKERS: SwagProduct[] = [
  { id: 'same-team-sticker', name: 'Same Team', price: 4.50, category: 'stickers', description: 'Die-cut vinyl sticker', images: ['/images/swag/same-team-sticker-new.png'], printfulUrl: 'https://tdi.printful.me', drop: 'both' as const },
  { id: 'job-varies-sticker', name: 'Job Varies', price: 4.50, category: 'stickers', description: 'Die-cut vinyl sticker', images: ['/images/swag/job-varies-sticker-new.png'], printfulUrl: 'https://tdi.printful.me', drop: 'both' as const },
  { id: 'someone-sticker', name: 'Someone', price: 4.50, category: 'stickers', description: 'Die-cut vinyl sticker', images: ['/images/swag/someone-sticker-new.png'], printfulUrl: 'https://tdi.printful.me', drop: 'both' as const },
  { id: 'tdi-sticker', name: 'TDI', price: 4.50, category: 'stickers', description: 'Die-cut vinyl sticker', images: ['/images/swag/tdi-sticker-new.png'], printfulUrl: 'https://tdi.printful.me', drop: 'both' as const },
  { id: 'glad-sticker', name: 'Glad', price: 4.50, category: 'stickers', description: 'Die-cut vinyl sticker', images: ['/images/swag/glad-sticker-new.png'], printfulUrl: 'https://tdi.printful.me', drop: 'both' as const },
  { id: 'same-team-sticker-lg', name: 'Same Team (Large)', price: 6.00, category: 'stickers', description: 'Large die-cut vinyl sticker', images: multi('same-team-sticker-lg', 2), printfulUrl: 'https://tdi.printful.me', drop: 'both' as const },
  { id: 'intermission-sticker', name: 'The Intermission', price: 4.50, category: 'stickers', description: 'Die-cut vinyl sticker', images: ['/images/swag/intermission-sticker-new.png'], printfulUrl: 'https://tdi.printful.me', drop: 'both' as const },
  { id: 'same-team-magnet', name: 'Same Team (Magnet)', price: 6.00, category: 'stickers', description: 'Refrigerator magnet', blurb: 'For the fridge, the filing cabinet, or the whiteboard.', images: multi('same-team-magnet', 3), printfulUrl: 'https://tdi.printful.me/product/same-team-magnet', drop: 'both' as const },
];

// ════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════

export const SWAG_PRODUCTS: SwagProduct[] = [
  ...CONTRACT_SHIRTS,
  ...CONTRACT_HATS,
  ...CONTRACT_DRINKWARE,
  ...CONTRACT_BAGS,
  ...CONTRACT_ACCESSORIES,
  ...AFTER_SHIRTS,
  ...STICKERS,
];

export function getProductsByDrop(drop: 'contract-hours' | 'after-hours'): SwagProduct[] {
  return SWAG_PRODUCTS.filter(p => p.drop === drop || p.drop === 'both');
}

export function getContractProducts(): { shirts: SwagProduct[]; hats: SwagProduct[]; drinkware: SwagProduct[]; bags: SwagProduct[]; accessories: SwagProduct[] } {
  return {
    shirts: CONTRACT_SHIRTS,
    hats: CONTRACT_HATS,
    drinkware: CONTRACT_DRINKWARE,
    bags: CONTRACT_BAGS,
    accessories: CONTRACT_ACCESSORIES,
  };
}

export function getAfterProducts(): SwagProduct[] {
  return AFTER_SHIRTS;
}

export function getStickers(): SwagProduct[] {
  return STICKERS;
}

export function getProductsByType(drop: 'contract-hours' | 'after-hours'): Record<string, SwagProduct[]> {
  const products = getProductsByDrop(drop).filter(p => p.category !== 'stickers');
  const groups: Record<string, SwagProduct[]> = {};
  for (const p of products) {
    const key = p.category;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return groups;
}
