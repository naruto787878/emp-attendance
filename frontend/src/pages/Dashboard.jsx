import React from 'react';
import { StatCard, Badge, Spinner, Empty, Card, ErrorBanner } from '../components/UI';
import { useEmployees, useAttendanceLogs } from '../hooks';

function Avatar({ name, size = 34 }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},35%,18%)`, color: `hsl(${hue},70%,65%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function Dashboard() {
  const { employees, loading, error } = useEmployees();
  const { logs }                      = useAttendanceLogs({});

  const present = employees.filter(e => e.status === 'present').length;
  const absent  = employees.filter(e => e.status === 'absent').length;
  const late    = employees.filter(e => e.status === 'late').length;
  const leave   = employees.filter(e => e.status === 'leave').length;
  const totalHrs = employees.reduce((s, e) => s + (e.hoursToday || 0), 0).toFixed(1);
  const rate = employees.length ? Math.round((present / employees.length) * 100) : 0;

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  if (loading) return <Spinner />;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <ErrorBanner message={error} />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Employees" value={employees.length} sub="Active roster"              color="#2563eb" icon="◉" />
        <StatCard label="Present Today"   value={present}          sub={`${rate}% attendance rate`} color="#16a34a" icon="✓" />
        <StatCard label="Absent / Leave"  value={absent + leave}   sub={`${late} late arrival`}     color="#dc2626" icon="✕" />
        <StatCard label="Hours Logged"    value={`${totalHrs}h`}   sub={`${present + late} active`}  color="#d97706" icon="◷" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Live activity */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf0' }}>Live Activity</span>
            <span style={{
              fontSize: 10.5, background: '#0f2a1a', color: '#4ade80',
              padding: '3px 9px', borderRadius: 20, fontWeight: 500,
            }}>● Live</span>
          </div>

          {recentLogs.length === 0
            ? <Empty message="No activity yet" hint="Check-ins will appear here" />
            : recentLogs.map((log, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a1f2e' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: log.type === 'in' ? '#4ade80' : '#f87171',
                  marginTop: 5, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: '#e8eaf0', fontWeight: 500 }}>
                    {log.name}{' '}
                    <span style={{ fontWeight: 400, color: '#6b7280' }}>
                      {log.type === 'in' ? 'checked in' : 'checked out'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#374151', fontFamily: "'DM Mono', monospace", marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.lat ? `${log.lat.toFixed(4)}, ${log.lng.toFixed(4)}` : 'Location not captured'}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#4b5563', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          }
        </Card>

        {/* Status breakdown */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf0', marginBottom: 20 }}>Today's Breakdown</div>

          {[
            { label: 'Present',  count: present, color: '#4ade80' },
            { label: 'Absent',   count: absent,  color: '#f87171' },
            { label: 'Late',     count: late,    color: '#fb923c' },
            { label: 'On Leave', count: leave,   color: '#c084fc' },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: row.color }}>
                  {row.count} / {employees.length}
                </span>
              </div>
              <div style={{ height: 6, background: '#1a1f2e', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: row.color, borderRadius: 3,
                  width: `${employees.length ? (row.count / employees.length * 100) : 0}%`,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #1a1f2e', paddingTop: 16, marginTop: 4 }}>
            <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Last known locations
            </div>
            {employees.filter(e => e.lat).slice(0, 4).map(emp => (
              <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{emp.name.split(' ')[0]}</span>
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#374151' }}>
                  {emp.lat.toFixed(3)}, {emp.lng.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Roster table */}
      <Card padding={0}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a1f2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf0' }}>Employee Roster</span>
          <span style={{ fontSize: 12, color: '#4b5563' }}>{employees.length} employees</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#0a0d14' }}>
                {['Employee', 'ID', 'Role', 'Status', 'Last In', 'Coordinates', 'Hrs Today'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 16px', fontSize: 11,
                    color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em',
                    fontWeight: 500, borderBottom: '1px solid #1a1f2e', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}
                  style={{ borderBottom: '1px solid #1a1f2e', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#111520'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={emp.name} />
                      <span style={{ fontWeight: 500, color: '#e8eaf0' }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4b5563' }}>{emp.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#1a2540', color: '#60a5fa', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                      {emp.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}><Badge status={emp.status} /></td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{emp.lastIn || '—'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: '#374151' }}>
                    {emp.lat ? `${emp.lat.toFixed(4)}, ${emp.lng.toFixed(4)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>
                    {emp.hoursToday ? `${emp.hoursToday}h` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && <Empty message="No employees yet" hint="Add employees from the directory page" />}
        </div>
      </Card>
    </div>
  );
}
