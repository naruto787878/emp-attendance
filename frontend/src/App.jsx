import React, { useState } from 'react';
import Dashboard  from './pages/Dashboard';
import Employees  from './pages/Employees';
import Attendance from './pages/Attendance';
import CheckIn    from './pages/CheckIn';
import Analytics  from './pages/Analytics';
import { ToastContainer } from './components/UI';
import { useClock } from './hooks';

const NAV = [
  { key: 'dashboard',  label: 'Dashboard',    icon: '▣', desc: 'Overview & stats'   },
  { key: 'employees',  label: 'Employees',    icon: '◉', desc: 'Manage roster'      },
  { key: 'attendance', label: 'Attendance',   icon: '◷', desc: 'Track daily status' },
  { key: 'checkin',    label: 'Geo Check-In', icon: '◎', desc: 'Punch in / out'     },
  { key: 'analytics',  label: 'Analytics',    icon: '◈', desc: 'Charts & reports'   },
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

export default function App() {
  const [page, setPage]         = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const clock                   = useClock();
  const Page                    = PAGES[page];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#070a10' }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 64 : 220,
        minWidth: collapsed ? 64 : 220,
        background: '#0a0d14',
        borderRight: '1px solid #1a1f2e',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          borderBottom: '1px solid #1a1f2e',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff', flexShrink: 0,
            }}>⬡</div>
            {!collapsed && (
              <span style={{
                fontSize: 15, fontWeight: 600, color: '#e8eaf0',
                fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}>PulseHR</span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 16, padding: 2 }}
              title="Collapse"
            >‹</button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: 'none', border: 'none', color: '#374151', cursor: 'pointer',
              fontSize: 16, padding: '8px', margin: '0 auto 4px', display: 'block',
            }}
            title="Expand"
          >›</button>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1 }}>
          {NAV.map(n => {
            const active = page === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setPage(n.key)}
                title={collapsed ? n.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: 10,
                  padding: collapsed ? '12px' : '10px 20px',
                  width: '100%',
                  background: active ? '#101828' : 'none',
                  border: 'none',
                  borderLeft: active ? '2px solid #2563eb' : '2px solid transparent',
                  cursor: 'pointer',
                  color: active ? '#60a5fa' : '#6b7280',
                  fontSize: 13.5,
                  fontFamily: 'inherit',
                  fontWeight: active ? 500 : 400,
                  margin: '1px 0',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#9ca3af'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#6b7280'; }}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{n.icon}</span>
                {!collapsed && <span>{n.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1f2e' }}>
            <div style={{ fontSize: 11, color: '#1e2230', marginBottom: 2 }}>PulseHR v1.0.0</div>
            <div style={{ fontSize: 11, color: '#1e2230' }}>SQLite · Express · React</div>
          </div>
        )}
      </aside>

      {/* ── Main content ────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          background: '#0a0d14',
          borderBottom: '1px solid #1a1f2e',
          padding: '0 24px',
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#e8eaf0' }}>{TITLES[page]}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Live clock */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: '#4b5563' }}>
                {clock.toLocaleTimeString()}
              </div>
              <div style={{ fontSize: 11, color: '#374151' }}>
                {clock.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Backend status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f2a1a', borderRadius: 20, padding: '4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span style={{ fontSize: 11.5, color: '#4ade80', fontWeight: 500 }}>SQLite</span>
            </div>

            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1e2a4a', color: '#60a5fa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: '1px solid #1e2230',
            }}>
              AD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <Page />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
