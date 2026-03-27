import { useState, useEffect, useCallback } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';

// ── Employees ───────────────────────────────────────────────────
export function useEmployees(filters = {}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeAPI.getAll(filters);
      setEmployees(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line
  }, [JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  const create = async (body) => { await employeeAPI.create(body); await load(); };
  const update = async (id, body) => { await employeeAPI.update(id, body); await load(); };
  const remove = async (id) => { await employeeAPI.remove(id); await load(); };

  return { employees, loading, error, reload: load, create, update, remove };
}

// ── Attendance Logs ─────────────────────────────────────────────
export function useAttendanceLogs(params = {}) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceAPI.getLogs(params);
      setLogs(data);
    } catch (_) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { logs, loading, reload: load };
}

// ── Hours Summary ───────────────────────────────────────────────
export function useHoursSummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.hoursSummary()
      .then(setSummary)
      .catch(() => setSummary([]))
      .finally(() => setLoading(false));
  }, []);

  return { summary, loading };
}

// ── Geolocation ─────────────────────────────────────────────────
// Strategy:
// 1. watchPosition with high accuracy — keeps improving as signals come in
// 2. Stops automatically when accuracy < 50m or after 15 seconds
// 3. Falls back to IP geolocation if browser GPS fails
export function useGeolocation() {
  const [geo, setGeo]          = useState(null);
  const [geoStatus, setStatus] = useState('idle');
  const [errorMsg, setError]   = useState('');
  const [method, setMethod]    = useState(''); // 'gps' | 'wifi' | 'network' | 'ip'

  // ── IP geolocation fallback — tries 3 free APIs ───────────────
  const getIPLocation = async () => {
    const apis = [
      {
        url: 'https://ipapi.co/json/',
        parse: d => ({ lat: d.latitude, lng: d.longitude, city: d.city }),
      },
      {
        url: 'https://ipwho.is/',
        parse: d => ({ lat: d.latitude, lng: d.longitude, city: d.city }),
      },
      {
        url: 'https://ip-api.com/json/?fields=lat,lon,city',
        parse: d => ({ lat: d.lat, lng: d.lon, city: d.city }),
      },
    ];

    for (const api of apis) {
      try {
        const res  = await fetch(api.url);
        const data = await res.json();
        const loc  = api.parse(data);
        if (loc.lat && loc.lng) return loc;
      } catch (_) {}
    }
    return null;
  };

  const capture = () => {
    setStatus('loading');
    setError('');
    setMethod('');

    // ── No geolocation support → straight to IP ──────────────────
    if (!navigator.geolocation) {
      getIPLocation().then(result => {
        if (result) {
          setGeo({ lat: result.lat, lng: result.lng, accuracy: 5000 });
          setMethod('ip');
          setStatus('success');
        } else {
          setError('Location not available. Try Chrome or Edge browser.');
          setStatus('error');
        }
      });
      return;
    }

    let bestAccuracy = Infinity;
    let resolved     = false;
    let watchId      = null;

    // ── watchPosition: streams improving location readings ────────
    // Each reading is more accurate than the last as more signals lock in
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;

        // Only update if this reading is better than what we have
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          resolved     = true;

          setGeo({ lat, lng, accuracy });
          setStatus('success');
          setError('');

          // Label the source based on accuracy
          if (accuracy <= 20)  setMethod('gps');     // GPS chip
          else if (accuracy <= 200) setMethod('wifi');    // WiFi positioning
          else                 setMethod('network'); // cell/network

          // Good enough — stop watching to save battery
          if (accuracy <= 50 && watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
          }
        }
      },
      async (err) => {
        // Browser GPS fully failed — use IP location as fallback
        if (!resolved) {
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
          }

          const result = await getIPLocation();
          if (result) {
            setGeo({ lat: result.lat, lng: result.lng, accuracy: 5000 });
            setMethod('ip');
            setStatus('success');
            setError('');
          } else {
            const messages = {
              1: 'Permission denied. Click 🔒 in Chrome address bar → Site settings → Location → Allow.',
              2: 'Location unavailable. Go to Windows Settings → Privacy & Security → Location → turn ON.',
              3: 'Timed out. Using IP location as fallback — enable Windows Location for better accuracy.',
            };
            setError(messages[err.code] || err.message);
            setStatus('error');
          }
        }
      },
      {
        enableHighAccuracy: true, // use GPS + WiFi + network all at once
        timeout:            8000, // 8 sec per individual reading attempt
        maximumAge:         0,    // never use cached — always fresh
      }
    );

    // Hard stop after 15 seconds — take whatever best result we got
    setTimeout(() => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        // If still no result after 15s, fall back to IP
        if (!resolved) {
          getIPLocation().then(result => {
            if (result) {
              setGeo({ lat: result.lat, lng: result.lng, accuracy: 5000 });
              setMethod('ip');
              setStatus('success');
              setError('');
            } else {
              setError('Location timed out. Enable Windows Location Services for accurate results.');
              setStatus('error');
            }
          });
        }
      }
    }, 15000);
  };

  const reset = () => {
    setGeo(null);
    setStatus('idle');
    setError('');
    setMethod('');
  };

  return { geo, geoStatus, errorMsg, method, capture, reset };
}

// ── Live Clock ──────────────────────────────────────────────────
export function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}