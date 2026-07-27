'use client';

import { useState } from 'react';
import { SWAG_PRODUCTS, getProductsByAudience, getStickers, type SwagProduct } from '@/lib/swag/products';
import { useCart, type CartItem } from '@/lib/swag/CartContext';

/* ─── Design tokens (match main site) ─── */
const C = {
  navy: '#1E2A4A',
  yellow: '#F9B91B',
  charcoal: '#2D2D2D',
  gray: '#F5F5F5',
  blue: '#8FADD3',
  white: '#FFFFFF',
  muted: '#6B7280',
  border: '#E5E7EB',
};

/* ─── Product Card ─── */
function ProductCard({ product }: { product: SwagProduct }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[2]?.value || product.variants?.[0]?.value);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div>
      <div style={{
        width: '100%', aspectRatio: '1', borderRadius: 12, background: C.gray,
        position: 'relative', overflow: 'hidden', marginBottom: 14,
      }}>
        <img src={product.image} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        {product.tag && (
          <div style={{
            position: 'absolute', top: 12, left: 12, background: C.yellow,
            color: C.navy, padding: '4px 10px', borderRadius: 4, fontSize: 10,
            fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            {product.tag}
          </div>
        )}
      </div>

      <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700, color: C.navy, margin: '0 0 2px' }}>
        {product.name}
      </h3>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 4px' }}>{product.description}</p>
      {product.blurb && (
        <p style={{ fontSize: 14, color: C.charcoal, margin: '0 0 10px', lineHeight: 1.5 }}>{product.blurb}</p>
      )}

      {product.variants && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {product.variants.map(v => (
            <button key={v.value} onClick={() => setSelectedVariant(v.value)}
              style={{
                padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                border: selectedVariant === v.value ? `2px solid ${C.navy}` : `1.5px solid ${C.border}`,
                background: selectedVariant === v.value ? C.navy : C.white,
                color: selectedVariant === v.value ? C.white : C.muted,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
              {v.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>${product.price.toFixed(2)}</span>
        <button onClick={handleAdd}
          style={{
            background: added ? C.navy : C.yellow,
            border: 'none',
            color: added ? C.white : C.navy,
            padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
          }}>
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

/* ─── Sticker Card ─── */
function StickerCard({ product }: { product: SwagProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const handleAdd = () => { addItem(product); setAdded(true); setTimeout(() => setAdded(false), 1200); };

  return (
    <div style={{ flex: '0 0 140px' }}>
      <div style={{ width: 140, height: 140, borderRadius: 8, background: C.gray, overflow: 'hidden', marginBottom: 8 }}>
        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{product.name}</div>
      <div style={{ fontSize: 13, color: C.muted }}>${product.price.toFixed(2)}</div>
      <button onClick={handleAdd} style={{
        marginTop: 4, fontSize: 11, fontWeight: 700, color: added ? C.navy : C.yellow,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        textDecoration: 'underline', textUnderlineOffset: 2,
      }}>
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
      const res = await fetch('/api/swag/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.product.id, name: i.product.name, price: i.product.price,
            quantity: i.quantity, variant: i.variant, image: i.product.image,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error('Checkout error:', err); }
    finally { setCheckingOut(false); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 400, height: '100vh',
        background: C.white, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 200,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 700, color: C.navy, margin: 0 }}>
            Your Cart ({totalItems})
          </h3>
          <button onClick={closeCart} style={{
            width: 28, height: 28, borderRadius: 4, background: C.gray,
            border: 'none', cursor: 'pointer', fontSize: 14, color: C.muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>x</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: C.muted }}>
              <p style={{ fontSize: 14 }}>Your cart is empty.</p>
            </div>
          ) : items.map(item => (
            <div key={`${item.product.id}-${item.variant}`} style={{
              display: 'flex', gap: 12, padding: '14px 0', borderBottom: `1px solid ${C.gray}`,
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 6, background: C.gray, overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{item.product.name}</div>
                {item.variant && <div style={{ fontSize: 12, color: C.muted }}>Size: {item.variant.toUpperCase()}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)} style={qtyBtn}>-</button>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)} style={qtyBtn}>+</button>
                  <button onClick={() => removeItem(item.product.id, item.variant)} style={{
                    fontSize: 11, color: '#DC2626', background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginLeft: 4,
                  }}>Remove</button>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, flexShrink: 0 }}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: C.muted }}>Subtotal</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>${subtotal.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: 12, color: C.muted, margin: '0 0 16px' }}>Shipping + tax calculated at checkout</p>
            <button onClick={handleCheckout} disabled={checkingOut} style={{
              width: '100%', background: checkingOut ? C.muted : C.yellow, color: C.navy,
              padding: 14, borderRadius: 6, border: 'none', fontSize: 15, fontWeight: 700,
              cursor: checkingOut ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              {checkingOut ? 'Redirecting...' : 'Checkout'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: C.muted, margin: '10px 0 0' }}>
              Secure checkout. Ships in 3-5 business days.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 4, border: `1.5px solid ${C.border}`,
  background: C.white, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'DM Sans', sans-serif",
};

/* ─── Main Page ─── */
export default function SwagPage() {
  const { openCart, totalItems } = useCart();
  const [viewMode, setViewMode] = useState<'for-you' | 'for-staff'>('for-you');

  const products = getProductsByAudience(viewMode);
  const stickers = getStickers();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.white, minHeight: '100vh' }}>
      <CartSlideOver />

      {/* Hero */}
      <div style={{ background: C.navy, color: C.white }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '64px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48, alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.yellow, margin: '0 0 16px' }}>
              Back to School 2026
            </p>
            <h1 style={{
              fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700, lineHeight: 1.1, margin: '0 0 16px',
            }}>
              TDI Swag Shop
            </h1>
            <p style={{ fontSize: 16, color: C.blue, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 420 }}>
              Tees, totes, and tiny reminders that what you do matters. Every piece designed for educators, by educators.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#shop" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: C.yellow, color: C.navy, padding: '14px 28px',
                borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none',
              }}>
                Shop the Drop
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <button onClick={openCart} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: C.white, padding: '14px 28px',
                borderRadius: 6, fontSize: 14, fontWeight: 700, border: `2px solid rgba(255,255,255,0.3)`,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
                Cart {totalItems > 0 && `(${totalItems})`}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SWAG_PRODUCTS.slice(0, 4).map(p => (
              <div key={p.id} style={{ aspectRatio: '1', borderRadius: 8, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audience toggle */}
      <div id="shop" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: C.muted, margin: '0 0 12px' }}>I am shopping...</p>
        <div style={{ display: 'inline-flex', background: C.gray, borderRadius: 6, padding: 3 }}>
          {(['for-you', 'for-staff'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{
                padding: '10px 24px', borderRadius: 4, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: viewMode === mode ? C.navy : 'transparent',
                color: viewMode === mode ? C.white : C.muted,
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
              }}>
              {mode === 'for-you' ? 'For myself' : 'For my staff'}
            </button>
          ))}
        </div>
      </div>

      {/* Admin callout for staff mode */}
      {viewMode === 'for-staff' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 0' }}>
          <div style={{
            background: C.gray, borderRadius: 8, padding: '16px 20px',
            borderLeft: `4px solid ${C.yellow}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: 0 }}>Ordering for your team?</p>
              <p style={{ fontSize: 13, color: C.muted, margin: '2px 0 0' }}>We do bulk orders for schools and districts. Let's talk about what works for your team.</p>
            </div>
            <a href="mailto:hello@teachersdeserveit.com?subject=Bulk%20Swag%20Order%20Inquiry" style={{
              background: C.yellow, color: C.navy, padding: '10px 20px', borderRadius: 6,
              fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Start a Conversation
            </a>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 0' }}>
        <h2 style={{
          fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 700, color: C.navy,
          margin: '0 0 20px', paddingBottom: 12, borderBottom: `2px solid ${C.navy}`,
        }}>
          {viewMode === 'for-you' ? 'For You' : 'For Your Staff'}
        </h2>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 28, maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px',
      }}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Stickers */}
      <div style={{ background: C.gray }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
          <h2 style={{
            fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 700, color: C.navy,
            margin: '0 0 16px',
          }}>
            Stickers
          </h2>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' as const }}>
            {stickers.map(p => <StickerCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ background: C.navy, padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>
          Questions about bulk orders?
        </p>
        <p style={{ fontSize: 14, color: C.blue, margin: '0 0 20px' }}>
          We work with schools and districts on staff appreciation, onboarding kits, and PD day swag.
        </p>
        <a href="mailto:hello@teachersdeserveit.com?subject=Swag%20Inquiry" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: C.yellow, color: C.navy, padding: '14px 28px',
          borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: 'none',
        }}>
          Start the Conversation
        </a>
      </div>
    </div>
  );
}
