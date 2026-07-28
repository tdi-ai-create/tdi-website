'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SWAG_PRODUCTS, getProductsByDrop, getProductsByType, getStickers, type SwagProduct } from '@/lib/swag/products';
import { useCart } from '@/lib/swag/CartContext';

const C = { navy: '#1E2A4A', yellow: '#F9B91B', charcoal: '#2D2D2D', gray: '#F5F5F5', white: '#FFFFFF', blue: '#8FADD3', muted: '#6B7280', border: '#E5E7EB' };

/* ─── Image Carousel ─── */
function ImageCarousel({ images, size = 'card' }: { images: string[]; size?: 'card' | 'modal' }) {
  const [idx, setIdx] = useState(0);
  const isModal = size === 'modal';
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: '100%', aspectRatio: '1', borderRadius: isModal ? 12 : 8, background: C.gray, overflow: 'hidden', position: 'relative' }}>
        <img src={images[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setIdx(i => i > 0 ? i - 1 : images.length - 1); }}
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', fontSize: 14, color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#8249;</button>
            <button onClick={(e) => { e.stopPropagation(); setIdx(i => i < images.length - 1 ? i + 1 : 0); }}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', fontSize: 14, color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#8250;</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
          {images.map((img, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              style={{ width: isModal ? 48 : 32, height: isModal ? 48 : 32, borderRadius: 4, overflow: 'hidden', border: i === idx ? `2px solid ${C.navy}` : `1px solid ${C.border}`, cursor: 'pointer', padding: 0 }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Product Detail Modal ─── */
function ProductModal({ product, onClose }: { product: SwagProduct; onClose: () => void }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[2]?.value || product.variants?.[0]?.value);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [added, setAdded] = useState(false);

  const handleAdd = () => { addItem(product, selectedVariant); setAdded(true); setTimeout(() => setAdded(false), 1500); };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 820, maxHeight: '90vh', background: C.white, borderRadius: 16, zIndex: 301, overflow: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: C.gray, border: 'none', cursor: 'pointer', fontSize: 18, color: C.muted, zIndex: 302, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, padding: 32 }}>
          <ImageCarousel images={product.images} size="modal" />
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>{product.name}</h2>
            <p style={{ fontSize: 14, color: C.muted, margin: '0 0 8px' }}>{product.description}</p>
            {product.blurb && <p style={{ fontSize: 15, color: C.charcoal, margin: '0 0 16px', lineHeight: 1.5 }}>{product.blurb}</p>}
            <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, margin: '0 0 20px' }}>${product.price.toFixed(2)}</div>

            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Color</p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)} style={{
                      padding: '5px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      border: selectedColor === c ? `2px solid ${C.navy}` : `1px solid ${C.border}`,
                      background: selectedColor === c ? C.navy : C.white,
                      color: selectedColor === c ? C.white : C.muted,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {product.variants && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Size</p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {product.variants.map(v => (
                    <button key={v.value} onClick={() => setSelectedVariant(v.value)} style={{
                      padding: '6px 14px', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      border: selectedVariant === v.value ? `2px solid ${C.navy}` : `1.5px solid ${C.border}`,
                      background: selectedVariant === v.value ? C.navy : C.white,
                      color: selectedVariant === v.value ? C.white : C.muted,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{v.label}</button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAdd} style={{
              width: '100%', background: added ? C.navy : C.yellow, color: added ? C.white : C.navy,
              padding: 16, borderRadius: 8, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", marginBottom: 16,
            }}>{added ? 'Added to Cart!' : 'Add to Cart'}</button>

            {product.details && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>Details</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{product.details}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Product Card ─── */
function ProductCard({ product, onOpen }: { product: SwagProduct; onOpen: () => void }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, product.variants?.[2]?.value || product.variants?.[0]?.value);
    setAdded(true); setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div onClick={onOpen} style={{ cursor: 'pointer' }}>
      <ImageCarousel images={product.images} />
      <div style={{ marginTop: 12 }}>
        <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700, color: C.navy, margin: '0 0 2px' }}>{product.name}</h3>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 4px' }}>{product.description}</p>
        {product.blurb && <p style={{ fontSize: 13, color: C.charcoal, margin: '0 0 8px' }}>{product.blurb}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>${product.price.toFixed(2)}</span>
          <button onClick={handleQuickAdd} style={{
            background: added ? C.navy : C.yellow, border: 'none', color: added ? C.white : C.navy,
            padding: '8px 18px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>{added ? 'Added!' : 'Add to Cart'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sticker Card ─── */
function StickerCard({ product, onOpen }: { product: SwagProduct; onOpen: () => void }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const handleAdd = (e: React.MouseEvent) => { e.stopPropagation(); addItem(product); setAdded(true); setTimeout(() => setAdded(false), 1200); };
  return (
    <div onClick={onOpen} style={{ flex: '0 0 140px', cursor: 'pointer' }}>
      <div style={{ width: 140, height: 140, borderRadius: 8, background: C.gray, overflow: 'hidden', marginBottom: 8 }}>
        <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{product.name}</div>
      <div style={{ fontSize: 13, color: C.muted }}>${product.price.toFixed(2)}</div>
      <button onClick={handleAdd} style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: added ? C.navy : C.yellow, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textDecoration: 'underline', textUnderlineOffset: 2 }}>
        {added ? 'Added!' : '+ Add'}
      </button>
    </div>
  );
}

/* ─── Cart Slide-over ─── */
function CartSlideOver() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/swag/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items.map(i => ({ productId: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity, variant: i.variant, image: i.product.images[0] })) }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error('Checkout error:', err); }
    finally { setCheckingOut(false); }
  };
  if (!isOpen) return null;
  const qtyBtn: React.CSSProperties = { width: 24, height: 24, borderRadius: 4, border: `1.5px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" };
  return (
    <>
      <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 400, height: '100vh', background: C.white, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 700, color: C.navy, margin: 0 }}>Your Cart ({totalItems})</h3>
          <button onClick={closeCart} style={{ width: 28, height: 28, borderRadius: 4, background: C.gray, border: 'none', cursor: 'pointer', fontSize: 14, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? <div style={{ textAlign: 'center', padding: '48px 16px', color: C.muted }}><p>Your cart is empty.</p></div> :
          items.map(item => (
            <div key={`${item.product.id}-${item.variant}`} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: `1px solid ${C.gray}` }}>
              <div style={{ width: 56, height: 56, borderRadius: 6, background: C.gray, overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{item.product.name}</div>
                {item.variant && <div style={{ fontSize: 12, color: C.muted }}>Size: {item.variant.toUpperCase()}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)} style={qtyBtn}>-</button>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)} style={qtyBtn}>+</button>
                  <button onClick={() => removeItem(item.product.id, item.variant)} style={{ fontSize: 11, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginLeft: 4 }}>Remove</button>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, flexShrink: 0 }}>${(item.product.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: C.muted }}>Subtotal</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>${subtotal.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: 12, color: C.muted, margin: '0 0 16px' }}>Shipping + tax calculated at checkout</p>
            <button onClick={handleCheckout} disabled={checkingOut} style={{ width: '100%', background: checkingOut ? C.muted : C.yellow, color: C.navy, padding: 14, borderRadius: 6, border: 'none', fontSize: 15, fontWeight: 700, cursor: checkingOut ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {checkingOut ? 'Redirecting...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Section ─── */
function ProductSection({ title, products, onOpen }: { title: string; products: SwagProduct[]; onOpen: (p: SwagProduct) => void }) {
  if (products.length === 0) return null;
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
      <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 16px', paddingBottom: 10, borderBottom: `2px solid ${C.navy}` }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
        {products.map(p => <ProductCard key={p.id} product={p} onOpen={() => onOpen(p)} />)}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SwagPage() {
  const { openCart, totalItems } = useCart();
  const [modalProduct, setModalProduct] = useState<SwagProduct | null>(null);
  const [drop, setDrop] = useState<'work-hours' | 'after-hours'>('work-hours');

  const products = getProductsByDrop(drop);
  const shirts = getProductsByType(products, 'apparel');
  const hats = getProductsByType(products, 'hats');
  const bags = getProductsByType(products, 'bags');
  const drinkware = getProductsByType(products, 'drinkware');
  const accessories = getProductsByType(products, 'accessories');
  const stickers = getStickers(drop);

  // Hero images: show variety (tee, hat, tote, tumbler)
  const heroProducts = drop === 'work-hours'
    ? [SWAG_PRODUCTS.find(p => p.id === 'ask-me-tee')!, SWAG_PRODUCTS.find(p => p.id === 'room-hat')!, SWAG_PRODUCTS.find(p => p.id === 'hard-parts-tote')!, SWAG_PRODUCTS.find(p => p.id === 'good-pens-tumbler')!]
    : [SWAG_PRODUCTS.find(p => p.id === 'questions-hoodie')!, SWAG_PRODUCTS.find(p => p.id === 'sleepy-dress')!, SWAG_PRODUCTS.find(p => p.id === 'shows-pants')!, SWAG_PRODUCTS.find(p => p.id === 'closed-tee')!];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.white, minHeight: '100vh' }}>
      <CartSlideOver />
      {modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />}

      {/* Hero */}
      <div style={{ background: C.navy, color: C.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.yellow, margin: '0 0 16px' }}>Back to School 2026</p>
            <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 16px' }}>TDI Swag Shop</h1>
            <p style={{ fontSize: 16, color: C.blue, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 420 }}>
              {drop === 'work-hours'
                ? 'Tees, totes, and tiny reminders that what you do matters. Every piece designed for educators, by educators.'
                : 'The bell rang. Now breathe. Loungewear, hoodies, and the pieces you actually want to come home to.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.yellow, color: C.navy, padding: '14px 28px', borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Shop {drop === 'work-hours' ? 'Work Hours' : 'After Hours'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <button onClick={openCart} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: C.white, padding: '14px 28px', borderRadius: 6, fontSize: 14, fontWeight: 700, border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                Cart {totalItems > 0 && `(${totalItems})`}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {heroProducts.filter(Boolean).map(p => (
              <div key={p.id} style={{ aspectRatio: '1', borderRadius: 8, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setModalProduct(p)}>
                <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drop toggle */}
      <div id="shop" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', background: C.gray, borderRadius: 6, padding: 3 }}>
          {(['work-hours', 'after-hours'] as const).map(d => (
            <button key={d} onClick={() => setDrop(d)} style={{
              padding: '12px 28px', borderRadius: 4, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
              background: drop === d ? C.navy : 'transparent', color: drop === d ? C.white : C.muted,
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}>
              {d === 'work-hours' ? 'Work Hours' : 'After Hours'}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: '8px 0 0' }}>
          {drop === 'work-hours' ? 'For the building. For the mission. For the job.' : 'No lesson plans required.'}
        </p>
      </div>

      {/* Product sections by type */}
      <ProductSection title="Shirts" products={shirts} onOpen={setModalProduct} />
      <ProductSection title="Hats" products={hats} onOpen={setModalProduct} />
      <ProductSection title="Bags" products={bags} onOpen={setModalProduct} />
      <ProductSection title="Drinkware" products={drinkware} onOpen={setModalProduct} />
      <ProductSection title="Accessories" products={accessories} onOpen={setModalProduct} />

      {/* Sticker Bar */}
      {stickers.length > 0 && (
        <div style={{ background: C.gray }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
            <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 16px' }}>Stickers</h2>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' as const }}>
              {stickers.map(p => <StickerCard key={p.id} product={p} onOpen={() => setModalProduct(p)} />)}
            </div>
          </div>
        </div>
      )}

      {/* Bulk CTA */}
      <div style={{ background: C.navy, padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>Outfitting a team?</p>
        <p style={{ fontSize: 14, color: C.blue, margin: '0 0 20px' }}>We work with schools and districts on staff appreciation, onboarding kits, and PD day swag.</p>
        <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.yellow, color: C.navy, padding: '14px 28px', borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Start the Conversation</a>
      </div>
    </div>
  );
}
