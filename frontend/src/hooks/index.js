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
export function useGeolocation() {
  const [geo, setGeo]          = useState(null);
  const [geoStatus, setStatus] = useState('idle');

  const capture = () => {
    setStatus('loading');
    if (!navigator.geolocation) {
      useMock();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus('success');
      },
      () => useMock()
    );
  };

  const useMock = () => {
    setGeo({
      lat:      12.9716 + (Math.random() - 0.5) * 0.04,
      lng:      77.5946 + (Math.random() - 0.5) * 0.04,
      accuracy: 10 + Math.random() * 20,
    });
    setStatus('mock');
  };

  const reset = () => { setGeo(null); setStatus('idle'); };

  return { geo, geoStatus, capture, reset };
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
