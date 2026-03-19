import React, { useState } from 'react';
import { useEmployees } from '../hooks';
import { Badge, Btn, Spinner, Empty, Card, ErrorBanner, toast } from '../components/UI';
import EmployeeForm from '../components/EmployeeForm';

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},35%,18%)`, color: `hsl(${hue},70%,65%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12.5, fontWeight: 600,
    }}>
      {initials}
    </div>
  );
}

export default function Employees() {
  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState('');
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filters = {};
  if (search) filters.search = search;
  if (roleFilter) filters.role = roleFilter;

  const { employees, loading, error, create, update, remove } = useEmployees(filters);

  const allRoles = [...new Set(employees.map(e => e.role))].sort();

  const handleSave = async (form) => {
    if (editing) {
      await update(form.id, form);
      toast.success(`${form.name} updated`);
    } else {
      await create(form);
      toast.success(`${form.name} added`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the system?`)) return;
    try {
      await remove(id);
      toast.success(`${name} removed`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <ErrorBanner message={error} />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or ID…"
          style={{
            flex: 1, padding: '9px 14px', borderRadius: 8, fontSize: 13.5,
            background: '#0a0d14', border: '1px solid #1e2230',
            color: '#e8eaf0', outline: 'none', fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = '#2563eb'}
          onBlur={e => e.target.style.borderColor = '#1e2230'}
        />
        <select
          value={roleFilter}
          onChange={e => setRole(e.target.value)}
          style={{
            padding: '9px 12px', borderRadius: 8, fontSize: 13,
            background: '#0a0d14', border: '1px solid #1e2230',
            color: '#e8eaf0', fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <option value="">All Roles</option>
          {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <Btn variant="primary" onClick={() => { setEditing(null); setModal(true); }}>
          + Add Employee
        </Btn>
      </div>

      {/* Table */}
      <Card padding={0}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead style={{ background: '#0a0d14' }}>
                <tr>
                  {['Name', 'ID', 'Role', 'Department', 'Email', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '12px 16px', fontSize: 11,
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
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={emp.name} />
                        <div>
                          <div style={{ fontWeight: 500, color: '#e8eaf0' }}>{emp.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4b5563' }}>{emp.id}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: '#1a2540', color: '#60a5fa', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                        {emp.role}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 13 }}>{emp.dept}</td>
                    <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 13 }}>{emp.email}</td>
                    <td style={{ padding: '13px 16px' }}><Badge status={emp.status} /></td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" onClick={() => { setEditing(emp); setModal(true); }}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => handleDelete(emp.id, emp.name)}>Remove</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length === 0 && (
              <Empty
                message={search || roleFilter ? 'No employees match your filters' : 'No employees yet'}
                hint={!search && !roleFilter ? 'Click "+ Add Employee" to get started' : 'Try clearing the search'}
              />
            )}
          </div>
        )}
      </Card>

      <div style={{ marginTop: 10, fontSize: 12, color: '#374151', textAlign: 'right' }}>
        {employees.length} employee{employees.length !== 1 ? 's' : ''} shown
      </div>

      <EmployeeForm
        open={modalOpen}
        onClose={() => setModal(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
