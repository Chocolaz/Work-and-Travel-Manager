const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Log requests for debugging routing issues in Vercel
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}, Path: ${req.path}`);
  next();
});

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'wat-gen-z-brutal-secret-key-1298';

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create tables
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        onboarded INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exchange_rate (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        rate DOUBLE PRECISION NOT NULL,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS project_costs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL,
        note TEXT,
        date TEXT NOT NULL,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS savings_goal (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        target_amount DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS countdowns (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        next_payday TEXT,
        pay_cycle TEXT,
        next_rent_day TEXT,
        rent_amount DOUBLE PRECISION,
        weekly_expense_target DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        project_start_date TEXT DEFAULT '',
        project_end_date TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_type TEXT NOT NULL,
        title TEXT NOT NULL,
        hourly_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        tax_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        avg_hours_per_week DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        UNIQUE(user_id, job_type)
      );

      CREATE TABLE IF NOT EXISTS work_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_type TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        break_minutes INTEGER NOT NULL DEFAULT 0
      );
    `);
    console.log('Database tables successfully initialized.');
  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    client.release();
  }
};

initDb();

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.userId = verified.userId;
    req.username = verified.username;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token.' });
  }
}

// Create express Router to mount on both /api and / to handle stripped prefixes
const router = express.Router();

// ---------------- AUTH ENDPOINTS ----------------

// Register
router.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter all fields.' });
  }

  try {
    // Check if username already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username.trim()]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const userId = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Create user
      await client.query(
        'INSERT INTO users (id, username, password_hash, onboarded, created_at) VALUES ($1, $2, $3, 0, $4)',
        [userId, username.trim(), passwordHash, createdAt]
      );

      // 2. Seed default exchange rate
      await client.query(
        'INSERT INTO exchange_rate (user_id, rate, last_updated) VALUES ($1, $2, $3)',
        [userId, 35.00, createdAt]
      );

      // 3. Seed default savings goal (with 0 target)
      await client.query(
        'INSERT INTO savings_goal (user_id, title, target_amount, currency) VALUES ($1, $2, $3, $4)',
        [userId, 'เงินออมเพื่อการท่องเที่ยว 🗽', 0.0, 'USD']
      );

      // 4. Seed empty countdowns
      await client.query(
        'INSERT INTO countdowns (user_id, next_payday, pay_cycle, next_rent_day, rent_amount, weekly_expense_target, project_start_date, project_end_date) VALUES ($1, $2, $3, $4, $5, 0.0, \'\', \'\')',
        [userId, '', 'weekly', '', 0.0]
      );

      await client.query('COMMIT');
      
      const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ success: true, token, userId, username, onboarded: 0 });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Server error. Registration failed.' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter all fields.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username.trim()]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, userId: user.id, username: user.username, onboarded: user.onboarded });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Server error. Login failed.' });
  }
});

// Complete Onboarding Wizard
router.put('/auth/onboarded', authenticateToken, async (req, res) => {
  const userId = req.userId;
  try {
    await pool.query('UPDATE users SET onboarded = 1 WHERE id = $1', [userId]);
    res.json({ success: true, onboarded: 1 });
  } catch (err) {
    console.error('Failed to set onboarded status:', err);
    res.status(500).json({ error: 'Failed to update onboarding status.' });
  }
});

// ---------------- PROTECTED API ENDPOINTS ----------------

// Get all dashboard data
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const userResult = await pool.query('SELECT onboarded FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const rateResult = await pool.query('SELECT rate, last_updated FROM exchange_rate WHERE user_id = $1', [userId]);
    let rate = rateResult.rows[0];
    if (!rate || rate.rate === undefined || rate.rate === null || isNaN(parseFloat(rate.rate)) || parseFloat(rate.rate) <= 0) {
      rate = { rate: 35.00, last_updated: new Date().toISOString() };
    } else {
      rate.rate = parseFloat(rate.rate);
    }

    const costsResult = await pool.query('SELECT id, name, amount, currency FROM project_costs WHERE user_id = $1', [userId]);
    const projectCosts = costsResult.rows || [];
    projectCosts.forEach(c => {
      c.amount = parseFloat(c.amount) || 0;
    });

    const transactionsResult = await pool.query('SELECT id, type, category, amount, currency, note, date, created_at FROM transactions WHERE user_id = $1 ORDER BY date DESC, id DESC', [userId]);
    const transactions = transactionsResult.rows || [];
    transactions.forEach(t => {
      t.amount = parseFloat(t.amount) || 0;
    });

    const goalResult = await pool.query('SELECT title, target_amount, currency FROM savings_goal WHERE user_id = $1', [userId]);
    let savingsGoal = goalResult.rows[0];
    if (!savingsGoal || savingsGoal.target_amount === undefined || savingsGoal.target_amount === null || isNaN(parseFloat(savingsGoal.target_amount))) {
      savingsGoal = { title: 'เงินออมเพื่อการท่องเที่ยว 🗽', target_amount: 0.0, currency: 'USD' };
    } else {
      savingsGoal.target_amount = parseFloat(savingsGoal.target_amount);
    }

    const countdownResult = await pool.query('SELECT next_payday, pay_cycle, next_rent_day, rent_amount, weekly_expense_target, project_start_date, project_end_date FROM countdowns WHERE user_id = $1', [userId]);
    let countdowns = countdownResult.rows[0];
    if (!countdowns) {
      countdowns = { next_payday: '', pay_cycle: 'weekly', next_rent_day: '', rent_amount: 150.0, weekly_expense_target: 0.0, project_start_date: '', project_end_date: '' };
    } else {
      countdowns.rent_amount = parseFloat(countdowns.rent_amount) || 0;
      countdowns.weekly_expense_target = parseFloat(countdowns.weekly_expense_target) || 0;
      countdowns.project_start_date = countdowns.project_start_date || '';
      countdowns.project_end_date = countdowns.project_end_date || '';
    }

    // Fetch jobs - seed defaults if none exist
    const jobsResult = await pool.query('SELECT id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week FROM jobs WHERE user_id = $1', [userId]);
    let jobs = jobsResult.rows;
    if (!jobs || jobs.length === 0) {
      await pool.query(
        'INSERT INTO jobs (id, user_id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week) VALUES ($1, $2, $3, $4, $5, $6, 0.0) ON CONFLICT DO NOTHING',
        [crypto.randomUUID(), userId, 'main', 'งานหลัก (Main Job)', 15.0, 0.0]
      );
      const reFetchJobs = await pool.query('SELECT id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week FROM jobs WHERE user_id = $1', [userId]);
      jobs = reFetchJobs.rows;
    }
    jobs.forEach(j => { 
      j.hourly_rate = parseFloat(j.hourly_rate) || 0; 
      j.tax_rate = parseFloat(j.tax_rate) || 0; 
      j.avg_hours_per_week = parseFloat(j.avg_hours_per_week) || 0;
    });

    // Fetch work logs
    const workLogsResult = await pool.query('SELECT id, job_type, date, start_time, end_time, break_minutes FROM work_logs WHERE user_id = $1 ORDER BY date DESC, start_time DESC', [userId]);
    const workLogs = workLogsResult.rows || [];
    workLogs.forEach(w => { w.break_minutes = parseInt(w.break_minutes) || 0; });

    res.json({
      onboarded: user ? user.onboarded : 0,
      exchangeRate: { 
        rate: rate.rate, 
        lastUpdated: rate.last_updated || rate.lastUpdated || new Date().toISOString(),
        last_updated: rate.last_updated || rate.lastUpdated || new Date().toISOString()
      },
      projectCosts,
      transactions,
      savingsGoal: {
        title: savingsGoal.title,
        targetAmount: savingsGoal.target_amount,
        target_amount: savingsGoal.target_amount,
        currency: savingsGoal.currency
      },
      countdowns,
      jobs,
      workLogs
    });
  } catch (err) {
    console.error('Fetch data failed:', err);
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
});

// Create a transaction
router.post('/transactions', authenticateToken, async (req, res) => {
  const { type, category, amount, currency, note, date } = req.body;
  const userId = req.userId;

  if (!type || !category || amount === undefined || !currency || !date) {
    return res.status(400).json({ error: 'Please enter all required fields.' });
  }

  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0.' });
  }

  const txId = crypto.randomUUID();

  try {
    const timestamp = new Date().toISOString();
    await pool.query(`
      INSERT INTO transactions (id, user_id, type, category, amount, currency, note, date, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [txId, userId, type, category, parseFloat(amount), currency, note || '', date, timestamp]);

    const selectTxResult = await pool.query('SELECT id, type, category, amount, currency, note, date, created_at FROM transactions WHERE id = $1', [txId]);
    const newTx = selectTxResult.rows[0];

    res.status(201).json(newTx);
  } catch (err) {
    console.error('Insert transaction failed:', err);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
});

// Delete a transaction
router.delete('/transactions/:id', authenticateToken, async (req, res) => {
  const txId = req.params.id;
  const userId = req.userId;

  try {
    const checkTxResult = await pool.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [txId, userId]);
    const tx = checkTxResult.rows[0];

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }

    await pool.query('DELETE FROM transactions WHERE id = $1', [txId]);

    res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (err) {
    console.error('Delete transaction failed:', err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// Update Project Costs list
router.put('/project-costs', authenticateToken, async (req, res) => {
  const costs = req.body; // Array of { id, name, amount, currency }
  const userId = req.userId;

  if (!Array.isArray(costs)) {
    return res.status(400).json({ error: 'Invalid data format. Expected array.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM project_costs WHERE user_id = $1', [userId]);
    for (const item of costs) {
      const itemId = item.id || `pc-${crypto.randomUUID().slice(0, 8)}`;
      await client.query(
        'INSERT INTO project_costs (id, user_id, name, amount, currency) VALUES ($1, $2, $3, $4, $5)',
        [itemId, userId, item.name, parseFloat(item.amount) || 0, item.currency]
      );
    }
    await client.query('COMMIT');
    
    const selectCostsResult = await pool.query('SELECT id, name, amount, currency FROM project_costs WHERE user_id = $1', [userId]);
    res.json(selectCostsResult.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update project costs failed:', err);
    res.status(500).json({ error: 'Failed to update project costs.' });
  } finally {
    client.release();
  }
});

// Update Exchange Rate
router.put('/exchange-rate', authenticateToken, async (req, res) => {
  const { rate } = req.body;
  const userId = req.userId;

  const parsedRate = parseFloat(rate);
  if (rate === undefined || isNaN(parsedRate) || !isFinite(parsedRate) || parsedRate <= 0) {
    return res.status(400).json({ error: 'Rate must be a positive number.' });
  }

  try {
    const timestamp = new Date().toISOString();
    await pool.query(`
      INSERT INTO exchange_rate (user_id, rate, last_updated)
      VALUES ($1, $2, $3)
      ON CONFLICT(user_id) DO UPDATE SET rate = EXCLUDED.rate, last_updated = EXCLUDED.last_updated
    `, [userId, parsedRate, timestamp]);

    res.json({ 
      rate: parsedRate, 
      lastUpdated: timestamp,
      last_updated: timestamp
    });
  } catch (err) {
    console.error('Update exchange rate failed:', err);
    res.status(500).json({ error: 'Failed to update exchange rate.' });
  }
});

// Update Savings Goal
router.put('/goals', authenticateToken, async (req, res) => {
  const { title, targetAmount, currency } = req.body;
  const userId = req.userId;

  const parsedAmount = parseFloat(targetAmount);
  if (!title || targetAmount === undefined || isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount < 0 || !currency) {
    return res.status(400).json({ error: 'All fields are required and targetAmount must be a non-negative number.' });
  }

  try {
    await pool.query(`
      INSERT INTO savings_goal (user_id, title, target_amount, currency)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(user_id) DO UPDATE SET 
        title = EXCLUDED.title, 
        target_amount = EXCLUDED.target_amount, 
        currency = EXCLUDED.currency
    `, [userId, title.trim(), parsedAmount, currency]);

    res.json({ 
      title: title.trim(), 
      targetAmount: parsedAmount,
      target_amount: parsedAmount, 
      currency 
    });
  } catch (err) {
    console.error('Update savings goal failed:', err);
    res.status(500).json({ error: 'Failed to update savings goal.' });
  }
});

// Update Countdowns Settings
router.put('/countdowns', authenticateToken, async (req, res) => {
  const { nextPayday, payCycle, nextRentDay, rentAmount, weeklyExpenseTarget, projectStartDate, projectEndDate } = req.body;
  const userId = req.userId;

  try {
    await pool.query(`
      INSERT INTO countdowns (user_id, next_payday, pay_cycle, next_rent_day, rent_amount, weekly_expense_target, project_start_date, project_end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT(user_id) DO UPDATE SET
        next_payday = EXCLUDED.next_payday,
        pay_cycle = EXCLUDED.pay_cycle,
        next_rent_day = EXCLUDED.next_rent_day,
        rent_amount = EXCLUDED.rent_amount,
        weekly_expense_target = EXCLUDED.weekly_expense_target,
        project_start_date = EXCLUDED.project_start_date,
        project_end_date = EXCLUDED.project_end_date
    `, [
      userId,
      nextPayday || '',
      payCycle || 'weekly',
      nextRentDay || '',
      rentAmount !== undefined ? parseFloat(rentAmount) : 150,
      weeklyExpenseTarget !== undefined ? parseFloat(weeklyExpenseTarget) : 0,
      projectStartDate || '',
      projectEndDate || ''
    ]);

    res.json({
      next_payday: nextPayday || '',
      pay_cycle: payCycle || 'weekly',
      next_rent_day: nextRentDay || '',
      rent_amount: rentAmount !== undefined ? parseFloat(rentAmount) : 150,
      weekly_expense_target: weeklyExpenseTarget !== undefined ? parseFloat(weeklyExpenseTarget) : 0,
      project_start_date: projectStartDate || '',
      project_end_date: projectEndDate || ''
    });
  } catch (err) {
    console.error('Update countdowns failed:', err);
    res.status(500).json({ error: 'Failed to update countdown settings.' });
  }
});

// ---- JOBS ENDPOINTS ----

// Update job titles and rates (bulk PUT - supports adding, editing, and deleting)
router.put('/jobs', authenticateToken, async (req, res) => {
  const { jobs } = req.body;
  const userId = req.userId;
  if (!Array.isArray(jobs)) return res.status(400).json({ error: 'jobs must be an array.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Find jobs to keep (must have an id)
    const keepIds = jobs.filter(j => j.id).map(j => j.id);

    if (keepIds.length > 0) {
      // Find job_types of jobs to be deleted so we can cascade delete their work logs
      const queryParams = [userId, ...keepIds];
      const placeholders = keepIds.map((_, index) => `$${index + 2}`).join(',');
      const toDeleteResult = await client.query(
        `SELECT job_type FROM jobs WHERE user_id = $1 AND id NOT IN (${placeholders})`,
        queryParams
      );
      
      for (const td of toDeleteResult.rows) {
        await client.query('DELETE FROM work_logs WHERE user_id = $1 AND job_type = $2', [userId, td.job_type]);
      }
      
      await client.query(
        `DELETE FROM jobs WHERE user_id = $1 AND id NOT IN (${placeholders})`,
        queryParams
      );
    } else {
      // If empty list, delete everything
      await client.query('DELETE FROM work_logs WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM jobs WHERE user_id = $1', [userId]);
    }

    const upsertQuery = `
      INSERT INTO jobs (id, user_id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT(user_id, job_type) DO UPDATE SET 
        title = EXCLUDED.title, 
        hourly_rate = EXCLUDED.hourly_rate, 
        tax_rate = EXCLUDED.tax_rate,
        avg_hours_per_week = EXCLUDED.avg_hours_per_week
    `;

    for (const j of jobs) {
      const rate = parseFloat(j.hourly_rate);
      const tax = Math.min(100, Math.max(0, parseFloat(j.tax_rate) || 0));
      const avgHours = Math.max(0, parseFloat(j.avg_hours_per_week) || 0);
      if (!j.title || isNaN(rate) || rate < 0) continue;
      const finalId = j.id || crypto.randomUUID();
      const finalJobType = j.job_type || `job_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;
      await client.query(upsertQuery, [finalId, userId, finalJobType, j.title.trim(), rate, tax, avgHours]);
    }
    
    await client.query('COMMIT');
    
    const updatedResult = await pool.query('SELECT id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week FROM jobs WHERE user_id = $1', [userId]);
    const updated = updatedResult.rows;
    updated.forEach(j => { 
      j.hourly_rate = parseFloat(j.hourly_rate) || 0; 
      j.tax_rate = parseFloat(j.tax_rate) || 0; 
      j.avg_hours_per_week = parseFloat(j.avg_hours_per_week) || 0;
    });
    res.json(updated);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update jobs failed:', err);
    res.status(500).json({ error: 'Failed to update jobs.' });
  } finally {
    client.release();
  }
});

// ---- WORK LOGS ENDPOINTS ----

// Create a work log entry
router.post('/work-logs', authenticateToken, async (req, res) => {
  const { job_type, date, start_time, end_time, break_minutes } = req.body;
  const userId = req.userId;

  if (!job_type || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'job_type, date, start_time, end_time are required.' });
  }

  try {
    const id = crypto.randomUUID();
    const bm = parseInt(break_minutes) || 0;
    await pool.query(
      'INSERT INTO work_logs (id, user_id, job_type, date, start_time, end_time, break_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, userId, job_type, date, start_time, end_time, bm]
    );
    res.status(201).json({ id, job_type, date, start_time, end_time, break_minutes: bm });
  } catch (err) {
    console.error('Create work log failed:', err);
    res.status(500).json({ error: 'Failed to create work log.' });
  }
});

// Delete a work log entry
router.delete('/work-logs/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const result = await pool.query('DELETE FROM work_logs WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Work log not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete work log failed:', err);
    res.status(500).json({ error: 'Failed to delete work log.' });
  }
});

// Mount router under BOTH /api and / to handle stripped prefixes on Vercel
app.use('/api', router);
app.use('/', router);

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend Server listening at http://localhost:${PORT}`);
  });
}
module.exports = app;
