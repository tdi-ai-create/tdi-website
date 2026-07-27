export interface SwagProduct {
  id: string;
  name: string;
  price: number;
  category: 'apparel' | 'stickers' | 'drinkware' | 'bags' | 'hats' | 'accessories';
  description: string;
  image: string;
  printfulUrl: string;
  tag?: string;
  variants?: { label: string; value: string }[];
}

export const SWAG_PRODUCTS: SwagProduct[] = [
  // Apparel
  {
    id: 'para-ask-tee',
    name: 'Para Ask Tee',
    price: 33.50,
    category: 'apparel',
    description: 'Garment-dyed vintage fit',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-1472-6a67c695854d0__600',
    printfulUrl: 'https://tdi.printful.me/product/para-ask-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    tag: 'Vintage Wash',
    variants: [
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
  },
  {
    id: 'ask-me-tee',
    name: 'Ask Me Tee',
    price: 33.50,
    category: 'apparel',
    description: 'Garment-dyed vintage fit',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-1472-6a67b73d877e0__600',
    printfulUrl: 'https://tdi.printful.me/product/ask-me-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    tag: 'Vintage Wash',
    variants: [
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
  },
  {
    id: 'good-stuff-tee',
    name: 'The Good Stuff Tee',
    price: 26.00,
    category: 'apparel',
    description: 'Garment-dyed vintage fit',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-1472-6a67b6bcddcf9__600',
    printfulUrl: 'https://tdi.printful.me/product/the-good-stuff-unisex-garment-dyed-creator-20-vintage-t-shirt-stanleystella-satu041',
    variants: [
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
  },
  // Bags
  {
    id: 'hard-parts-tote',
    name: 'Hard Parts Denim Tote',
    price: 36.50,
    category: 'bags',
    description: 'Organic denim',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-528-6a67c78cf27c4__600',
    printfulUrl: 'https://tdi.printful.me/product/hard-parts-organic-denim-tote-bag',
  },
  {
    id: 'same-team-tote',
    name: 'Same Team Eco Tote',
    price: 28.00,
    category: 'bags',
    description: 'Recycled cotton',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-367-6a67c9355d6d7__600',
    printfulUrl: 'https://tdi.printful.me/product/same-team-eco-tote-bag',
  },
  // Hats
  {
    id: 'pa-hat',
    name: 'PA Hat 5-Panel',
    price: 16.00,
    category: 'hats',
    description: 'Adjustable',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/75807-952-6a67c994502cb__600',
    printfulUrl: 'https://tdi.printful.me/product/pa-hat-5-panel-cap',
  },
  {
    id: 'room-hat',
    name: 'Room 214 Cap',
    price: 16.00,
    category: 'hats',
    description: 'Adjustable 5-panel',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-952-6a67b94f7848d__600',
    printfulUrl: 'https://tdi.printful.me/product/room-5-panel-cap',
  },
  // Drinkware
  {
    id: 'best-part-mug',
    name: 'Best Part Black Mug',
    price: 10.50,
    category: 'drinkware',
    description: '11oz glossy ceramic',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-300-6a67bf5392fa0__600',
    printfulUrl: 'https://tdi.printful.me/product/best-part-black-glossy-mug',
  },
  {
    id: 'good-pens-tumbler',
    name: 'The Good Pens Tumbler',
    price: 13.50,
    category: 'drinkware',
    description: 'Clear plastic, 16oz',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-751-6a67be0e959a1__600',
    printfulUrl: 'https://tdi.printful.me/product/the-good-pens-clear-plastic-tumbler',
  },
  // Accessories
  {
    id: 'same-team-magnet',
    name: 'Same Team Magnet',
    price: 8.00,
    category: 'accessories',
    description: 'Round magnet',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-656-6a67ca6cda97e__600',
    printfulUrl: 'https://tdi.printful.me/product/same-team-magnet',
  },
  // Stickers
  {
    id: 'same-team-sticker-sm',
    name: 'Same Team Sticker',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-358-6a67cb7a20467__600',
    printfulUrl: 'https://tdi.printful.me/product/same-team-bubble-free-stickers-6a67cb7a75b74',
  },
  {
    id: 'job-varies-sticker',
    name: 'Job Varies Sticker',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-358-6a67cb2bea792__600',
    printfulUrl: 'https://tdi.printful.me/product/job-varies-bubble-free-stickers',
  },
  {
    id: 'someone-sticker',
    name: 'Someone Sticker',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-358-6a67c1cfd504b__600',
    printfulUrl: 'https://tdi.printful.me/product/someone-bubble-free-stickers',
  },
  {
    id: 'tdi-sticker',
    name: 'TDI Sticker',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-358-6a67c0fab1dcc__600',
    printfulUrl: 'https://tdi.printful.me/product/tdi-bubble-free-stickers',
  },
  {
    id: 'glad-sticker',
    name: 'Glad Sticker',
    price: 3.00,
    category: 'stickers',
    description: 'Bubble-free vinyl',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-358-6a67c05ebd588__600',
    printfulUrl: 'https://tdi.printful.me/product/glad-bubble-free-stickers',
  },
  {
    id: 'same-team-sticker-lg',
    name: 'Same Team Sticker (Large)',
    price: 7.00,
    category: 'stickers',
    description: 'Bubble-free vinyl, large',
    image: 'https://cdn.printful.me/t/quick-stores/products/w600/17640463-358-6a67ca02938cc__600',
    printfulUrl: 'https://tdi.printful.me/product/same-team-bubble-free-stickers',
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
