export interface SwagProduct {
  id: string;
  name: string;
  price: number;
  category: 'apparel' | 'stickers' | 'drinkware' | 'bags' | 'hats' | 'accessories';
  description: string;
  blurb?: string;
  image: string;
  printfulUrl: string;
  tag?: string;
  variants?: { label: string; value: string }[];
  audience: 'for-you' | 'for-staff' | 'both';
}

function proxyImg(cdnUrl: string): string {
  return `/api/swag/image?url=${encodeURIComponent(cdnUrl)}`;
}

export const SWAG_PRODUCTS: SwagProduct[] = [
  {
    id: 'ask-me-tee',
    name: 'Ask Me',
    price: 38.00,
    category: 'apparel',
    description: 'Pigment-dyed heavyweight tee',
    blurb: 'The one that starts conversations in the grocery store.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-1472-6a67b73d877e0__360'),
    printfulUrl: 'https://tdi.printful.me/product/ask-me-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: [
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
    audience: 'both',
  },
  {
    id: 'room-hat',
    name: 'Room',
    price: 32.00,
    category: 'hats',
    description: 'Embroidered dad hat',
    blurb: 'Stitched, not printed.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-952-6a67b94f7848d__360'),
    printfulUrl: 'https://tdi.printful.me/product/room-5-panel-cap',
    audience: 'both',
  },
  {
    id: 'good-stuff-tee',
    name: 'The Good Stuff',
    price: 36.00,
    category: 'apparel',
    description: 'Heather Olive tee',
    blurb: 'For the quiet list of things that should have been obvious.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-1472-6a67b6bcddcf9__360'),
    printfulUrl: 'https://tdi.printful.me/product/the-good-stuff-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: [
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
    audience: 'for-you',
  },
  {
    id: 'good-pens-tumbler',
    name: 'Good Pens',
    price: 34.00,
    category: 'drinkware',
    description: '20 oz insulated tumbler',
    blurb: 'Holds ice through a double period.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-751-6a67be0e959a1__360'),
    printfulUrl: 'https://tdi.printful.me/product/the-good-pens-clear-plastic-tumbler',
    audience: 'both',
  },
  {
    id: 'best-part-mug',
    name: "Somebody's Day",
    price: 26.00,
    category: 'drinkware',
    description: 'Black glossy mug, 11oz',
    blurb: 'For the teacher you would like to keep.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-300-6a67bf5392fa0__360'),
    printfulUrl: 'https://tdi.printful.me/product/best-part-black-glossy-mug',
    audience: 'for-staff',
  },
  {
    id: 'para-ask-tee',
    name: 'Ask the Para',
    price: 33.50,
    category: 'apparel',
    description: 'Vintage fit tee',
    blurb: 'Because they always know.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-1472-6a67c695854d0__360'),
    printfulUrl: 'https://tdi.printful.me/product/para-ask-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    tag: 'Para Line',
    variants: [
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
    audience: 'both',
  },
  {
    id: 'hard-parts-tote',
    name: 'Here for the Hard Parts',
    price: 36.50,
    category: 'bags',
    description: 'Organic denim tote',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-528-6a67c78cf27c4__360'),
    printfulUrl: 'https://tdi.printful.me/product/hard-parts-organic-denim-tote-bag',
    audience: 'for-you',
  },
  {
    id: 'same-team-tote',
    name: 'Same Team Tote',
    price: 28.00,
    category: 'bags',
    description: 'Eco recycled cotton',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-367-6a67c9355d6d7__360'),
    printfulUrl: 'https://tdi.printful.me/product/same-team-eco-tote-bag',
    audience: 'both',
  },
  {
    id: 'pa-hat',
    name: 'PA Cap',
    price: 16.00,
    category: 'hats',
    description: '5-panel, adjustable',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/75807-952-6a67c994502cb__360'),
    printfulUrl: 'https://tdi.printful.me/product/pa-hat-5-panel-cap',
    audience: 'for-you',
  },
  {
    id: 'same-team-magnet',
    name: 'Same Team Magnet',
    price: 8.00,
    category: 'accessories',
    description: 'Round magnet',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-656-6a67ca6cda97e__360'),
    printfulUrl: 'https://tdi.printful.me/product/same-team-magnet',
    audience: 'for-you',
  },
  {
    id: 'same-team-sticker-sm',
    name: 'Same Team',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-358-6a67cb7a20467__360'),
    printfulUrl: 'https://tdi.printful.me/product/same-team-bubble-free-stickers-6a67cb7a75b74',
    audience: 'for-you',
  },
  {
    id: 'job-varies-sticker',
    name: 'Job Varies',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-358-6a67cb2bea792__360'),
    printfulUrl: 'https://tdi.printful.me/product/job-varies-bubble-free-stickers',
    audience: 'for-you',
  },
  {
    id: 'someone-sticker',
    name: 'Someone',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-358-6a67c1cfd504b__360'),
    printfulUrl: 'https://tdi.printful.me/product/someone-bubble-free-stickers',
    audience: 'for-you',
  },
  {
    id: 'tdi-sticker',
    name: 'TDI',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-358-6a67c0fab1dcc__360'),
    printfulUrl: 'https://tdi.printful.me/product/tdi-bubble-free-stickers',
    audience: 'for-you',
  },
  {
    id: 'glad-sticker',
    name: 'Glad',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-358-6a67c05ebd588__360'),
    printfulUrl: 'https://tdi.printful.me/product/glad-bubble-free-stickers',
    audience: 'for-you',
  },
  {
    id: 'same-team-sticker-lg',
    name: 'Same Team (Large)',
    price: 7.00,
    category: 'stickers',
    description: 'Bubble-free vinyl, large',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-358-6a67ca02938cc__360'),
    printfulUrl: 'https://tdi.printful.me/product/same-team-bubble-free-stickers',
    audience: 'for-you',
  },
];

export function getProductsByAudience(audience: 'for-you' | 'for-staff'): SwagProduct[] {
  return SWAG_PRODUCTS.filter(p => p.category !== 'stickers' && (p.audience === audience || p.audience === 'both'));
}

export function getStickers(): SwagProduct[] {
  return SWAG_PRODUCTS.filter(p => p.category === 'stickers');
}
