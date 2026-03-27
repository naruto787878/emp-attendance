import React, { useState, useEffect } from 'react';

// ── Toast ────────────────────────────────────────────────────────
let _addToast = () => {};
export const toast = {
  success: (msg) => _addToast({ msg, type: 'success' }),
  error:   (msg) => _addToast({ msg, type: 'error' }),
  info:    (msg) => _addToast({ msg, type: 'info' }),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  _addToast = (t) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { ...t, id }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 3500);
  };

  const colors = {
    success: { bg:'#0f2a1a', border:'#166534', text:'#4ade80' },
    error:   { bg:'#2a0f0f', border:'#7f1d1d', text:'#f87171' },
    info:    { bg:'#0f1a2a', border:'#1e3a5f', text:'#60a5fa' },
  };

  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => {
        const c = colors[t.type] || colors.info;
        return (
          <div key={t.id} style={{
            background:c.bg, border:`1px solid ${c.border}`, color:c.text,
            padding:'11px 18px', borderRadius:10, fontSize:13.5,
            display:'flex', alignItems:'center', gap:9,
            animation:'slideUp 0.25s ease',
            boxShadow:'0 4px 24px rgba(0,0,0,0.3)',
            minWidth:240,
          }}>
            <span style={{ fontSize:16, flexShrink:0 }}>
              {t.type==='success' ? '✓' : t.type==='error' ? '✕' : 'ℹ'}
            </span>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0,
      background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:500, animation:'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:16, padding:28, width:460, maxWidth:'95vw',
        boxShadow:'0 24px 64px rgba(0,0,0,0.3)',
        animation:'slideUp 0.2s ease',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <span style={{ fontSize:16, fontWeight:500, color:'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} style={{
            background:'none', border:'none', color:'var(--text-muted)',
            fontSize:22, cursor:'pointer', lineHeight:1, padding:'0 4px',
          }}>×</button>
        </div>
        <div>{children}</div>
        {footer && (
          <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end', gap:10 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────────
export function Btn({ children, onClick, variant='default', size='md', disabled, style: extra={} }) {
  const variants = {
    default: { background:'var(--bg-secondary)', color:'var(--text-secondary)', border:'1px solid var(--border)' },
    primary: { background:'var(--accent)',        color:'#fff',                  border:'none' },
    success: { background:'#14532d',              color:'#4ade80',               border:'1px solid #166534' },
    danger:  { background:'#450a0a',              color:'#f87171',               border:'1px solid #7f1d1d' },
    ghost:   { background:'transparent',          color:'var(--text-muted)',     border:'1px solid var(--border)' },
  };
  const v = variants[variant] || variants.default;
  return (
    <button disabled={disabled} onClick={onClick} style={{
      ...v, borderRadius:8, fontWeight:500, fontFamily:'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display:'inline-flex', alignItems:'center', gap:6,
      fontSize: size==='sm' ? 12.5 : 13.5,
      padding: size==='sm' ? '5px 12px' : '9px 18px',
      transition:'opacity 0.15s',
      ...extra,
    }}>
      {children}
    </button>
  );
}

// ── Status Badge ─────────────────────────────────────────────────
const STATUS_MAP = {
  present: { bg:'#0f2a1a', color:'#4ade80', dot:'#4ade80', label:'Present'  },
  absent:  { bg:'#2a0f0f', color:'#f87171', dot:'#f87171', label:'Absent'   },
  late:    { bg:'#2a1a0f', color:'#fb923c', dot:'#fb923c', label:'Late'     },
  leave:   { bg:'#1a0f2a', color:'#c084fc', dot:'#c084fc', label:'On Leave' },
};

export function Badge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.absent;
  return (
    <span style={{
      background:s.bg, color:s.color,
      padding:'3px 10px', borderRadius:20,
      fontSize:11.5, fontWeight:500,
      display:'inline-flex', alignItems:'center', gap:5,
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, display:'inline-block' }} />
      {s.label}
    </span>
  );
}

// ── Input ────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6, fontWeight:500 }}>{label}</label>}
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:'100%', padding:'9px 12px', borderRadius:8, fontSize:13.5,
          background:'var(--bg-input)',
          border:`1px solid ${error ? '#7f1d1d' : focused ? 'var(--accent)' : 'var(--border-input)'}`,
          color:'var(--text-primary)', outline:'none', boxSizing:'border-box',
          transition:'border-color 0.15s',
        }}
        {...props}
      />
      {error && <div style={{ fontSize:12, color:'#f87171', marginTop:4 }}>{error}</div>}
    </div>
  );
}

export function Select({ label, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', marginBottom:6, fontWeight:500 }}>{label}</label>}
      <select
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:'100%', padding:'9px 12px', borderRadius:8, fontSize:13.5,
          background:'var(--bg-input)',
          border:`1px solid ${focused ? 'var(--accent)' : 'var(--border-input)'}`,
          color:'var(--text-primary)', outline:'none', cursor:'pointer',
          transition:'border-color 0.15s',
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color='#2563eb', icon }) {
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:12, padding:'18px 20px',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:color, borderRadius:'3px 0 0 3px' }} />
      {icon && <div style={{ fontSize:20, marginBottom:10, opacity:0.6 }}>{icon}</div>}
      <div style={{ fontSize:11.5, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize:28, fontWeight:600, color:'var(--text-primary)', fontFamily:"'Syne',sans-serif", lineHeight:1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:12, color:'var(--text-faint)', marginTop:5 }}>{sub}</div>}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────
export function Card({ children, style: extra={}, padding=20 }) {
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:12, padding,
      ...extra,
    }}>
      {children}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────────
export function Spinner({ size=28 }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', padding:48 }}>
      <div style={{
        width:size, height:size, borderRadius:'50%',
        border:`2px solid var(--border)`,
        borderTopColor:'var(--accent)',
        animation:'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────
export function Empty({ message='No data found', hint }) {
  return (
    <div style={{ textAlign:'center', padding:'52px 24px', color:'var(--text-muted)' }}>
      <div style={{ fontSize:36, marginBottom:12, opacity:0.2 }}>◻</div>
      <div style={{ fontSize:14, marginBottom: hint ? 6 : 0 }}>{message}</div>
      {hint && <div style={{ fontSize:12, opacity:0.6 }}>{hint}</div>}
    </div>
  );
}

// ── Error Banner ─────────────────────────────────────────────────
export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background:'#2a0f0f', border:'1px solid #7f1d1d',
      color:'#f87171', borderRadius:10, padding:'12px 16px',
      fontSize:13.5, marginBottom:20,
      display:'flex', alignItems:'center', gap:10,
    }}>
      <span>✕</span> {message}
    </div>
  );
}
