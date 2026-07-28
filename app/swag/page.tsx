'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { SWAG_PRODUCTS, getContractProducts, getAfterProducts, getStickers } from '@/lib/swag/products';
import type { SwagProduct } from '@/lib/swag/types';
import { useCart } from '@/lib/swag/CartContext';

const C = {
  navy: '#1E2A4A', yellow: '#F9B91B', charcoal: '#2D2D2D', gray: '#F5F5F5',
  white: '#FFFFFF', blue: '#8FADD3', muted: '#6B7280', border: '#E5E7EB',
  warmBg: '#FAFAF8',
};

/* ─── Product Tile ─── */
function ProductTile({ product, onOpen }: { product: SwagProduct; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const hasTwoImages = product.images.length >= 2;
  return (
    <div onClick={onOpen} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onOpen()}>
      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 4, background: C.gray, overflow: 'hidden', position: 'relative' }}>
        <img src={product.images[0]} alt={product.name} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: hovered && hasTwoImages ? 0 : 1, transition: 'opacity 0.35s ease' }} />
        {hasTwoImages && <img src={product.images[1]} alt="" loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.35s ease' }} />}
      </div>
      <div style={{ marginTop: 10 }}>
        <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 15, fontWeight: 700, color: C.navy, margin: 0, lineHeight: 1.3 }}>{product.name}</h3>
        {product.colorName && <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{product.colorName}</p>}
        <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: '4px 0 0' }}>${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}

/* ─── Sticker Tile ─── */
function StickerTile({ product, onOpen }: { product: SwagProduct; onOpen: () => void }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const handleAdd = (e: React.MouseEvent) => { e.stopPropagation(); addItem(product); setAdded(true); setTimeout(() => setAdded(false), 1200); };
  return (
    <div onClick={onOpen} style={{ flex: '0 0 140px', cursor: 'pointer' }}>
      <div style={{ width: 140, height: 140, borderRadius: 4, background: C.gray, overflow: 'hidden', marginBottom: 8 }}>
        <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{product.name}</div>
      <div style={{ fontSize: 13, color: C.muted }}>${product.price.toFixed(2)}</div>
      <button onClick={handleAdd} style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: added ? C.navy : C.muted, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
        {added ? 'Added' : '+ Add'}
      </button>
    </div>
  );
}

/* ─── Product Drawer ─── */
function ProductDrawer({ product, onClose }: { product: SwagProduct; onClose: () => void }) {
  const { addItem, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [addedState, setAddedState] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    drawerRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleAdd = () => {
    if (product.variants && !selectedVariant) { setSizeError(true); setTimeout(() => setSizeError(false), 2000); return; }
    addItem(product, selectedVariant || undefined);
    setAddedState(true);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 300 }} />
      <div ref={drawerRef} tabIndex={-1} style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 420, height: '100vh',
        background: C.white, zIndex: 301, borderLeft: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', outline: 'none',
      }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>{product.category}</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 4, background: C.gray, border: 'none', cursor: 'pointer', fontSize: 14, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20, paddingTop: 20 }}>
            {product.images.map((img, i) => (
              <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 4, background: C.gray, overflow: 'hidden' }}>
                <img src={img} alt={`${product.name} view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>{product.name}</h2>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 4px' }}>{product.description}</p>
          {product.blurb && <p style={{ fontSize: 14, color: C.charcoal, margin: '0 0 12px', lineHeight: 1.5 }}>{product.blurb}</p>}
          <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: '0 0 20px' }}>${product.price.toFixed(2)}</div>
          {product.variants && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: sizeError ? '#DC2626' : C.navy, margin: '0 0 8px' }}>{sizeError ? 'Pick a size' : 'Size'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {product.variants.map(v => (
                  <button key={v.value} onClick={() => { setSelectedVariant(v.value); setSizeError(false); }} style={{
                    padding: '12px 8px', borderRadius: 4, fontSize: 14, fontWeight: 600, minHeight: 44, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    border: selectedVariant === v.value ? `2px solid ${C.navy}` : `1px solid ${C.border}`,
                    background: selectedVariant === v.value ? C.navy : C.white, color: selectedVariant === v.value ? C.white : C.charcoal,
                  }}>{v.label}</button>
                ))}
              </div>
            </div>
          )}
          {product.details && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Details</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{product.details}</p>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, flexShrink: 0, background: C.white }}>
          {addedState ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: C.gray, borderRadius: 6, padding: '14px 16px', fontSize: 14, fontWeight: 700, color: C.navy, textAlign: 'center' }}>Added</div>
              <button onClick={() => { onClose(); openCart(); }} style={{ flex: 1, background: C.navy, color: C.white, borderRadius: 6, padding: '14px 16px', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>View Cart</button>
            </div>
          ) : (
            <button onClick={handleAdd} style={{ width: '100%', background: C.yellow, color: C.navy, padding: 16, borderRadius: 6, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Add to Cart</button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Cart Drawer ─── */
function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/swag/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items.map(i => ({ productId: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity, variant: i.variant, image: i.product.images[0] })) }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error(err); }
    finally { setCheckingOut(false); }
  };
  if (!isOpen) return null;
  const qb: React.CSSProperties = { width: 28, height: 28, borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" };
  return (
    <>
      <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 400 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 400, height: '100vh', background: C.white, borderLeft: `1px solid ${C.border}`, zIndex: 401, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>Cart ({totalItems})</h3>
          <button onClick={closeCart} style={{ width: 28, height: 28, borderRadius: 4, background: C.gray, border: 'none', cursor: 'pointer', fontSize: 14, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <p style={{ fontSize: 14, color: C.muted, margin: '0 0 12px' }}>Nothing in here yet.</p>
              <button onClick={closeCart} style={{ fontSize: 13, fontWeight: 600, color: C.navy, background: 'none', border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Back to the drop</button>
            </div>
          ) : items.map(item => (
            <div key={`${item.product.id}-${item.variant}`} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: `1px solid ${C.gray}` }}>
              <div style={{ width: 52, height: 52, borderRadius: 4, background: C.gray, overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{item.product.name}</div>
                {item.variant && <div style={{ fontSize: 12, color: C.muted }}>Size: {item.variant.toUpperCase()}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)} style={qb}>-</button>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)} style={qb}>+</button>
                  <button onClick={() => removeItem(item.product.id, item.variant)} style={{ fontSize: 11, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginLeft: 'auto', textDecoration: 'underline', textUnderlineOffset: 2 }}>Remove</button>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.navy, flexShrink: 0, paddingTop: 2 }}>${(item.product.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: C.muted }}>Subtotal</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>${subtotal.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 14px' }}>Shipping + tax at checkout</p>
            <button onClick={handleCheckout} disabled={checkingOut} style={{ width: '100%', background: checkingOut ? C.muted : C.navy, color: C.white, padding: 14, borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 700, cursor: checkingOut ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {checkingOut ? 'Redirecting...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Product Section ─── */
function Section({ title, products, onOpen }: { title: string; products: SwagProduct[]; onOpen: (p: SwagProduct) => void }) {
  if (products.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 14px' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {products.map(p => <ProductTile key={p.id} product={p} onOpen={() => onOpen(p)} />)}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SwagPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAFAF8' }} />}>
      <SwagPageInner />
    </Suspense>
  );
}

function SwagPageInner() {
  const { openCart, totalItems } = useCart();
  const [drawerProduct, setDrawerProduct] = useState<SwagProduct | null>(null);

  // Sticky nav
  const [sticky, setSticky] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setSticky(!entry.isIntersecting), { threshold: 0 });
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Get products by section
  const contract = getContractProducts();
  const afterProducts = getAfterProducts();
  const allStickers = getStickers();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.warmBg, minHeight: '100vh' }}>
      <CartDrawer />
      {drawerProduct && <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />}

      {/* Hero */}
      <div ref={heroRef} style={{ background: C.navy, textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.yellow, margin: '0 0 8px' }}>Back to School 2026</p>
        <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: C.white, margin: '0 0 12px', lineHeight: 1.2 }}>TDI Swag Shop</h1>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <a href="#contract" style={{ padding: '12px 20px', borderRadius: 6, border: `1px solid rgba(255,255,255,0.3)`, color: C.white, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>Contract Hours</a>
          <a href="#after" style={{ padding: '12px 20px', borderRadius: 6, border: `1px solid rgba(255,255,255,0.3)`, color: C.white, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>After Hours</a>
        </div>
      </div>

      {/* Sticky bar */}
      <div style={{
        position: sticky ? 'fixed' : 'relative', top: sticky ? 0 : undefined, left: 0, right: 0, zIndex: 50,
        background: C.white, borderBottom: `1px solid ${C.border}`, boxShadow: sticky ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#contract" style={{ fontSize: 13, fontWeight: 700, color: C.navy, textDecoration: 'none' }}>Contract Hours</a>
            <a href="#after" style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: 'none' }}>After Hours</a>
            <a href="#stickers" style={{ fontSize: 13, fontWeight: 600, color: C.muted, textDecoration: 'none' }}>Stickers</a>
          </div>
          <button onClick={openCart} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: "'DM Sans', sans-serif" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            {totalItems > 0 && <span style={{ background: C.navy, color: C.white, fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>}
          </button>
        </div>
      </div>
      {sticky && <div style={{ height: 46 }} />}

      {/* ─── CONTRACT HOURS ─── */}
      <div id="contract" style={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden' }}>
        <img src="/images/swag/hero-contract.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(30,42,74,0.85) 0%, rgba(30,42,74,0.5) 60%, rgba(30,42,74,0.2) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, color: C.white, margin: '0 0 6px' }}>Contract Hours</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: 0 }}>For the building. For the mission. For the job.</p>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' }}>
        <Section title="Shirts" products={contract.shirts} onOpen={setDrawerProduct} />
        <Section title="Hats" products={contract.hats} onOpen={setDrawerProduct} />
        <Section title="Bags" products={contract.bags} onOpen={setDrawerProduct} />
        <Section title="Drinkware" products={contract.drinkware} onOpen={setDrawerProduct} />
        <Section title="Accessories" products={contract.accessories} onOpen={setDrawerProduct} />
      </div>

      {/* ─── AFTER HOURS ─── */}
      <div id="after" style={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden', marginTop: 32 }}>
        <img src="/images/swag/hero-after.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(30,42,74,0.85) 0%, rgba(30,42,74,0.5) 60%, rgba(30,42,74,0.2) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, color: C.white, margin: '0 0 6px' }}>After Hours</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: 0 }}>The bell rang. Now breathe.</p>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' }}>
        <Section title="Shirts &amp; Loungewear" products={afterProducts} onOpen={setDrawerProduct} />
      </div>

      {/* ─── STICKER BAR (all stickers) ─── */}
      <div id="stickers" style={{ borderTop: `1px solid ${C.border}`, background: C.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 14px' }}>The Sticker Bar</h2>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' as const }}>
            {allStickers.map(p => <StickerTile key={p.id} product={p} onOpen={() => setDrawerProduct(p)} />)}
          </div>
        </div>
      </div>

      {/* Teams CTA */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '40px 24px', textAlign: 'center', background: C.white }}>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Outfitting a team?</p>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px' }}>Staff appreciation, onboarding kits, PD day swag.</p>
        <a href="/contact" style={{ display: 'inline-block', background: C.navy, color: C.white, padding: '12px 24px', borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Start the Conversation</a>
      </div>
    </div>
  );
}
