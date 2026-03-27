const router = require('express').Router();
const { getDb, all, run } = require('../database');

router.post('/punch', async (req, res) => {
  try {
    const db = await getDb();
    const { employeeId, type, lat, lng, accuracy, note = '', clientTime } = req.body;

    if (!employeeId || !type) {
      return res.status(400).json({ error: 'employeeId and type are required' });
    }

    const emps = all(db, 'SELECT * FROM employees WHERE id = ?', [employeeId]);
    if (!emps.length) return res.status(404).json({ error: 'Employee not found' });
    const emp = emps[0];

    // Use clientTime sent from browser (accurate local time)
    // Falls back to server time only if not provided
    const now      = clientTime ? new Date(clientTime) : new Date();
    const isoTime  = now.toISOString();

    // Format HH:MM in local time using the offset sent from client
    const timeStr  = now.toLocaleTimeString('en-IN', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const info = run(db,
      `INSERT INTO attendance_logs (employeeId, name, type, lat, lng, accuracy, note, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp.id, emp.name, type, lat || null, lng || null, accuracy || null, note, isoTime]
    );

    if (type === 'in') {
      run(db,
        `UPDATE employees SET status='present', lat=?, lng=?, lastIn=?, updatedAt=? WHERE id=?`,
        [lat || null, lng || null, timeStr, isoTime, employeeId]
      );
    } else {
      run(db,
        `UPDATE employees SET status='absent', updatedAt=? WHERE id=?`,
        [isoTime, employeeId]
      );
    }

    res.status(201).json({
      id: info.lastInsertRowid,
      employeeId, name: emp.name, type,
      lat, lng, accuracy, note,
      createdAt: isoTime,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { employeeId, type, date } = req.query;
    let sql = 'SELECT * FROM attendance_logs WHERE 1=1';
    const params = [];

    if (employeeId) { sql += ' AND employeeId = ?'; params.push(employeeId); }
    if (type)       { sql += ' AND type = ?';        params.push(type);       }
    if (date)       { sql += ` AND DATE(createdAt) = '${date}'`; }

    sql += ' ORDER BY createdAt DESC LIMIT 500';
    res.json(all(db, sql, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/hours-summary', async (req, res) => {
  try {
    const db   = await getDb();
    const emps = all(db, 'SELECT id, name FROM employees', []);

    const result = emps.map(emp => {
      const logs = all(db,
        'SELECT type, createdAt FROM attendance_logs WHERE employeeId = ? ORDER BY createdAt ASC',
        [emp.id]
      );
      let hours = 0, lastIn = null;
      logs.forEach(l => {
        if (l.type === 'in')  lastIn = new Date(l.createdAt);
        if (l.type === 'out' && lastIn) { hours += (new Date(l.createdAt) - lastIn) / 3_600_000; lastIn = null; }
      });
      return { employeeId: emp.id, name: emp.name, hours: parseFloat(hours.toFixed(2)) };
    });

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/today-summary', async (req, res) => {
  try {
    const db   = await getDb();
    const rows = all(db, `
      SELECT
        SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status='absent'  THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status='late'    THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status='leave'   THEN 1 ELSE 0 END) as onLeave,
        COUNT(*) as total
      FROM employees
    `, []);
    res.json({ date: new Date().toISOString().split('T')[0], ...rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;