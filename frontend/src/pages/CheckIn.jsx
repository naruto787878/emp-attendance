import React, { useState } from 'react';
import { useEmployees, useAttendanceLogs, useGeolocation } from '../hooks';
import { attendanceAPI } from '../services/api';
import { Spinner, Card, toast } from '../components/UI';
import MapPreview from '../components/MapPreview';

export default function CheckIn() {
  const { employees, loading: empLoading } = useEmployees();
  const { logs, reload }                   = useAttendanceLogs({});
  const { geo, geoStatus, errorMsg, method, capture, reset } = useGeolocation();

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
      await attendanceAPI.punch({
        employeeId: empId, type,
        lat: geo.lat, lng: geo.lng, accuracy: geo.accuracy,
      });
      toast.success(`${emp?.name} ${type === 'in' ? 'checked in' : 'checked out'} ✓`);
      reset();
      setEmpId('');
      await reload();
    } catch (e) {
      toast.error(e.message);
    } finally { setSub(false); }
  };

  const statusConfig = {
    idle:    { color: '#6b7280', label: 'Tap "Capture Location" to begin'  },
    loading: { color: '#d97706', label: '🔄 Waiting for GPS signal…'        },
    success: { color: '#4ade80', label: '✓ Real GPS location captured'      },
    error:   { color: '#f87171', label: '✕ Location failed'                 },
  };
  const sc = statusConfig[geoStatus] || statusConfig.idle;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, animation: 'fadeIn 0.3s ease' }}>

      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Punch card */}
        <div style={{
          background: 'linear-gradient(150deg, #1e3a8a 0%, #1e40af 60%, #1d4ed8 100%)',
          borderRadius: 16, padding: 24,
        }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Geo Check-In / Out</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 22 }}>
            GPS coordinates are captured and stored with every punch.
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Employee</label>
            {empLoading ? <Spinner size={20} /> : (
              <select value={empId} onChange={e => setEmpId(e.target.value)} style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13.5,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontFamily: 'inherit', cursor: 'pointer',
              }}>
                <option value="">Select employee…</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
              </select>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[{ value: 'in', label: '→ Check In' }, { value: 'out', label: '← Check Out' }].map(t => (
              <button key={t.value} onClick={() => setType(t.value)} style={{
                padding: '10px', borderRadius: 8, fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                border: type === t.value ? 'none' : '1px solid rgba(255,255,255,0.2)',
                background: type === t.value ? '#fff' : 'transparent',
                color: type === t.value ? '#1e40af' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (geo || errorMsg) ? 10 : 0 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Status</span>
              <span style={{ fontSize: 12, color: sc.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                {geoStatus === 'loading' && (
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#d97706',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}/>
                )}
                {sc.label}
              </span>
            </div>

            {/* Error message box */}
            {geoStatus === 'error' && errorMsg && (
              <div style={{
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.35)',
                fontSize: 12, color: '#fca5a5', lineHeight: 1.6,
              }}>
                {errorMsg}
              </div>
            )}

            {/* GPS loading hint */}
            {geoStatus === 'loading' && (
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                background: 'rgba(217,119,6,0.1)',
                border: '1px solid rgba(217,119,6,0.25)',
                fontSize: 12, color: '#fcd34d', lineHeight: 1.6,
              }}>
                Allow location access when Chrome asks. This may take up to 15 seconds…
              </div>
            )}

            {geo && (
              <>
                {[
                  ['Latitude',  geo.lat.toFixed(6)],
                  ['Longitude', geo.lng.toFixed(6)],
                  ['Accuracy',  method === 'ip' ? '~City level' : `±${geo.accuracy.toFixed(0)}m`],
                  ['Source',    method === 'gps' ? '📡 GPS' : method === 'wifi' ? '📶 WiFi/Network' : '🌐 IP Address'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.85)' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Time</span>
                  <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.85)' }}>{new Date().toLocaleTimeString()}</span>
                </div>
                {method === 'ip' && (
                  <div style={{
                    marginTop: 8, padding: '7px 10px', borderRadius: 6,
                    background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                    fontSize: 11, color: '#fcd34d', lineHeight: 1.5,
                  }}>
                    📍 Using IP-based location (city level). Enable Windows Location Services for precise GPS.
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={capture} disabled={geoStatus === 'loading'} style={{
              padding: '10px', borderRadius: 8, border: 'none',
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
              cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer',
              background: geoStatus === 'error' ? '#fecaca' : '#fff',
              color: geoStatus === 'error' ? '#991b1b' : '#1e40af',
              transition: 'all 0.15s',
              opacity: geoStatus === 'loading' ? 0.7 : 1,
            }}>
              {geoStatus === 'loading' ? '🔄 Locating…' : geoStatus === 'error' ? '↺ Retry' : '📍 Capture Location'}
            </button>
            <button onClick={handleSubmit} disabled={submitting || !geo || !empId} style={{
              padding: '10px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.3)',
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
              background: (!geo || !empId) ? 'transparent' : 'rgba(255,255,255,0.15)',
              color: '#fff', transition: 'all 0.15s',
              cursor: (submitting || !geo || !empId) ? 'not-allowed' : 'pointer',
              opacity: (!geo || !empId) ? 0.4 : 1,
            }}>
              {submitting ? 'Submitting…' : 'Submit Punch'}
            </button>
          </div>
        </div>

        {/* Recent punches */}
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf0', marginBottom: 14 }}>Recent Punches</div>
          {recentLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#374151', fontSize: 13 }}>No punches yet</div>
          ) : recentLogs.map((log, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #1a1f2e' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: log.type === 'in' ? '#0f2a1a' : '#2a0f0f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: log.type === 'in' ? '#4ade80' : '#f87171',
              }}>{log.type === 'in' ? '→' : '←'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#e8eaf0' }}>{log.name}</div>
                {log.lat && (
                  <div style={{ fontSize: 10.5, fontFamily: "'DM Mono', monospace", color: '#374151', marginTop: 1 }}>
                    {log.lat.toFixed(4)}, {log.lng.toFixed(4)}
                    {log.accuracy ? ` ±${log.accuracy.toFixed(0)}m` : ''}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: '#4b5563', whiteSpace: 'nowrap' }}>
                {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Right column: REAL MAP */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ flex: 1, padding: 0, overflow: 'hidden', minHeight: 460 }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid #1a1f2e',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf0' }}>Location Preview</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {geo && (
                <span style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 500,
                  background: method === 'gps' ? '#0f2a1a' : method === 'wifi' ? '#0f1a2a' : '#1c1a0a',
                  color:      method === 'gps' ? '#4ade80' : method === 'wifi' ? '#60a5fa' : '#fbbf24',
                }}>
                  {method === 'gps' ? '● GPS' : method === 'wifi' ? '● WiFi' : '● IP Location'}
                </span>
              )}
              {geoStatus === 'error' && (
                <span style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 500,
                  background: '#2a0f0f', color: '#f87171',
                }}>
                  ✕ Location Error
                </span>
              )}
              <span style={{ fontSize: 11, color: '#374151' }}>© OpenStreetMap</span>
            </div>
          </div>
          <div style={{ height: 'calc(100% - 50px)', minHeight: 410 }}>
            <MapPreview lat={geo?.lat} lng={geo?.lng} accuracy={geo?.accuracy} status={geoStatus} />
          </div>
        </Card>

        {recentLogs.filter(l => l.lat).length > 0 && (
          <Card>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf0', marginBottom: 12 }}>All Punch Locations</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {recentLogs.filter(l => l.lat).slice(0, 6).map((log, i) => (
                <div key={i} style={{ background: '#0a0d14', border: '1px solid #1a1f2e', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: log.type === 'in' ? '#4ade80' : '#f87171' }} />
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: '#e8eaf0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: 11, color: '#374151', marginLeft: 'auto' }}>
                      {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, fontFamily: "'DM Mono', monospace", color: '#4b5563' }}>
                    {log.lat.toFixed(4)}, {log.lng.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
