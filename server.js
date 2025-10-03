const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'RideBookPass2025';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Determine whether to use Postgres or SQLite based on environment
const usePostgres = !!process.env.DATABASE_URL;
let dbClient;

// Initialise database
async function initDb() {
  if (usePostgres) {
    const { Pool } = require('pg');
    dbClient = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    // Create table if it doesn't exist
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY,
        driverId TEXT,
        name TEXT,
        phone TEXT,
        pickup TEXT,
        dropoff TEXT,
        datetime TEXT,
        notes TEXT,
        special_code TEXT,
        special_type TEXT,
        discount INT,
        is_special BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    const sqlite3 = require('sqlite3').verbose();
    dbClient = new sqlite3.Database(path.join(__dirname, 'bookings.db'));
    dbClient.serialize(() => {
      dbClient.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          driverId TEXT,
          name TEXT,
          phone TEXT,
          pickup TEXT,
          dropoff TEXT,
          datetime TEXT,
          notes TEXT,
          special_code TEXT,
          special_type TEXT,
          discount INTEGER,
          is_special INTEGER,
          created_at TEXT
        )
      `);
    });
  }
}

// Special codes mapping
const specialCodes = {
  BARSTAFF2025: { type: 'Bar/Club Staff', discount: 5 },
  NIGHTSHIFT2025: { type: 'Night Shift Worker', discount: 7 },
  SECURITY2025: { type: 'Security', discount: 10 }
};

function getSpecialMeta(code) {
  const entry = specialCodes[code];
  if (entry) {
    return { isSpecial: true, specialType: entry.type, discount: entry.discount };
  }
  return { isSpecial: false, specialType: null, discount: 0 };
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/create-link');
});

app.get('/create-link', (req, res) => {
  res.render('create-link', { host: req.get('host') });
});

app.get('/book/:driverId', (req, res) => {
  const driverId = req.params.driverId;
  res.render('book', { driverId });
});

app.post('/api/book', async (req, res) => {
  const { driverId, name, phone, pickup, dropoff, datetime, notes, specialCode } = req.body;
  if (!driverId || !name || !phone || !pickup || !dropoff || !datetime) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  const id = uuidv4();
  const meta = getSpecialMeta(specialCode);
  const created_at = new Date().toISOString();
  if (usePostgres) {
    try {
      await dbClient.query(
        `INSERT INTO bookings (id, driverId, name, phone, pickup, dropoff, datetime, notes, special_code, special_type, discount, is_special, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          id,
          driverId,
          name,
          phone,
          pickup,
          dropoff,
          datetime,
          notes || '',
          specialCode || '',
          meta.specialType,
          meta.discount,
          meta.isSpecial,
          created_at
        ]
      );
      return res.json({ ok: true, bookingId: id, confirmUrl: `/confirm/${id}` });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'DB error' });
    }
  } else {
    dbClient.serialize(() => {
      const stmt = dbClient.prepare(
        `INSERT INTO bookings (id, driverId, name, phone, pickup, dropoff, datetime, notes, special_code, special_type, discount, is_special, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run(
        id,
        driverId,
        name,
        phone,
        pickup,
        dropoff,
        datetime,
        notes || '',
        specialCode || '',
        meta.specialType,
        meta.discount,
        meta.isSpecial ? 1 : 0,
        created_at,
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: 'DB error' });
          }
          res.json({ ok: true, bookingId: id, confirmUrl: `/confirm/${id}` });
        }
      );
      stmt.finalize();
    });
  }
});

app.get('/confirm/:id', async (req, res) => {
  const id = req.params.id;
  if (usePostgres) {
    try {
      const result = await dbClient.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).send('Booking not found');
      }
      res.render('confirm', { booking: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send('DB error');
    }
  } else {
    dbClient.get(`SELECT * FROM bookings WHERE id = ?`, [id], (err, row) => {
      if (err || !row) {
        return res.status(404).send('Booking not found');
      }
      res.render('confirm', { booking: row });
    });
  }
});

app.get('/admin', async (req, res) => {
  const pass = req.query.pass || '';
  if (pass !== ADMIN_PASS) {
    return res.render('admin-login', { error: pass ? 'Bad password' : null });
  }
  if (usePostgres) {
    try {
      const result = await dbClient.query(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 500`);
      res.render('admin', { bookings: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).send('DB error');
    }
  } else {
    dbClient.all(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 500`, [], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('DB error');
      }
      res.render('admin', { bookings: rows });
    });
  }
});

app.get('/api/bookings/:driverId', async (req, res) => {
  const driverId = req.params.driverId;
  if (usePostgres) {
    try {
      const result = await dbClient.query(`SELECT * FROM bookings WHERE driverId = $1 ORDER BY created_at DESC`, [driverId]);
      res.json({ ok: true, bookings: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false });
    }
  } else {
    dbClient.all(`SELECT * FROM bookings WHERE driverId = ? ORDER BY created_at DESC`, [driverId], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ ok: false });
      }
      res.json({ ok: true, bookings: rows });
    });
  }
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`3DSpress app running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database', err);
});