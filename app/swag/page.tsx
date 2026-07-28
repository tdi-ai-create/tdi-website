'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { SWAG_PRODUCTS, getProductsByDrop, getStickers, type SwagProduct } from '@/lib/swag/products';
import { useCart } from '@/lib/swag/CartContext';
import type { World } from '@/lib/swag/types';

const C = {
  navy: '#1E2A4A', yellow: '#F9B91B', charcoal: '#2D2D2D', gray: '#F5F5F5',
  white: '#FFFFFF', blue: '#8FADD3', muted: '#6B7280', border: '#E5E7EB',
  warmBg: '#FAFAF8',
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT TILE — no button, hover crossfade, whole tile clickable
   ═══════════════════════════════════════════════════════════════ */
function ProductTile({ product, onOpen }: { product: SwagProduct; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const hasTwoImages = product.images.length >= 2;

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
    >
      {/* Image with crossfade */}
      <div style={{
        width: '100%', aspectRatio: '1', borderRadius: 4, background: C.gray,
        overflow: 'hidden', position: 'relative',
      }}>
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            position: 'absolute', inset: 0,
            opacity: hovered && hasTwoImages ? 0 : 1,
            transition: 'opacity 0.35s ease',
          }}
        />
        {hasTwoImages && (
          <img
            src={product.images[1]}
            alt={`${product.name} back`}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              position: 'absolute', inset: 0,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ marginTop: 10 }}>
        <h3 style={{
          fontFamily: "'Source Serif 4', serif", fontSize: 15, fontWeight: 700,
          color: C.navy, margin: 0, lineHeight: 1.3,
        }}>
          {product.name}
        </h3>
        {product.colorName && (
          <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{product.colorName}</p>
        )}
        <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: '4px 0 0' }}>
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STICKER TILE — inline + Add
   ═══════════════════════════════════════════════════════════════ */
function StickerTile({ product, onOpen }: { product: SwagProduct; onOpen: () => void }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div onClick={onOpen} style={{ flex: '0 0 140px', cursor: 'pointer' }}>
      <div style={{
        width: 140, height: 140, borderRadius: 4, background: C.gray,
        overflow: 'hidden', marginBottom: 8,
      }}>
        <img src={product.images[0]} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{product.name}</div>
      <div style={{ fontSize: 13, color: C.muted }}>${product.price.toFixed(2)}</div>
      <button onClick={handleAdd} style={{
        marginTop: 4, fontSize: 11, fontWeight: 600, color: added ? C.navy : C.muted,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {added ? 'Added' : '+ Add'}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT DRAWER — right side, stacked images, stays open after add
   ═══════════════════════════════════════════════════════════════ */
function ProductDrawer({ product, onClose }: { product: SwagProduct; onClose: () => void }) {
  const { addItem, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [addedState, setAddedState] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    drawerRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleAdd = () => {
    if (product.variants && !selectedVariant) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addItem(product, selectedVariant || undefined);
    setAddedState(true);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        zIndex: 300, transition: 'opacity 0.2s',
      }} />
      <div
        ref={drawerRef}
        tabIndex={-1}
        style={{
          position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 420,
          height: '100vh', background: C.white, zIndex: 301,
          borderLeft: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', outline: 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
            {product.subBand || product.category}
          </span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 4, background: C.gray,
            border: 'none', cursor: 'pointer', fontSize: 14, color: C.muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>x</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {/* Images stacked vertically */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20, paddingTop: 20 }}>
            {product.images.map((img, i) => (
              <div key={i} style={{
                width: '100%', aspectRatio: '1', borderRadius: 4,
                background: C.gray, overflow: 'hidden',
              }}>
                <img src={img} alt={`${product.name} view ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          {/* Product info */}
          <h2 style={{
            fontFamily: "'Source Serif 4', serif", fontSize: 24, fontWeight: 700,
            color: C.navy, margin: '0 0 4px',
          }}>
            {product.name}
          </h2>
          {product.colorName && (
            <p style={{ fontSize: 13, color: C.muted, margin: '0 0 4px' }}>{product.colorName}</p>
          )}
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 4px' }}>{product.description}</p>
          {product.blurb && (
            <p style={{ fontSize: 14, color: C.charcoal, margin: '0 0 12px', lineHeight: 1.5 }}>{product.blurb}</p>
          )}

          <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: '0 0 20px' }}>
            ${product.price.toFixed(2)}
          </div>

          {/* Size grid */}
          {product.variants && (
            <div style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: sizeError ? '#DC2626' : C.navy,
                margin: '0 0 8px', transition: 'color 0.2s',
              }}>
                {sizeError ? 'Pick a size' : 'Size'}
              </p>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
                animation: sizeError ? 'shake 0.3s ease' : undefined,
              }}>
                {product.variants.map(v => (
                  <button
                    key={v.value}
                    onClick={() => { setSelectedVariant(v.value); setSizeError(false); }}
                    style={{
                      padding: '12px 8px', borderRadius: 4, fontSize: 14, fontWeight: 600,
                      minHeight: 44, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      border: selectedVariant === v.value ? `2px solid ${C.navy}` : `1px solid ${C.border}`,
                      background: selectedVariant === v.value ? C.navy : C.white,
                      color: selectedVariant === v.value ? C.white : C.charcoal,
                      transition: 'all 0.15s',
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Accordion: details */}
          {product.details && <DetailsAccordion details={product.details} />}
        </div>

        {/* Fixed bottom: Add to cart / Added state */}
        <div style={{
          padding: '16px 24px', borderTop: `1px solid ${C.border}`,
          flexShrink: 0, background: C.white,
        }}>
          {addedState ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                flex: 1, background: C.gray, borderRadius: 6, padding: '14px 16px',
                fontSize: 14, fontWeight: 700, color: C.navy, textAlign: 'center',
              }}>
                Added
              </div>
              <button onClick={() => { onClose(); openCart(); }} style={{
                flex: 1, background: C.navy, color: C.white, borderRadius: 6,
                padding: '14px 16px', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
                View Cart
              </button>
            </div>
          ) : (
            <button onClick={handleAdd} style={{
              width: '100%', background: C.yellow, color: C.navy,
              padding: 16, borderRadius: 6, border: 'none', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              Add to Cart
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>
    </>
  );
}

function DetailsAccordion({ details }: { details: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: "'DM Sans', sans-serif",
      }}>
        Fit, Materials &amp; Care
        <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: 10 }}>&#9660;</span>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 16px', paddingBottom: 8 }}>
          {details}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CART DRAWER
   ═══════════════════════════════════════════════════════════════ */
function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/swag/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({
          productId: i.product.id, name: i.product.name, price: i.product.price,
          quantity: i.quantity, variant: i.variant, image: i.product.images[0],
        })) }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error(err); }
    finally { setCheckingOut(false); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 400 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 400,
        height: '100vh', background: C.white, borderLeft: `1px solid ${C.border}`,
        zIndex: 401, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '16px 24px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>
            Cart ({totalItems})
          </h3>
          <button onClick={closeCart} style={{
            width: 28, height: 28, borderRadius: 4, background: C.gray,
            border: 'none', cursor: 'pointer', fontSize: 14, color: C.muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>x</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <p style={{ fontSize: 14, color: C.muted, margin: '0 0 12px' }}>Nothing in here yet.</p>
              <button onClick={closeCart} style={{
                fontSize: 13, fontWeight: 600, color: C.navy, background: 'none',
                border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 16px',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>Back to the drop</button>
            </div>
          ) : items.map(item => (
            <div key={`${item.product.id}-${item.variant}`} style={{
              display: 'flex', gap: 12, padding: '14px 0', borderBottom: `1px solid ${C.gray}`,
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 4, background: C.gray, overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{item.product.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {[item.product.colorName, item.variant?.toUpperCase()].filter(Boolean).join(' / ')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)} style={qtyBtnStyle}>-</button>
                  <span style={{ fontWeight: 700, fontSize: 13, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)} style={qtyBtnStyle}>+</button>
                  <button onClick={() => removeItem(item.product.id, item.variant)} style={{
                    fontSize: 11, color: C.muted, background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginLeft: 'auto',
                    textDecoration: 'underline', textUnderlineOffset: 2,
                  }}>Remove</button>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.navy, flexShrink: 0, paddingTop: 2 }}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
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
            <button onClick={handleCheckout} disabled={checkingOut} style={{
              width: '100%', background: checkingOut ? C.muted : C.navy, color: C.white,
              padding: 14, borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 700,
              cursor: checkingOut ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              {checkingOut ? 'Redirecting...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 4, border: `1px solid ${C.border}`,
  background: C.white, cursor: 'pointer', fontSize: 14, fontWeight: 600,
  color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'DM Sans', sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function SwagPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAFAF8' }} />}>
      <SwagPageInner />
    </Suspense>
  );
}

function SwagPageInner() {
  const { openCart, totalItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerProduct, setDrawerProduct] = useState<SwagProduct | null>(null);

  // URL-synced world state
  const worldParam = searchParams.get('world');
  const world: World = worldParam === 'after' ? 'after-hours' : 'contract-hours';
  const setWorld = useCallback((w: World) => {
    const param = w === 'after-hours' ? 'after' : 'contract';
    router.replace(`/swag?world=${param}`, { scroll: false });
  }, [router]);

  // Sticky switcher
  const [switcherSticky, setSwitcherSticky] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setSwitcherSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const products = getProductsByDrop(world);
  const nonStickers = products.filter(p => p.category !== 'stickers');
  const stickers = getStickers(world);

  // Fade state
  const [fading, setFading] = useState(false);
  const switchWorld = (w: World) => {
    if (w === world) return;
    setFading(true);
    setTimeout(() => { setWorld(w); setFading(false); }, 200);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.warmBg, minHeight: '100vh' }}>
      <CartDrawer />
      {drawerProduct && <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} />}

      {/* ─── Hero: two worlds side by side ─── */}
      <div ref={heroRef} style={{ background: C.navy }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.yellow, margin: '0 0 8px', textAlign: 'center' }}>
            Back to School 2026
          </p>
          <h1 style={{
            fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, color: C.white, textAlign: 'center', margin: '0 0 32px', lineHeight: 1.2,
          }}>
            TDI Swag Shop
          </h1>
        </div>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        }}>
          {/* Contract Hours block */}
          <div
            onClick={() => switchWorld('contract-hours')}
            style={{
              aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', position: 'relative',
              cursor: 'pointer', border: world === 'contract-hours' ? `2px solid ${C.yellow}` : '2px solid transparent',
            }}
          >
            <img src={SWAG_PRODUCTS.find(p => p.id === 'ask-me-tee')?.images[0] || ''} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, color: C.white, margin: 0, lineHeight: 1.2 }}>
                Contract Hours
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                For the building. For the mission.
              </p>
            </div>
          </div>
          {/* After Hours block */}
          <div
            onClick={() => switchWorld('after-hours')}
            style={{
              aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', position: 'relative',
              cursor: 'pointer', border: world === 'after-hours' ? `2px solid ${C.yellow}` : '2px solid transparent',
            }}
          >
            <img src={SWAG_PRODUCTS.find(p => p.id === 'questions-hoodie')?.images[0] || ''} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, color: C.white, margin: 0, lineHeight: 1.2 }}>
                After Hours
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                No lesson plans required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky switcher bar ─── */}
      <div style={{
        position: switcherSticky ? 'fixed' : 'relative',
        top: switcherSticky ? 0 : undefined,
        left: 0, right: 0, zIndex: 50,
        background: C.white, borderBottom: `1px solid ${C.border}`,
        transition: 'box-shadow 0.2s',
        boxShadow: switcherSticky ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '10px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 4, background: C.gray, borderRadius: 4, padding: 2 }}>
            {(['contract-hours', 'after-hours'] as const).map(w => (
              <button key={w} onClick={() => switchWorld(w)} style={{
                padding: '8px 20px', borderRadius: 3, fontSize: 13, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: world === w ? C.navy : 'transparent',
                color: world === w ? C.white : C.muted,
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
              }}>
                {w === 'contract-hours' ? 'Contract Hours' : 'After Hours'}
              </button>
            ))}
          </div>
          <button onClick={openCart} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: C.navy,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && (
              <span style={{
                background: C.navy, color: C.white, fontSize: 10, fontWeight: 800,
                width: 18, height: 18, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>

      {/* Spacer when switcher is fixed */}
      {switcherSticky && <div style={{ height: 50 }} />}

      {/* ─── Product grid ─── */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '24px 24px 48px',
        opacity: fading ? 0 : 1, transition: 'opacity 0.2s ease',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20,
        }}>
          {nonStickers.map(p => (
            <ProductTile key={p.id} product={p} onOpen={() => setDrawerProduct(p)} />
          ))}
        </div>
      </div>

      {/* ─── Sticker Bar ─── */}
      {stickers.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.border}`, background: C.white }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
            <h2 style={{
              fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700,
              color: C.navy, margin: '0 0 14px',
            }}>
              The Sticker Bar
            </h2>
            <div style={{
              display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8,
              WebkitOverflowScrolling: 'touch' as const,
            }}>
              {stickers.map(p => (
                <StickerTile key={p.id} product={p} onOpen={() => setDrawerProduct(p)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Teams CTA ─── */}
      <div style={{
        borderTop: `1px solid ${C.border}`, padding: '40px 24px', textAlign: 'center',
        background: C.white,
      }}>
        <p style={{
          fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 700,
          color: C.navy, margin: '0 0 6px',
        }}>
          Outfitting a team?
        </p>
        <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px' }}>
          Staff appreciation, onboarding kits, PD day swag.
        </p>
        <a href="/contact" style={{
          display: 'inline-block', background: C.navy, color: C.white,
          padding: '12px 24px', borderRadius: 4, fontSize: 13, fontWeight: 700,
          textDecoration: 'none',
        }}>
          Start the Conversation
        </a>
      </div>
    </div>
  );
}
