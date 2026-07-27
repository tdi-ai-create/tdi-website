import { CartProvider } from '@/lib/swag/CartContext';

export const metadata = {
  title: 'TDI Swag Shop | Teachers Deserve It',
  description: 'Rep the mission. Tees, totes, and tiny reminders that what you do matters.',
};

export default function SwagLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
