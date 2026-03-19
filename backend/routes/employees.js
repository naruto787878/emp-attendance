const router     = require('express').Router();
const { getDb, all, run } = require('../database');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { search, role, status } = req.query;
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      sql += ` AND (name LIKE '%${search}%' OR email LIKE '%${search}%' OR id LIKE '%${search}%')`;
    }
    if (role)   { sql += ' AND role = ?';   params.push(role);   }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY createdAt DESC';

    res.json(all(db, sql, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const db  = await getDb();
    const rows = all(db, 'SELECT * FROM employees WHERE id = ?', [req.params.id]);
    rows.length ? res.json(rows[0]) : res.status(404).json({ error: 'Not found' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { id, name, role, dept, email, status = 'absent' } = req.body;
    if (!id || !name || !role || !dept || !email)
      return res.status(400).json({ error: 'id, name, role, dept, email required' });

    run(db,
      'INSERT INTO employees (id,name,role,dept,email,status) VALUES (?,?,?,?,?,?)',
      [id.trim(), name.trim(), role.trim(), dept.trim(), email.trim().toLowerCase(), status]
    );
    res.status(201).json(all(db, 'SELECT * FROM employees WHERE id = ?', [id])[0]);
  } catch (e) {
    const msg = e.message.includes('UNIQUE') ? 'ID or email already exists' : e.message;
    res.status(400).json({ error: msg });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { name, role, dept, email, status, lat, lng, lastIn, hoursToday } = req.body;
    const fields = [];
    const params = [];

    if (name  !== undefined) { fields.push('name=?');       params.push(name);       }
    if (role  !== undefined) { fields.push('role=?');       params.push(role);       }
    if (dept  !== undefined) { fields.push('dept=?');       params.push(dept);       }
    if (email !== undefined) { fields.push('email=?');      params.push(email);      }
    if (status!== undefined) { fields.push('status=?');     params.push(status);     }
    if (lat   !== undefined) { fields.push('lat=?');        params.push(lat);        }
    if (lng   !== undefined) { fields.push('lng=?');        params.push(lng);        }
    if (lastIn!== undefined) { fields.push('lastIn=?');     params.push(lastIn);     }
    if (hoursToday !== undefined) { fields.push('hoursToday=?'); params.push(hoursToday); }

    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

    fields.push("updatedAt=datetime('now')");
    params.push(req.params.id);

    const result = run(db, `UPDATE employees SET ${fields.join(',')} WHERE id=?`, params);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });

    res.json(all(db, 'SELECT * FROM employees WHERE id = ?', [req.params.id])[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee removed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;