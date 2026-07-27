export interface SwagProduct {
  id: string;
  name: string;
  price: number;
  category: 'apparel' | 'stickers' | 'drinkware' | 'bags' | 'hats' | 'accessories';
  description: string;
  editorialCopy?: string;
  adminCopy?: string;
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
  // ─── HERO: Ask Me ───
  {
    id: 'ask-me-tee',
    name: 'Ask Me',
    price: 38.00,
    category: 'apparel',
    description: 'Comfort Colors 1717, pigment-dyed',
    editorialCopy: 'Somebody always asks. Then you get to tell them about the six-year-old who explained gravity to you, or the senior who finally turned it in. A soft, heavy tee that starts the conversation teaching deserves.',
    adminCopy: 'This is the one your staff wears out of the building. Give it at the August institute day rather than a folder, and it is still in rotation in April.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-1472-6a67b73d877e0__360'),
    printfulUrl: 'https://tdi.printful.me/product/ask-me-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    tag: 'Hero',
    variants: [
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
    audience: 'both',
  },
  // ─── THE STAFF ORDER: Room ───
  {
    id: 'room-hat',
    name: 'Room',
    price: 32.00,
    category: 'hats',
    description: 'Unstructured dad hat',
    editorialCopy: 'Embroidered with your room. Or the gym, the cart, the library, wherever you actually are. It arrives stitched, not printed.',
    adminCopy: 'The highest-value thing you can hand a staff member for $32: something with their name on it, effectively. Forty different hats still photograph as one team on day one.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-952-6a67b94f7848d__360'),
    printfulUrl: 'https://tdi.printful.me/product/room-5-panel-cap',
    tag: 'Staff Favorite',
    audience: 'for-staff',
  },
  // ─── THE QUIET ONE: The Good Stuff ───
  {
    id: 'good-stuff-tee',
    name: 'The Good Stuff',
    price: 36.00,
    category: 'apparel',
    description: 'Bella+Canvas 3001, Heather Olive',
    editorialCopy: 'A whole lunch. Quiet mornings. The good pens. And a raise. The list is short because it should have been obvious.',
    adminCopy: 'This is the staff-purchase piece, not the district-purchase piece. Point admins at the quarter-zip instead.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-1472-6a67b6bcddcf9__360'),
    printfulUrl: 'https://tdi.printful.me/product/the-good-stuff-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    tag: 'Whisper Piece',
    variants: [
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
    audience: 'for-you',
  },
  // ─── THE IMPULSE: Good Pens ───
  {
    id: 'good-pens-tumbler',
    name: 'Good Pens',
    price: 34.00,
    category: 'drinkware',
    description: '20 oz insulated tumbler, matte Black',
    editorialCopy: 'The good pens live in my desk. And they stay there. Twenty ounces, holds ice through a double period.',
    adminCopy: 'No sizes, no returns, no awkward guessing about anybody\'s body. That makes it the safest bulk gift in the drop. And the one most likely to sit on a desk where students and parents read it all year.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-751-6a67be0e959a1__360'),
    printfulUrl: 'https://tdi.printful.me/product/the-good-pens-clear-plastic-tumbler',
    tag: 'Impulse Buy',
    audience: 'both',
  },
  // ─── THE GIFT: Best Part ───
  {
    id: 'best-part-mug',
    name: "Somebody's Day",
    price: 26.00,
    category: 'drinkware',
    description: 'Black glossy mug, 11oz',
    editorialCopy: 'You are the best part of somebody\'s day. Somebody who is nine, and will remember it at thirty. For the teacher you\'d like to keep.',
    adminCopy: 'This is the retention line item. Twenty-six dollars against the cost of replacing one teacher is not a close call. Unlike a certificate, they keep using it.',
    image: proxyImg('https://cdn.printful.me/t/quick-stores/products/w168/17640463-300-6a67bf5392fa0__360'),
    printfulUrl: 'https://tdi.printful.me/product/best-part-black-glossy-mug',
    tag: 'The Gift',
    audience: 'for-staff',
  },
  // ─── Para Ask ───
  {
    id: 'para-ask-tee',
    name: 'Ask the Para',
    price: 33.50,
    category: 'apparel',
    description: 'Garment-dyed vintage fit',
    editorialCopy: 'Shot differently on purpose: the para pieces are photographed in use, not at rest. Working, not posing, because that\'s the argument.',
    adminCopy: 'A tee and sticker bundle outfits a twelve-person ESP team for under $270 on one PO. Most paras have never been given anything with the district\'s thanks on it.',
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
  // ─── Bags ───
  {
    id: 'hard-parts-tote',
    name: 'Here for the Hard Parts',
    price: 36.50,
    category: 'bags',
    description: 'Organic denim tote',
    editorialCopy: 'The bag that says what the job actually is. Organic denim, built to carry everything you were not trained for.',
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
  // ─── PA Hat ───
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
  // ─── Accessories ───
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
  // ─── Stickers ───
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

export const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'apparel', label: 'Apparel' },
  { key: 'bags', label: 'Bags' },
  { key: 'hats', label: 'Hats' },
  { key: 'drinkware', label: 'Drinkware' },
  { key: 'stickers', label: 'Stickers' },
  { key: 'accessories', label: 'Accessories' },
] as const;

export function getProductsByCategory(category: string): SwagProduct[] {
  if (category === 'all') return SWAG_PRODUCTS;
  return SWAG_PRODUCTS.filter(p => p.category === category);
}
