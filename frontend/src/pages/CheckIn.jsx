import React, { useState } from 'react';
import { useEmployees, useAttendanceLogs, useGeolocation } from '../hooks';
import { attendanceAPI } from '../services/api';
import { Spinner, Card, toast } from '../components/UI';

export default function CheckIn() {
  const { employees, loading: empLoading } = useEmployees();
  const { logs, reload }                   = useAttendanceLogs({});
  const { geo, geoStatus, capture, reset } = useGeolocation();

  const [empId, setEmpId]    = useState('');
  const [type, setType]      = useState('in');
  const [submitting, setSub] = useState(false);

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);

  const handleSubmit = async () => {
    if (!empId) { toast.error('Please select an employee'); return; }
    if (!geo)   { toast.error('Capture location first'); return; }
    setSub(true);
    try {
      const emp = employees.find(e => e.id === empId);
      await attendanceAPI.punch({ employeeId: empId, type, lat: geo.lat, lng: geo.lng, accuracy: geo.accuracy });
      toast.success(`${emp?.name} ${type === 'in' ? 'checked in' : 'checked out'}`);
      reset();
      setEmpId('');
      await reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSub(false); }
  };

  const statusConfig = {
    idle:    { color: '#4b5563', label: 'Tap "Capture Location" to begin' },
    loading: { color: '#d97706', label: 'Detecting location…' },
    success: { color: '#4ade80', label: '✓ Real location captured' },
    mock:    { color: '#fb923c', label: '⚠ Simulated (demo mode)' },
  };
  const sc = statusConfig[geoStatus] || statusConfig.idle;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20, animation: 'fadeIn 0.3s ease' }}>

      {/* Left: Punch card */}
      <div>
        <div style={{
          background: 'linear-gradient(150deg, #1e3a8a 0%, #1e40af 60%, #1d4ed8 100%)',
          borderRadius: 16, padding: 28, marginBottom: 16,
        }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 6 }}>Geo Check-In / Out</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 24 }}>
            GPS coordinates are captured and stored with every punch.
          </div>

          {/* Employee picker */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
              Employee
            </label>
            {empLoading ? <Spinner size={20} /> : (
              <select
                value={empId}
                onChange={e => setEmpId(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13.5,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                <option value="">Select employee…</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                ))}
              </select>
            )}
          </div>

          {/* Type toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { value: 'in',  label: '→ Check In'  },
              { value: 'out', label: '← Check Out' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                style={{
                  padding: '10px', borderRadius: 8, fontFamily: 'inherit',
                  fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                  border: type === t.value ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  background: type === t.value ? '#fff' : 'transparent',
                  color: type === t.value ? '#1e40af' : 'rgba(255,255,255,0.7)',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Geo display */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Status</span>
              <span style={{ fontSize: 12, color: sc.color, fontWeight: 500 }}>{sc.label}</span>
            </div>
            {geo && (
              <>
                {[['Latitude', geo.lat.toFixed(6)], ['Longitude', geo.lng.toFixed(6)], ['Accuracy', geo.accuracy.toFixed(1) + 'm']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.85)' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Timestamp</span>
                  <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.85)' }}>
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={capture}
              disabled={geoStatus === 'loading'}
              style={{
                padding: '10px', borderRadius: 8, border: 'none',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
                cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer',
                background: '#fff', color: '#1e40af', transition: 'all 0.15s',
                opacity: geoStatus === 'loading' ? 0.7 : 1,
              }}
            >
              {geoStatus === 'loading' ? 'Locating…' : '📍 Capture Location'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !geo || !empId}
              style={{
                padding: '10px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.3)',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
                cursor: (submitting || !geo || !empId) ? 'not-allowed' : 'pointer',
                background: 'transparent', color: '#fff', transition: 'all 0.15s',
                opacity: (!geo || !empId) ? 0.4 : 1,
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Punch'}
            </button>
          </div>
        </div>

        {/* Map preview */}
        <Card>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf0', marginBottom: 12 }}>Location Preview</div>
          <div style={{
            background: '#0a0d14', border: '1px solid #1a1f2e', borderRadius: 8,
            height: 140, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{ fontSize: 28 }}>📍</div>
            {geo ? (
              <>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>Location captured</div>
                <div style={{ fontSize: 11.5, fontFamily: "'DM Mono', monospace", color: '#4b5563' }}>
                  {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
                </div>
                {geoStatus === 'mock' && (
                  <div style={{ fontSize: 11, color: '#d97706', background: '#2a1a0f', padding: '2px 8px', borderRadius: 4 }}>
                    Simulated coordinates
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 13, color: '#374151' }}>Capture location to preview</div>
            )}
          </div>
        </Card>
      </div>

      {/* Right: Recent punches */}
      <Card>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf0', marginBottom: 16 }}>
          Recent Punches
        </div>
        {recentLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#374151', fontSize: 14 }}>
            No punches recorded yet
          </div>
        ) : recentLogs.map((log, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #1a1f2e' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: log.type === 'in' ? '#0f2a1a' : '#2a0f0f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: log.type === 'in' ? '#4ade80' : '#f87171',
            }}>
              {log.type === 'in' ? '→' : '←'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf0' }}>{log.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
                {log.type === 'in' ? 'Checked In' : 'Checked Out'}
              </div>
              {log.lat && (
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#374151', marginTop: 2 }}>
                  {log.lat.toFixed(4)}, {log.lng.toFixed(4)}
                  {log.accuracy ? ` ±${log.accuracy.toFixed(0)}m` : ''}
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#4b5563', whiteSpace: 'nowrap' }}>
              {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
