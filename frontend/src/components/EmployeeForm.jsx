import React, { useState, useEffect } from 'react';
import { Modal, Btn, Input, Select } from './UI';

const ROLES = [
  'Engineer', 'Designer', 'Product Manager', 'HR Specialist',
  'Data Analyst', 'DevOps', 'QA Engineer', 'Marketing',
];
const ROLE_TO_DEPT = {
  'Engineer': 'Engineering', 'Designer': 'Design',
  'Product Manager': 'Product', 'HR Specialist': 'HR',
  'Data Analyst': 'Data', 'DevOps': 'Infrastructure',
  'QA Engineer': 'Quality', 'Marketing': 'Marketing',
};

const BLANK = { id: '', name: '', role: 'Engineer', dept: 'Engineering', email: '', status: 'absent' };

export default function EmployeeForm({ open, onClose, onSave, initial }) {
  const [form, setForm]     = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : BLANK);
      setErrors({});
    }
  }, [initial, open]);

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'role') next.dept = ROLE_TO_DEPT[val] || f.dept;
      return next;
    });
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!initial && !form.id.trim()) errs.id = 'Employee ID is required';
    if (!initial && form.id && !/^EMP\d{3,}$/.test(form.id.trim())) {
      errs.id = 'Format: EMP001, EMP002, …';
    }
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setErrors({ general: e.message });
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!initial;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit — ${initial?.name}` : 'Add New Employee'}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Employee'}
          </Btn>
        </>
      }
    >
      {errors.general && (
        <div style={{ background: '#2a0f0f', border: '1px solid #7f1d1d', color: '#f87171',
          borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
          {errors.general}
        </div>
      )}

      {!isEdit && (
        <Input
          label="Employee ID *"
          placeholder="e.g. EMP009"
          value={form.id}
          onChange={set('id')}
          error={errors.id}
        />
      )}

      <Input
        label="Full Name *"
        placeholder="e.g. Alex Johnson"
        value={form.name}
        onChange={set('name')}
        error={errors.name}
      />

      <Select label="Role" value={form.role} onChange={set('role')}>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </Select>

      <div style={{ background: '#0a0d14', border: '1px solid #1e2230', borderRadius: 8,
        padding: '8px 12px', marginBottom: 16, fontSize: 13, color: '#6b7280' }}>
        Department: <span style={{ color: '#9ca3af' }}>{form.dept}</span>
      </div>

      <Input
        label="Email *"
        type="email"
        placeholder="name@company.com"
        value={form.email}
        onChange={set('email')}
        error={errors.email}
      />

      {isEdit && (
        <Select label="Status" value={form.status} onChange={set('status')}>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="leave">On Leave</option>
        </Select>
      )}
    </Modal>
  );
}
