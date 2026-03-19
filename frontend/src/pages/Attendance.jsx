import React, { useState } from 'react';
import { useEmployees, useAttendanceLogs } from '../hooks';
import { Badge, Spinner, Empty, Card } from '../components/UI';

const today = new Date().toISOString().split('T')[0];

export default function Attendance() {
  const [tab, setTab] = useState('today');

  const { employees }                    = useEmployees();
  const { logs: todayLogs, loading }     = useAttendanceLogs({ date: today });
  const { logs: allLogs }                = useAttendanceLogs({});

  const getLastPunch = (empId, type, logs) => {
    const match = [...logs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .find(l => l.employeeId === empId && l.type === type);
    return match
      ? new Date(match.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : '—';
  };

  const tabs = [
    { key: 'today', label: "Today's Attendance" },
    { key: 'logs',  label: 'All Logs'           },
  ];

  const allSorted = [...allLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #1a1f2e', marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 20px', background: 'none', border: 'none',
            fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
            color: tab === t.key ? '#60a5fa' : '#6b7280',
            borderBottom: `2px solid ${tab === t.key ? '#2563eb' : 'transparent'}`,
            marginBottom: -1, fontWeight: tab === t.key ? 500 : 400,
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        tab === 'today' ? (
          <Card padding={0}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1f2e', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf0' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span style={{ fontSize: 12, color: '#4b5563' }}>{employees.length} employees</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead style={{ background: '#0a0d14' }}>
                  <tr>
                    {['Employee', 'Role', 'Check-In', 'Check-Out', 'Status', 'Location'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '11px 16px', fontSize: 11,
                        color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em',
                        fontWeight: 500, borderBottom: '1px solid #1a1f2e', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const inTime  = getLastPunch(emp.id, 'in', todayLogs);
                    const outTime = getLastPunch(emp.id, 'out', todayLogs);
                    const loc     = todayLogs.find(l => l.employeeId === emp.id && l.type === 'in');
                    return (
                      <tr key={emp.id}
                        style={{ borderBottom: '1px solid #1a1f2e', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#111520'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '13px 16px', fontWeight: 500, color: '#e8eaf0' }}>{emp.name}</td>
                        <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 13 }}>{emp.role}</td>
                        <td style={{ padding: '13px 16px', fontFamily: "'DM Mono', monospace", color: inTime !== '—' ? '#4ade80' : '#374151' }}>
                          {inTime}
                        </td>
                        <td style={{ padding: '13px 16px', fontFamily: "'DM Mono', monospace", color: outTime !== '—' ? '#f87171' : '#374151' }}>
                          {outTime}
                        </td>
                        <td style={{ padding: '13px 16px' }}><Badge status={emp.status} /></td>
                        <td style={{ padding: '13px 16px', fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: '#374151' }}>
                          {loc?.lat ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {employees.length === 0 && <Empty message="No employees found" />}
            </div>
          </Card>
        ) : (
          <Card padding={0}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1f2e', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf0' }}>All Attendance Logs</span>
              <span style={{ fontSize: 12, color: '#4b5563' }}>{allSorted.length} entries</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead style={{ background: '#0a0d14' }}>
                  <tr>
                    {['Timestamp', 'Employee', 'Type', 'Latitude', 'Longitude', 'Accuracy'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '11px 16px', fontSize: 11,
                        color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em',
                        fontWeight: 500, borderBottom: '1px solid #1a1f2e', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSorted.map((log, i) => (
                    <tr key={i}
                      style={{ borderBottom: '1px solid #1a1f2e', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#111520'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4b5563' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#e8eaf0' }}>{log.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: log.type === 'in' ? '#0f2a1a' : '#2a0f0f',
                          color: log.type === 'in' ? '#4ade80' : '#f87171',
                          padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                        }}>
                          {log.type === 'in' ? 'Check-In' : 'Check-Out'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4b5563' }}>
                        {log.lat != null ? log.lat.toFixed(6) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4b5563' }}>
                        {log.lng != null ? log.lng.toFixed(6) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4b5563' }}>
                        {log.accuracy != null ? `±${log.accuracy.toFixed(0)}m` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allSorted.length === 0 && <Empty message="No logs yet" hint="Submit check-ins to see data here" />}
            </div>
          </Card>
        )
      )}
    </div>
  );
}
