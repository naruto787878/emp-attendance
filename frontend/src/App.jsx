import React, { useState, useEffect } from 'react';
import Dashboard  from './pages/Dashboard';
import Employees  from './pages/Employees';
import Attendance from './pages/Attendance';
import CheckIn    from './pages/CheckIn';
import Analytics  from './pages/Analytics';
import { ToastContainer } from './components/UI';
import { useClock } from './hooks';

const NAV = [
  { key: 'dashboard',  label: 'Dashboard',    icon: '▣' },
  { key: 'employees',  label: 'Employees',    icon: '◉' },
  { key: 'attendance', label: 'Attendance',   icon: '◷' },
  { key: 'checkin',    label: 'Geo Check-In', icon: '◎' },
  { key: 'analytics',  label: 'Analytics',    icon: '◈' },
];

const PAGES = {
  dashboard:  Dashboard,
  employees:  Employees,
  attendance: Attendance,
  checkin:    CheckIn,
  analytics:  Analytics,
};

const TITLES = {
  dashboard:  'Dashboard Overview',
  employees:  'Employee Directory',
  attendance: 'Attendance Tracker',
  checkin:    'Geo Check-In / Out',
  analytics:  'Analytics & Reports',
};

// ── Theme CSS variables ──────────────────────────────────────────
const DARK_THEME = {
  '--bg-app':       '#070a10',
  '--bg-sidebar':   '#0a0d14',
  '--bg-topbar':    '#0a0d14',
  '--bg-card':      '#0f1117',
  '--bg-input':     '#0a0d14',
  '--bg-row-hover': '#111520',
  '--bg-secondary': '#1a1f2e',
  '--bg-tag':       '#1a2540',
  '--border':       '#1a1f2e',
  '--border-input': '#1e2230',
  '--text-primary': '#e8eaf0',
  '--text-secondary':'#9ca3af',
  '--text-muted':   '#6b7280',
  '--text-faint':   '#374151',
  '--text-tag':     '#60a5fa',
  '--accent':       '#2563eb',
  '--accent-hover': '#1d4ed8',
  '--nav-active-bg':'#101828',
  '--scrollbar-bg': '#0a0d14',
  '--scrollbar-thumb':'#1e2230',
};

const LIGHT_THEME = {
  '--bg-app':       '#f1f5f9',
  '--bg-sidebar':   '#ffffff',
  '--bg-topbar':    '#ffffff',
  '--bg-card':      '#ffffff',
  '--bg-input':     '#f8fafc',
  '--bg-row-hover': '#f8fafc',
  '--bg-secondary': '#f1f5f9',
  '--bg-tag':       '#dbeafe',
  '--border':       '#e2e8f0',
  '--border-input': '#cbd5e1',
  '--text-primary': '#0f172a',
  '--text-secondary':'#475569',
  '--text-muted':   '#64748b',
  '--text-faint':   '#94a3b8',
  '--text-tag':     '#1d4ed8',
  '--accent':       '#2563eb',
  '--accent-hover': '#1d4ed8',
  '--nav-active-bg':'#eff6ff',
  '--scrollbar-bg': '#f1f5f9',
  '--scrollbar-thumb':'#cbd5e1',
};

function applyTheme(isDark) {
  const vars = isDark ? DARK_THEME : LIGHT_THEME;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

  // Update scrollbar styles dynamically
  let scrollStyle = document.getElementById('scrollbar-style');
  if (!scrollStyle) {
    scrollStyle = document.createElement('style');
    scrollStyle.id = 'scrollbar-style';
    document.head.appendChild(scrollStyle);
  }
  scrollStyle.textContent = `
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: ${vars['--scrollbar-bg']}; }
    ::-webkit-scrollbar-thumb { background: ${vars['--scrollbar-thumb']}; border-radius: 3px; }
    body { background: ${vars['--bg-app']}; color: ${vars['--text-primary']}; }
  `;
}

export default function App() {
  const [page, setPage]         = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark]     = useState(() => {
    const saved = localStorage.getItem('pulsehr-theme');
    return saved ? saved === 'dark' : true; // default dark
  });
  const clock = useClock();
  const Page  = PAGES[page];

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem('pulsehr-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(d => !d);

  // ── Inline styles using CSS variables ───────────────────────────
  const s = {
    app:      { display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg-app)', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", transition:'background 0.2s' },
    sidebar:  { width: collapsed ? 64 : 220, minWidth: collapsed ? 64 : 220, background:'var(--bg-sidebar)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', transition:'all 0.2s ease', overflow:'hidden' },
    topbar:   { background:'var(--bg-topbar)', borderBottom:'1px solid var(--border)', padding:'0 24px', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
    card:     { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12 },
    navItem:  (active) => ({
      display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start',
      gap:10, padding: collapsed ? '12px' : '10px 20px',
      width:'100%', background: active ? 'var(--nav-active-bg)' : 'none',
      border:'none', borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
      cursor:'pointer', color: active ? 'var(--accent)' : 'var(--text-muted)',
      fontSize:13.5, fontFamily:'inherit', fontWeight: active ? 500 : 400,
      margin:'1px 0', transition:'all 0.15s', whiteSpace:'nowrap', overflow:'hidden',
    }),
  };

  return (
    <div style={s.app}>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px',
          borderBottom:'1px solid var(--border)', marginBottom:12,
          display:'flex', alignItems:'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#fff', flexShrink:0 }}>
              ⬡
            </div>
            {!collapsed && (
              <span style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', fontFamily:"'Syne',sans-serif", letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>
                PulseHR
              </span>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontSize:18, padding:2 }} title="Collapse">
              ‹
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontSize:18, padding:'8px', margin:'0 auto 4px', display:'block' }} title="Expand">
            ›
          </button>
        )}

        {/* Nav */}
        <nav style={{ flex:1 }}>
          {NAV.map(n => {
            const active = page === n.key;
            return (
              <button key={n.key} onClick={() => setPage(n.key)} title={collapsed ? n.label : ''} style={s.navItem(active)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <span style={{ fontSize:15, flexShrink:0 }}>{n.icon}</span>
                {!collapsed && <span>{n.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Theme toggle in sidebar footer */}
        {!collapsed && (
          <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)' }}>
            <button
              onClick={toggleTheme}
              style={{
                width:'100%', padding:'8px 12px', borderRadius:8,
                background:'var(--bg-secondary)', border:'1px solid var(--border)',
                color:'var(--text-secondary)', fontSize:13, fontFamily:'inherit',
                cursor:'pointer', display:'flex', alignItems:'center', gap:8,
                transition:'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tag)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              <span style={{ fontSize:16 }}>{isDark ? '☀️' : '🌙'}</span>
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:10 }}>PulseHR v1.0 · SQLite</div>
          </div>
        )}

        {/* Collapsed theme toggle */}
        {collapsed && (
          <div style={{ padding:'12px 0', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'center' }}>
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, padding:8 }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Topbar */}
        <header style={s.topbar}>
          <div style={{ fontSize:15, fontWeight:500, color:'var(--text-primary)' }}>
            {TITLES[page]}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {/* Clock */}
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:13, fontFamily:"'DM Mono',monospace", color:'var(--text-muted)' }}>
                {clock.toLocaleTimeString()}
              </div>
              <div style={{ fontSize:11, color:'var(--text-faint)' }}>
                {clock.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
              </div>
            </div>

            {/* DB badge */}
            <div style={{ display:'flex', alignItems:'center', gap:6, background: isDark ? '#0f2a1a' : '#dcfce7', borderRadius:20, padding:'4px 10px' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block' }} />
              <span style={{ fontSize:11.5, color: isDark ? '#4ade80' : '#166534', fontWeight:500 }}>SQLite</span>
            </div>

            {/* Theme toggle button in topbar */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                width:36, height:36, borderRadius:8,
                background:'var(--bg-secondary)', border:'1px solid var(--border)',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', fontSize:16, transition:'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tag)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Avatar */}
            <div style={{
              width:34, height:34, borderRadius:'50%',
              background:'var(--bg-tag)', color:'var(--text-tag)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:600, cursor:'pointer',
              border:'1px solid var(--border)',
            }}>
              AD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflow:'auto', padding:24, background:'var(--bg-app)', transition:'background 0.2s' }}>
          <Page isDark={isDark} />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
