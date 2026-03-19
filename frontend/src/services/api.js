const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  try {
    const res  = await fetch(`${API}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
  } catch (e) {
    if (e.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Make sure backend is running on port 5000.');
    }
    throw e;
  }
}

export const employeeAPI = {
  getAll:  (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/employees${q ? '?' + q : ''}`);
  },
  getOne:  (id)        => request(`/employees/${id}`),
  create:  (body)      => request('/employees', { method: 'POST', body: JSON.stringify(body) }),
  update:  (id, body)  => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove:  (id)        => request(`/employees/${id}`, { method: 'DELETE' }),
};

export const attendanceAPI = {
  punch:        (body)   => request('/attendance/punch', { method: 'POST', body: JSON.stringify(body) }),
  getLogs:      (params) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/attendance${q ? '?' + q : ''}`);
  },
  hoursSummary: () => request('/attendance/hours-summary'),
  todaySummary: () => request('/attendance/today-summary'),
};
