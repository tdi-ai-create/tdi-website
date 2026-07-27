'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SWAG_PRODUCTS, type SwagProduct } from '@/lib/swag/products';
import { useCart, type CartItem } from '@/lib/swag/CartContext';

// ─── Product Card (Editorial) ────────────────────────────
function ProductCard({ product, showEditorial }: { product: SwagProduct; showEditorial?: boolean }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[2]?.value || product.variants?.[0]?.value);
  const [added, setAdded] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleAdd = () => {
    addItem(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div>
      <div style={{
        width: '100%', aspectRatio: '4/5', borderRadius: 12, background: '#ECEAE7',
        position: 'relative', overflow: 'hidden', marginBottom: 16,
      }}>
        <img src={product.image} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        {product.tag && (
          <div style={{
            position: 'absolute', top: 12, left: 12, background: 'rgba(30,39,73,0.85)',
            color: 'white', padding: '5px 12px', borderRadius: 6, fontSize: 10,
            fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            {product.tag}
          </div>
        )}
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, color: '#1e2749', marginBottom: 2,
        fontFamily: "'Source Serif 4', serif" }}>{product.name}</div>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>{product.description}</div>

      {showEditorial && product.editorialCopy && (
        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 12,
          fontFamily: "'Source Serif 4', serif", fontStyle: 'italic' }}>
          {product.editorialCopy}
        </p>
      )}

      {product.adminCopy && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setShowAdmin(!showAdmin)} style={{
            fontSize: 11, fontWeight: 700, color: '#00B5AD', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ transform: showAdmin ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s', display: 'inline-block', fontSize: 8 }}>&#9654;</span>
            Ordering for your team?
          </button>
          {showAdmin && (
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, marginTop: 6,
              padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, borderLeft: '3px solid #00B5AD' }}>
              {product.adminCopy}
            </p>
          )}
        </div>
      )}

      {product.variants && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
          {product.variants.map(v => (
            <button key={v.value} onClick={() => setSelectedVariant(v.value)}
              style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: selectedVariant === v.value ? '2px solid #1e2749' : '1.5px solid #E5E7EB',
                background: selectedVariant === v.value ? '#1e2749' : 'white',
                color: selectedVariant === v.value ? 'white' : '#6B7280',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
              {v.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1e2749' }}>${product.price.toFixed(2)}</div>
        <button onClick={handleAdd}
          style={{
            background: added ? '#00B5AD' : 'none',
            border: `2px solid ${added ? '#00B5AD' : '#1e2749'}`,
            color: added ? 'white' : '#1e2749',
            padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { if (!added) { e.currentTarget.style.background = '#1e2749'; e.currentTarget.style.color = 'white'; } }}
          onMouseLeave={e => { if (!added) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1e2749'; } }}>
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

// ─── Sticker Card ────────────────────────────────────────
function StickerCard({ product }: { product: SwagProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const handleAdd = () => { addItem(product); setAdded(true); setTimeout(() => setAdded(false), 1200); };

  return (
    <div style={{ flex: '0 0 150px', cursor: 'pointer' }}>
      <div style={{ width: 150, height: 150, borderRadius: 12, background: '#F0EDEA', overflow: 'hidden', marginBottom: 10 }}>
        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e2749' }}>{product.name}</div>
      <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>${product.price.toFixed(2)}</div>
      <button onClick={handleAdd} style={{
        marginTop: 6, fontSize: 11, fontWeight: 700, color: added ? '#1e2749' : '#00B5AD',
        cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: "'DM Sans', sans-serif",
      }}>
        {added ? 'Added!' : '+ Add to Cart'}
      </button>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 0' }}>
      <div style={{ borderBottom: '2px solid #1e2749', paddingBottom: 12, marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 700, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Cart Slide-over ─────────────────────────────────────
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
      <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 400, height: '100vh',
        background: 'white', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', zIndex: 200, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0F0EE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Your Cart ({totalItems})</h3>
          <button onClick={closeCart} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
              <p style={{ fontSize: 15, marginBottom: 8 }}>Your cart is empty</p>
              <p style={{ fontSize: 13 }}>Add some swag to get started!</p>
            </div>
          ) : items.map(item => (
            <div key={`${item.product.id}-${item.variant}`} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ width: 64, height: 64, borderRadius: 10, background: '#F0EDEA', overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e2749', marginBottom: 2 }}>{item.product.name}</div>
                {item.variant && <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>Size: {item.variant.toUpperCase()}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)} style={qtyBtn}>-</button>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)} style={qtyBtn}>+</button>
                  <button onClick={() => removeItem(item.product.id, item.variant)} style={{ fontSize: 11, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginLeft: 8 }}>Remove</button>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1e2749', flexShrink: 0 }}>${(item.product.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: '24px 28px', borderTop: '1px solid #F0F0EE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: '#6B7280' }}>Subtotal</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#1e2749' }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 18 }}>Shipping + tax calculated at checkout</div>
            <button onClick={handleCheckout} disabled={checkingOut} style={{
              width: '100%', background: checkingOut ? '#9CA3AF' : '#00B5AD', color: 'white',
              padding: 16, borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700,
              cursor: checkingOut ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              {checkingOut ? 'Redirecting...' : 'Checkout'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 12 }}>
              Secure checkout powered by Stripe. Ships in 3-5 business days.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: '1.5px solid #E5E7EB',
  background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700,
  color: '#1e2749', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'DM Sans', sans-serif",
};

// ─── Main Page ───────────────────────────────────────────
export default function SwagPage() {
  const { openCart, totalItems } = useCart();
  const [viewMode, setViewMode] = useState<'for-you' | 'for-staff'>('for-you');

  const hero = SWAG_PRODUCTS.find(p => p.id === 'ask-me-tee')!;
  const forYou = SWAG_PRODUCTS.filter(p => p.category !== 'stickers' && (p.audience === 'for-you' || p.audience === 'both'));
  const forStaff = SWAG_PRODUCTS.filter(p => p.category !== 'stickers' && (p.audience === 'for-staff' || p.audience === 'both'));
  const stickers = SWAG_PRODUCTS.filter(p => p.category === 'stickers');

  const activeProducts = viewMode === 'for-you' ? forYou : forStaff;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF8', minHeight: '100vh' }}>
      <CartSlideOver />

      {/* Nav */}
      <div style={{
        background: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '1px solid #F0F0EE', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700, color: '#1e2749', textDecoration: 'none' }}>
          Teachers Deserve It
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ color: '#6B7280', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Home</Link>
          <span style={{ color: '#1e2749', fontSize: 14, fontWeight: 700 }}>Swag</span>
          <button onClick={openCart} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e2749" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && (
              <div style={{ position: 'absolute', top: -4, right: -8, background: '#00B5AD', color: 'white', fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: '#F5F0EB' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '72px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 56, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#00B5AD', marginBottom: 20 }}>
              Back to School 2026
            </div>
            <h1 style={{
              fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: 700, lineHeight: 1.05, color: '#1e2749', margin: '0 0 12px',
            }}>
              Sell it like a label,
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(42px, 6vw, 60px)', fontWeight: 500, color: '#00B5AD', display: 'block', marginTop: 4 }}>
                not a spirit store.
              </span>
            </h1>
            <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
              Every piece designed for educators, by educators. One garment per frame. Daylight, one direction. No apples, no crayons.
            </p>
            <a href="#shop" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1e2749', color: 'white',
              padding: '16px 32px', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}>
              Shop the Drop
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div style={{ aspectRatio: '4/5', borderRadius: 16, background: '#E8E3DD', overflow: 'hidden', maxWidth: 420 }}>
            <img src={hero.image} alt={hero.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Audience toggle */}
      <div id="shop" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>I am shopping...</p>
        <div style={{ display: 'inline-flex', background: '#F3F4F6', borderRadius: 50, padding: 4 }}>
          <button onClick={() => setViewMode('for-you')}
            style={{
              padding: '10px 28px', borderRadius: 50, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
              background: viewMode === 'for-you' ? '#1e2749' : 'transparent',
              color: viewMode === 'for-you' ? 'white' : '#6B7280',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}>
            For myself
          </button>
          <button onClick={() => setViewMode('for-staff')}
            style={{
              padding: '10px 28px', borderRadius: 50, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
              background: viewMode === 'for-staff' ? '#1e2749' : 'transparent',
              color: viewMode === 'for-staff' ? 'white' : '#6B7280',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}>
            For my staff
          </button>
        </div>
      </div>

      {/* Products */}
      <SectionHeader
        title={viewMode === 'for-you' ? 'For You' : 'For Your Staff'}
        subtitle={viewMode === 'for-you'
          ? 'The pieces you wear out of the building.'
          : 'The pieces that tell your team they were counted.'}
      />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 36, maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px',
      }}>
        {activeProducts.map(p => <ProductCard key={p.id} product={p} showEditorial />)}
      </div>

      {/* Featured banner */}
      <div style={{ maxWidth: 1100, margin: '0 auto 48px', padding: '0 24px' }}>
        <div style={{
          background: '#1e2749', borderRadius: 20, padding: 'clamp(32px, 4vw, 56px)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 40, alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: 'white', margin: '0 0 12px', lineHeight: 1.2 }}>
              Same Team. <span style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 500, color: '#5CE0D8' }}>Same Mission.</span> Different Job.
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Our flagship collection celebrates every role in the building. Teachers, paras, admins, counselors. Different titles, same team.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {SWAG_PRODUCTS.filter(p => p.name.includes('Same Team') || p.name.includes('Same Team')).slice(0, 4).map(p => (
              <div key={p.id} style={{ aspectRatio: '1', borderRadius: 12, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stickers */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ borderBottom: '2px solid #1e2749', paddingBottom: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 700, margin: 0 }}>Stickers</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Fan them on cream paper. Stick one on a laptop corner. Never all four on the same thing.</p>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, WebkitOverflowScrolling: 'touch' as const }}>
          {stickers.map(p => <StickerCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1e2749', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.8 }}>
          All items are print-on-demand, made just for you.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.8 }}>
          <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Teachers Deserve It</strong>
        </p>
      </div>
    </div>
  );
}
