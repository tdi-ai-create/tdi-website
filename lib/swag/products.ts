export interface SwagProduct {
  id: string;
  name: string;
  price: number;
  category: 'apparel' | 'stickers' | 'drinkware' | 'bags' | 'hats' | 'accessories';
  collection?: string;
  description: string;
  details?: string;
  blurb?: string;
  images: string[];
  printfulUrl: string;
  tag?: string;
  variants?: { label: string; value: string }[];
  colors?: string[];
  audience: 'for-you' | 'for-staff' | 'both';
}

function imgs(id: string, count: number): string[] {
  const result = [`/images/swag/${id}.webp`];
  for (let i = 1; i <= count; i++) {
    result.push(`/images/swag/${id}-${i}.webp`);
  }
  return result;
}

export const SWAG_PRODUCTS: SwagProduct[] = [
  // ─── The Ask Me Drop ───
  {
    id: 'ask-me-tee',
    name: 'Ask Me',
    price: 38.00,
    category: 'apparel',
    collection: 'The Ask Me Drop',
    description: 'Pigment-dyed heavyweight tee',
    details: '100% organic ring-spun cotton. Relaxed fit with a comfortable drape. Garment-dyed finish with a washed, vintage look. Side-seamed construction.',
    blurb: 'The one that starts conversations in the grocery store.',
    images: imgs('ask-me-tee', 3),
    printfulUrl: 'https://tdi.printful.me/product/ask-me-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: [
      { label: 'S', value: 's' }, { label: 'M', value: 'm' }, { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' }, { label: '2XL', value: '2xl' }, { label: '3XL', value: '3xl' },
    ],
    colors: ['Black Rock', 'Anthracite', 'Deep Teal', 'Green Bay', 'Kaffa Coffee', 'Misty Grey', 'Stone'],
    audience: 'both',
  },
  {
    id: 'para-ask-tee',
    name: 'Ask the Para',
    price: 33.50,
    category: 'apparel',
    collection: 'The Ask Me Drop',
    description: 'Vintage fit tee',
    details: '100% organic ring-spun cotton. Relaxed fit. Garment-dyed finish with a washed, vintage look.',
    blurb: 'Because they always know.',
    images: imgs('para-ask-tee', 3),
    printfulUrl: 'https://tdi.printful.me/product/para-ask-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    tag: 'Para Line',
    variants: [
      { label: 'S', value: 's' }, { label: 'M', value: 'm' }, { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' }, { label: '2XL', value: '2xl' }, { label: '3XL', value: '3xl' },
    ],
    colors: ['Black Rock', 'Anthracite', 'Deep Teal', 'Green Bay', 'Kaffa Coffee', 'Misty Grey', 'Stone'],
    audience: 'both',
  },
  {
    id: 'staff-tee',
    name: 'The Staff',
    price: 33.50,
    category: 'apparel',
    collection: 'The Ask Me Drop',
    description: 'Vintage fit tee',
    details: '100% organic ring-spun cotton. Relaxed fit. Garment-dyed finish with a washed, vintage look.',
    blurb: 'The title that covers everything.',
    images: imgs('staff-tee', 3),
    printfulUrl: 'https://tdi.printful.me/product/staff-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: [
      { label: 'S', value: 's' }, { label: 'M', value: 'm' }, { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' }, { label: '2XL', value: '2xl' }, { label: '3XL', value: '3xl' },
    ],
    colors: ['Black Rock', 'Anthracite', 'Deep Teal', 'Green Bay', 'Kaffa Coffee', 'Misty Grey', 'Stone'],
    audience: 'for-staff',
  },
  // ─── The Good Stuff ───
  {
    id: 'good-stuff-tee',
    name: 'The Good Stuff',
    price: 36.00,
    category: 'apparel',
    collection: 'The Good Stuff',
    description: 'Heather Olive tee',
    details: '100% organic ring-spun cotton. Relaxed fit. Garment-dyed vintage look.',
    blurb: 'For the quiet list of things that should have been obvious.',
    images: imgs('good-stuff-tee', 1),
    printfulUrl: 'https://tdi.printful.me/product/the-good-stuff-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: [
      { label: 'S', value: 's' }, { label: 'M', value: 'm' }, { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' }, { label: '2XL', value: '2xl' }, { label: '3XL', value: '3xl' },
    ],
    colors: ['Black Rock', 'Anthracite', 'Deep Teal', 'Green Bay', 'Kaffa Coffee', 'Misty Grey', 'Stone'],
    audience: 'for-you',
  },
  {
    id: 'good-pens-tumbler',
    name: 'The Good Pens',
    price: 34.00,
    category: 'drinkware',
    collection: 'The Good Stuff',
    description: '20 oz insulated tumbler',
    details: 'Clear acrylic plastic. Double wall-insulated. Comes with plastic straw and screw-on lid. 16 oz capacity.',
    blurb: 'Holds ice through a double period.',
    images: imgs('good-pens-tumbler', 3),
    printfulUrl: 'https://tdi.printful.me/product/the-good-pens-clear-plastic-tumbler',
    audience: 'both',
  },
  {
    id: 'notebook',
    name: 'The Notebook',
    price: 17.50,
    category: 'accessories',
    collection: 'The Good Stuff',
    description: 'Hardcover bound',
    details: 'UltraHyde hardcover. 80 pages of lined, cream-colored paper. Elastic closure, ribbon marker, expandable inner pocket. 5.5" x 8.5".',
    blurb: 'For the plans that actually matter.',
    images: imgs('notebook', 3),
    printfulUrl: 'https://tdi.printful.me/product/hardcover-bound-notebook',
    audience: 'for-you',
  },
  // ─── Same Team ───
  {
    id: 'same-team-tote',
    name: 'Same Team',
    price: 28.00,
    category: 'bags',
    collection: 'Same Team',
    description: 'Eco recycled cotton tote',
    details: '100% certified organic cotton. 16" x 14.5" x 5". Weight limit: 30 lbs. Open main compartment.',
    images: imgs('same-team-tote', 3),
    printfulUrl: 'https://tdi.printful.me/product/same-team-eco-tote-bag',
    audience: 'both',
  },
  {
    id: 'same-team-magnet',
    name: 'Same Team',
    price: 8.00,
    category: 'accessories',
    collection: 'Same Team',
    description: '6" round magnet',
    details: '0.5mm flexible vinyl. Premium matte finish. Magnetic black backing.',
    images: imgs('same-team-magnet', 3),
    printfulUrl: 'https://tdi.printful.me/product/same-team-magnet',
    audience: 'for-you',
  },
  // ─── The Hard Parts ───
  {
    id: 'hard-parts-tote',
    name: 'The Hard Parts',
    price: 36.50,
    category: 'bags',
    collection: 'The Hard Parts',
    description: 'Organic denim tote',
    details: '100% organic cotton denim. 19.6" x 18.1". Weight limit: 30 lbs. Double-stitched top seam. Inside pocket.',
    images: imgs('hard-parts-tote', 3),
    printfulUrl: 'https://tdi.printful.me/product/hard-parts-organic-denim-tote-bag',
    audience: 'for-you',
  },
  {
    id: 'laptop-sleeve',
    name: 'The Sleeve',
    price: 28.00,
    category: 'accessories',
    collection: 'The Hard Parts',
    description: 'Padded laptop sleeve',
    details: '100% neoprene. Resistant to water, oil, and heat. Faux fur interior lining. Padded zipper binding.',
    blurb: 'Protect the thing that holds everything.',
    images: imgs('laptop-sleeve', 3),
    printfulUrl: 'https://tdi.printful.me/product/laptop-sleeve',
    variants: [{ label: '13"', value: '13' }, { label: '15"', value: '15' }],
    audience: 'for-you',
  },
  // ─── Your Space ───
  {
    id: 'room-hat',
    name: 'The Room',
    price: 32.00,
    category: 'hats',
    collection: 'Your Space',
    description: 'Embroidered dad hat',
    details: '65% polyester, 35% cotton. Structured front panel. Adjustable snap closure. Matching fabric undervisor.',
    blurb: 'Stitched, not printed.',
    images: imgs('room-hat', 3),
    printfulUrl: 'https://tdi.printful.me/product/room-5-panel-cap',
    colors: ['Red/Natural', 'Navy/Natural', 'Royal/Natural', 'Dark Green/Natural'],
    audience: 'both',
  },
  {
    id: 'pa-hat',
    name: 'The PA',
    price: 16.00,
    category: 'hats',
    collection: 'Your Space',
    description: '5-panel, adjustable',
    details: '65% polyester, 35% cotton. Structured front panel. Adjustable snap closure.',
    images: imgs('pa-hat', 3),
    printfulUrl: 'https://tdi.printful.me/product/pa-hat-5-panel-cap',
    colors: ['Red/Natural', 'Navy/Natural', 'Royal/Natural', 'Dark Green/Natural'],
    audience: 'for-you',
  },
  // ─── The Gift ───
  {
    id: 'best-part-mug',
    name: "Somebody's Best Part",
    price: 26.00,
    category: 'drinkware',
    collection: 'The Gift',
    description: 'Black glossy mug',
    details: '11oz ceramic mug. Dishwasher and microwave safe.',
    blurb: 'For the teacher you would like to keep.',
    images: imgs('best-part-mug', 3),
    printfulUrl: 'https://tdi.printful.me/product/best-part-black-glossy-mug',
    audience: 'for-staff',
  },
  {
    id: 'eco-tote-new',
    name: 'The Carry',
    price: 30.00,
    category: 'bags',
    collection: 'The Gift',
    description: 'Eco tote bag',
    details: '100% certified organic cotton. 16" x 14.5" x 5". Weight limit: 30 lbs.',
    images: imgs('eco-tote-new', 3),
    printfulUrl: 'https://tdi.printful.me/product/eco-tote-bag',
    audience: 'both',
  },
  {
    id: 'tumbler-new',
    name: 'The Tumbler',
    price: 13.50,
    category: 'drinkware',
    collection: 'The Gift',
    description: 'Clear plastic, 16oz',
    details: 'Clear acrylic plastic. Double wall-insulated. Comes with straw and screw-on lid.',
    blurb: 'See what you are drinking. Stay hydrated.',
    images: imgs('tumbler-new', 3),
    printfulUrl: 'https://tdi.printful.me/product/clear-plastic-tumbler',
    audience: 'both',
  },
  // ─── Stickers ───
  {
    id: 'same-team-sticker-sm',
    name: 'Same Team',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    details: 'High opacity adhesive vinyl. Bubble-free application. Durable.',
    images: imgs('same-team-sticker-sm', 3),
    printfulUrl: 'https://tdi.printful.me/product/same-team-bubble-free-stickers-6a67cb7a75b74',
    variants: [{ label: '3"x3"', value: '3x3' }, { label: '4"x4"', value: '4x4' }],
    audience: 'for-you',
  },
  {
    id: 'job-varies-sticker',
    name: 'Job Varies',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    images: imgs('job-varies-sticker', 3),
    printfulUrl: 'https://tdi.printful.me/product/job-varies-bubble-free-stickers',
    variants: [{ label: '3"x3"', value: '3x3' }, { label: '4"x4"', value: '4x4' }],
    audience: 'for-you',
  },
  {
    id: 'someone-sticker',
    name: 'Someone',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    images: imgs('someone-sticker', 3),
    printfulUrl: 'https://tdi.printful.me/product/someone-bubble-free-stickers',
    variants: [{ label: '3"x3"', value: '3x3' }, { label: '4"x4"', value: '4x4' }],
    audience: 'for-you',
  },
  {
    id: 'tdi-sticker',
    name: 'TDI',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    images: imgs('tdi-sticker', 3),
    printfulUrl: 'https://tdi.printful.me/product/tdi-bubble-free-stickers',
    variants: [{ label: '3"x3"', value: '3x3' }, { label: '4"x4"', value: '4x4' }],
    audience: 'for-you',
  },
  {
    id: 'glad-sticker',
    name: 'Glad',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    images: imgs('glad-sticker', 3),
    printfulUrl: 'https://tdi.printful.me/product/glad-bubble-free-stickers',
    variants: [{ label: '3"x3"', value: '3x3' }, { label: '4"x4"', value: '4x4' }],
    audience: 'for-you',
  },
  {
    id: 'same-team-sticker-lg',
    name: 'Same Team (Large)',
    price: 7.00,
    category: 'stickers',
    description: 'Bubble-free vinyl, large',
    images: imgs('same-team-sticker-lg', 2),
    printfulUrl: 'https://tdi.printful.me/product/same-team-bubble-free-stickers',
    audience: 'for-you',
  },
];

export const COLLECTIONS = [
  { key: 'The Ask Me Drop', description: 'The conversation starters.' },
  { key: 'The Good Stuff', description: 'The quiet desk essentials.' },
  { key: 'Same Team', description: 'We are in this together.' },
  { key: 'The Hard Parts', description: 'Show up anyway.' },
  { key: 'Your Space', description: 'Your room. Your identity.' },
  { key: 'The Gift', description: 'For the teacher you would like to keep.' },
];

export function getProductsByCollection(collection: string): SwagProduct[] {
  return SWAG_PRODUCTS.filter(p => p.collection === collection);
}

export function getProductsByAudience(audience: 'for-you' | 'for-staff'): SwagProduct[] {
  return SWAG_PRODUCTS.filter(p => p.category !== 'stickers' && (p.audience === audience || p.audience === 'both'));
}

export function getStickers(): SwagProduct[] {
  return SWAG_PRODUCTS.filter(p => p.category === 'stickers');
}
