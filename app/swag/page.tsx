'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SWAG_PRODUCTS, CATEGORIES, type SwagProduct } from '@/lib/swag/products';
import { useCart, type CartItem } from '@/lib/swag/CartContext';

// ─── Product Card ────────────────────────────────────────
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
    <div style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
      <div style={{
        width: '100%', aspectRatio: '4/5', borderRadius: 12, background: '#ECEAE7',
        position: 'relative', overflow: 'hidden', marginBottom: 14,
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        {product.tag && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12, background: 'white',
            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#1e2749',
          }}>
            {product.tag}
          </div>
        )}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1e2749', marginBottom: 4 }}>{product.name}</div>
      <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>{product.description}</div>

      {product.variants && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {product.variants.map(v => (
            <button
              key={v.value}
              onClick={() => setSelectedVariant(v.value)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: selectedVariant === v.value ? '2px solid #1e2749' : '1.5px solid #E5E7EB',
                background: selectedVariant === v.value ? '#1e2749' : 'white',
                color: selectedVariant === v.value ? 'white' : '#6B7280',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1e2749' }}>
          ${product.price.toFixed(2)}
        </div>
        <button
          onClick={handleAdd}
          style={{
            background: added ? '#00B5AD' : 'none',
            border: `2px solid ${added ? '#00B5AD' : '#1e2749'}`,
            color: added ? 'white' : '#1e2749',
            padding: '8px 18px', borderRadius: 50, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { if (!added) { e.currentTarget.style.background = '#1e2749'; e.currentTarget.style.color = 'white'; } }}
          onMouseLeave={e => { if (!added) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1e2749'; } }}
        >
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

// ─── Sticker Card (compact) ──────────────────────────────
function StickerCard({ product }: { product: SwagProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div style={{ flex: '0 0 160px', cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
      <div style={{
        width: 160, height: 160, borderRadius: 12, background: '#F0EDEA',
        overflow: 'hidden', marginBottom: 10,
      }}>
        <img src={product.image} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e2749' }}>{product.name}</div>
      <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>${product.price.toFixed(2)}</div>
      <button onClick={handleAdd} style={{
        marginTop: 6, fontSize: 11, fontWeight: 700,
        color: added ? '#1e2749' : '#00B5AD',
        cursor: 'pointer', background: 'none', border: 'none', padding: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {added ? 'Added!' : '+ Add to Cart'}
      </button>
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
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            variant: i.variant,
            image: i.product.image,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={closeCart} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        zIndex: 199, transition: 'opacity 0.2s',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 400, height: '100vh',
        background: 'white', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        zIndex: 200, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid #F0F0EE',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>
            Your Cart ({totalItems})
          </h3>
          <button onClick={closeCart} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6',
            border: 'none', cursor: 'pointer', fontSize: 16, color: '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            x
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
              <p style={{ fontSize: 15, marginBottom: 8 }}>Your cart is empty</p>
              <p style={{ fontSize: 13 }}>Add some swag to get started!</p>
            </div>
          ) : (
            items.map(item => (
              <CartItemRow key={`${item.product.id}-${item.variant}`} item={item}
                onUpdate={(qty) => updateQuantity(item.product.id, qty, item.variant)}
                onRemove={() => removeItem(item.product.id, item.variant)}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '24px 28px', borderTop: '1px solid #F0F0EE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: '#6B7280' }}>Subtotal</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#1e2749' }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 18 }}>
              Shipping + tax calculated at checkout
            </div>
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

function CartItemRow({ item, onUpdate, onRemove }: {
  item: CartItem;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid #F3F4F6',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 10, background: '#F0EDEA',
        overflow: 'hidden', flexShrink: 0,
      }}>
        <img src={item.product.image} alt={item.product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e2749', marginBottom: 2 }}>{item.product.name}</div>
        {item.variant && (
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>
            Size: {item.variant.toUpperCase()}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => onUpdate(item.quantity - 1)} style={qtyBtnStyle}>-</button>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{item.quantity}</span>
          <button onClick={() => onUpdate(item.quantity + 1)} style={qtyBtnStyle}>+</button>
          <button onClick={onRemove} style={{
            fontSize: 11, color: '#DC2626', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginLeft: 8,
          }}>
            Remove
          </button>
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#1e2749', flexShrink: 0 }}>
        ${(item.product.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: '1.5px solid #E5E7EB',
  background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700,
  color: '#1e2749', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'DM Sans', sans-serif",
};

// ─── Main Page ───────────────────────────────────────────
export default function SwagPage() {
  const { openCart, totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');

  const apparel = SWAG_PRODUCTS.filter(p => p.category === 'apparel');
  const bags = SWAG_PRODUCTS.filter(p => p.category === 'bags');
  const hats = SWAG_PRODUCTS.filter(p => p.category === 'hats');
  const drinkware = SWAG_PRODUCTS.filter(p => p.category === 'drinkware');
  const stickers = SWAG_PRODUCTS.filter(p => p.category === 'stickers');
  const accessories = SWAG_PRODUCTS.filter(p => p.category === 'accessories');

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF8', minHeight: '100vh' }}>
      <CartSlideOver />

      {/* Sticky nav bar for swag */}
      <div style={{
        background: 'white', padding: '12px 24px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #F0F0EE', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700, color: '#1e2749', textDecoration: 'none' }}>
          Teachers Deserve It
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ color: '#6B7280', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Home</Link>
          <span style={{ color: '#1e2749', fontSize: 14, fontWeight: 700 }}>Swag</span>
          <button onClick={openCart} style={{
            position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e2749" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -8, background: '#00B5AD',
                color: 'white', fontSize: 10, fontWeight: 800, width: 18, height: 18,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {totalItems}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: '#F5F0EB' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '64px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48, alignItems: 'center',
        }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 2.5,
              textTransform: 'uppercase', color: '#00B5AD', marginBottom: 16,
            }}>
              Back to School 2026
            </div>
            <h1 style={{
              fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 700, lineHeight: 1.1, color: '#1e2749', marginBottom: 18, margin: '0 0 18px',
            }}>
              Wear the
              <span style={{
                fontFamily: "'Caveat', cursive", fontSize: 'clamp(38px, 6vw, 52px)',
                fontWeight: 600, color: '#00B5AD', display: 'block', marginTop: 4,
              }}>
                mission.
              </span>
            </h1>
            <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.6, marginBottom: 28 }}>
              Tees, totes, and tiny reminders that what you do matters. Every piece designed for educators, by educators.
            </p>
            <a href="#shop" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#1e2749', color: 'white', padding: '14px 28px',
              borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}>
              Shop the Collection
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          }}>
            {apparel.slice(0, 2).concat(bags.slice(0, 1), drinkware.slice(0, 1)).map((p, i) => (
              <div key={p.id} style={{
                aspectRatio: '1', borderRadius: 16, background: '#E8E3DD', overflow: 'hidden',
                marginTop: i === 1 ? 24 : i === 2 ? -24 : 0,
              }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apparel */}
      <div id="shop" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 24, borderBottom: '2px solid #1e2749', paddingBottom: 12,
        }}>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 700, margin: 0 }}>Apparel</h2>
        </div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 28, maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px',
      }}>
        {apparel.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Featured Banner */}
      <div style={{ maxWidth: 1200, margin: '0 auto 48px', padding: '0 24px' }}>
        <div style={{
          background: '#1e2749', borderRadius: 20, padding: 'clamp(32px, 4vw, 48px) clamp(24px, 4vw, 56px)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 40, alignItems: 'center',
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.2, margin: '0 0 12px',
            }}>
              Same Team. <span style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 500, color: '#5CE0D8' }}>Same Mission.</span> Different Job.
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Our flagship collection celebrates every role in the building. Teachers, paras, admins, counselors. Different titles, same team.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[...SWAG_PRODUCTS.filter(p => p.name.includes('Same Team'))].slice(0, 4).map(p => (
              <div key={p.id} style={{ aspectRatio: '1', borderRadius: 12, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bags & Hats */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 24, borderBottom: '2px solid #1e2749', paddingBottom: 12,
        }}>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 700, margin: 0 }}>Bags &amp; Hats</h2>
        </div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 28, maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px',
      }}>
        {[...bags, ...hats].map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Drinkware */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 24, borderBottom: '2px solid #1e2749', paddingBottom: 12,
        }}>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 700, margin: 0 }}>Drinkware &amp; Accessories</h2>
        </div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 28, maxWidth: 820, margin: '0 auto', padding: '0 24px 48px',
      }}>
        {[...drinkware, ...accessories].map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Stickers */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{
          fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 700,
          marginBottom: 20, borderBottom: '2px solid #1e2749', paddingBottom: 12,
        }}>
          Stickers
        </h2>
        <div style={{
          display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12,
          WebkitOverflowScrolling: 'touch',
        }}>
          {stickers.map(p => <StickerCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1e2749', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.8 }}>
          All items are print-on-demand, made just for you.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.8 }}>
          <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Teachers Deserve It</strong> &middot; 100% of proceeds support educator programs
        </p>
      </div>
    </div>
  );
}
