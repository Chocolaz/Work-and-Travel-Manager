const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Secret key for JWT
const JWT_SECRET = 'wat-gen-z-brutal-secret-key-1298';

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    onboarded INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exchange_rate (
    user_id TEXT PRIMARY KEY,
    rate REAL NOT NULL,
    last_updated TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_costs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    note TEXT,
    date TEXT NOT NULL,
    created_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS savings_goal (
    user_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    target_amount REAL NOT NULL,
    currency TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS countdowns (
    user_id TEXT PRIMARY KEY,
    next_payday TEXT,
    pay_cycle TEXT,
    next_rent_day TEXT,
    rent_amount REAL,
    weekly_expense_target REAL NOT NULL DEFAULT 0.0,
    project_start_date TEXT DEFAULT '',
    project_end_date TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_type TEXT NOT NULL,
    title TEXT NOT NULL,
    hourly_rate REAL NOT NULL DEFAULT 0.0,
    tax_rate REAL NOT NULL DEFAULT 0.0,
    avg_hours_per_week REAL NOT NULL DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, job_type)
  );

  CREATE TABLE IF NOT EXISTS work_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_type TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    break_minutes INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Dynamic schema migration for older databases
try {
  db.exec('ALTER TABLE users ADD COLUMN onboarded INTEGER DEFAULT 0');
  console.log('Migration: Successfully added "onboarded" column to users table.');
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.log('Migration info (onboarded column):', err.message);
  }
}

try {
  db.exec('ALTER TABLE transactions ADD COLUMN created_at TEXT');
  console.log('Migration: Successfully added "created_at" column to transactions table.');
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.log('Migration info (created_at column):', err.message);
  }
}

// Migration: add tax_rate column to jobs if missing
try {
  db.exec('ALTER TABLE jobs ADD COLUMN tax_rate REAL NOT NULL DEFAULT 0.0');
  console.log('Migration: Successfully added "tax_rate" column to jobs table.');
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.log('Migration info (tax_rate column):', err.message);
  }
}

// Migration: add avg_hours_per_week column to jobs if missing
try {
  db.exec('ALTER TABLE jobs ADD COLUMN avg_hours_per_week REAL NOT NULL DEFAULT 0.0');
  console.log('Migration: Successfully added "avg_hours_per_week" column to jobs table.');
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.log('Migration info (avg_hours_per_week column):', err.message);
  }
}

// Migration: add weekly_expense_target column to countdowns if missing
try {
  db.exec('ALTER TABLE countdowns ADD COLUMN weekly_expense_target REAL NOT NULL DEFAULT 0.0');
  console.log('Migration: Successfully added "weekly_expense_target" column to countdowns table.');
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.log('Migration info (weekly_expense_target column):', err.message);
  }
}

// Migration: add project_start_date column to countdowns if missing
try {
  db.exec('ALTER TABLE countdowns ADD COLUMN project_start_date TEXT DEFAULT \'\'');
  console.log('Migration: Successfully added "project_start_date" column to countdowns table.');
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.log('Migration info (project_start_date column):', err.message);
  }
}

// Migration: add project_end_date column to countdowns if missing
try {
  db.exec('ALTER TABLE countdowns ADD COLUMN project_end_date TEXT DEFAULT \'\'');
  console.log('Migration: Successfully added "project_end_date" column to countdowns table.');
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.log('Migration info (project_end_date column):', err.message);
  }
}

// Migration: seed default jobs for existing users who have no jobs yet
try {
  const existingUsers = db.prepare('SELECT id FROM users').all();
  const insertDefaultJob = db.prepare(`
    INSERT OR IGNORE INTO jobs (id, user_id, job_type, title, hourly_rate, tax_rate)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const jobDefaults = [
    { type: 'main', title: 'งานหลัก (Main Job)', rate: 15.0, tax: 0.0 },
  ];
  const seedJobsTx = db.transaction((userId) => {
    jobDefaults.forEach(j => {
      insertDefaultJob.run(crypto.randomUUID(), userId, j.type, j.title, j.rate, j.tax);
    });
  });
  existingUsers.forEach(u => seedJobsTx(u.id));
} catch (err) {
  console.log('Jobs seed info:', err.message);
}

console.log('Database tables successfully initialized at:', dbPath);

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

// ---------------- AUTH ENDPOINTS ----------------

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter all fields.' });
  }

  // Check if username already exists
  const userCheckStmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const existingUser = userCheckStmt.get(username.trim());

  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists.' });
  }

  const userId = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString();

  // Begin Transaction to seed empty/initial user data (but NOT mock costs)
  const insertUser = db.prepare('INSERT INTO users (id, username, password_hash, onboarded, created_at) VALUES (?, ?, ?, 0, ?)');
  const insertRate = db.prepare('INSERT INTO exchange_rate (user_id, rate, last_updated) VALUES (?, ?, ?)');
  const insertGoal = db.prepare('INSERT INTO savings_goal (user_id, title, target_amount, currency) VALUES (?, ?, ?, ?)');
  const insertCountdown = db.prepare('INSERT INTO countdowns (user_id, next_payday, pay_cycle, next_rent_day, rent_amount, weekly_expense_target, project_start_date, project_end_date) VALUES (?, ?, ?, ?, ?, 0.0, \'\', \'\')');

  const registerTx = db.transaction(() => {
    // 1. Create user
    insertUser.run(userId, username.trim(), passwordHash, createdAt);

    // 2. Seed default exchange rate
    insertRate.run(userId, 35.00, createdAt);

    // 3. Seed default savings goal (with 0 target)
    insertGoal.run(userId, 'เงินออมเพื่อการท่องเที่ยว 🗽', 0.0, 'USD');

    // 4. Seed empty countdowns
    insertCountdown.run(userId, '', 'weekly', '', 0.0);
  });

  try {
    registerTx();
    
    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, userId, username, onboarded: 0 });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Server error. Registration failed.' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter all fields.' });
  }

  try {
    const userStmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = userStmt.get(username.trim());

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
app.put('/api/auth/onboarded', authenticateToken, (req, res) => {
  const userId = req.userId;
  try {
    const updateOnboardedStmt = db.prepare('UPDATE users SET onboarded = 1 WHERE id = ?');
    updateOnboardedStmt.run(userId);
    res.json({ success: true, onboarded: 1 });
  } catch (err) {
    console.error('Failed to set onboarded status:', err);
    res.status(500).json({ error: 'Failed to update onboarding status.' });
  }
});

// ---------------- PROTECTED API ENDPOINTS ----------------

// Get all dashboard data
app.get('/api/data', authenticateToken, (req, res) => {
  try {
    const userId = req.userId;

    const userStmt = db.prepare('SELECT onboarded FROM users WHERE id = ?');
    const user = userStmt.get(userId);

    const rateStmt = db.prepare('SELECT rate, last_updated FROM exchange_rate WHERE user_id = ?');
    let rate = rateStmt.get(userId);
    if (!rate || rate.rate === undefined || rate.rate === null || isNaN(parseFloat(rate.rate)) || parseFloat(rate.rate) <= 0) {
      rate = { rate: 35.00, last_updated: new Date().toISOString() };
    } else {
      rate.rate = parseFloat(rate.rate);
    }

    const costsStmt = db.prepare('SELECT id, name, amount, currency FROM project_costs WHERE user_id = ?');
    const projectCosts = costsStmt.all(userId) || [];
    projectCosts.forEach(c => {
      c.amount = parseFloat(c.amount) || 0;
    });

    const transactionsStmt = db.prepare('SELECT id, type, category, amount, currency, note, date, created_at FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC');
    const transactions = transactionsStmt.all(userId) || [];
    transactions.forEach(t => {
      t.amount = parseFloat(t.amount) || 0;
    });

    const goalStmt = db.prepare('SELECT title, target_amount, currency FROM savings_goal WHERE user_id = ?');
    let savingsGoal = goalStmt.get(userId);
    if (!savingsGoal || savingsGoal.target_amount === undefined || savingsGoal.target_amount === null || isNaN(parseFloat(savingsGoal.target_amount))) {
      savingsGoal = { title: 'เงินออมเพื่อการท่องเที่ยว 🗽', target_amount: 0.0, currency: 'USD' };
    } else {
      savingsGoal.target_amount = parseFloat(savingsGoal.target_amount);
    }

    const countdownStmt = db.prepare('SELECT next_payday, pay_cycle, next_rent_day, rent_amount, weekly_expense_target, project_start_date, project_end_date FROM countdowns WHERE user_id = ?');
    let countdowns = countdownStmt.get(userId);
    if (!countdowns) {
      countdowns = { next_payday: '', pay_cycle: 'weekly', next_rent_day: '', rent_amount: 150.0, weekly_expense_target: 0.0, project_start_date: '', project_end_date: '' };
    } else {
      countdowns.rent_amount = parseFloat(countdowns.rent_amount) || 0;
      countdowns.weekly_expense_target = parseFloat(countdowns.weekly_expense_target) || 0;
      countdowns.project_start_date = countdowns.project_start_date || '';
      countdowns.project_end_date = countdowns.project_end_date || '';
    }

    // Fetch jobs - seed defaults if none exist
    let jobs = db.prepare('SELECT id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week FROM jobs WHERE user_id = ? ORDER BY rowid').all(userId);
    if (!jobs || jobs.length === 0) {
      const insertDefaultJob = db.prepare('INSERT OR IGNORE INTO jobs (id, user_id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const jobDefaults = [
        { type: 'main', title: 'งานหลัก (Main Job)', rate: 15.0, tax: 0.0 },
      ];
      const seedTx = db.transaction(() => jobDefaults.forEach(j => insertDefaultJob.run(crypto.randomUUID(), userId, j.type, j.title, j.rate, j.tax, 0.0)));
      seedTx();
      jobs = db.prepare('SELECT id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week FROM jobs WHERE user_id = ? ORDER BY rowid').all(userId);
    }
    jobs.forEach(j => { 
      j.hourly_rate = parseFloat(j.hourly_rate) || 0; 
      j.tax_rate = parseFloat(j.tax_rate) || 0; 
      j.avg_hours_per_week = parseFloat(j.avg_hours_per_week) || 0;
    });

    // Fetch work logs
    const workLogs = db.prepare('SELECT id, job_type, date, start_time, end_time, break_minutes FROM work_logs WHERE user_id = ? ORDER BY date DESC, start_time DESC').all(userId);
    workLogs.forEach(w => { w.break_minutes = parseInt(w.break_minutes) || 0; });

    // Return with both camelCase and snake_case properties to prevent frontend key mismatch
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
app.post('/api/transactions', authenticateToken, (req, res) => {
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
    const insertTxStmt = db.prepare(`
      INSERT INTO transactions (id, user_id, type, category, amount, currency, note, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const timestamp = new Date().toISOString();
    insertTxStmt.run(txId, userId, type, category, parseFloat(amount), currency, note || '', date, timestamp);

    const selectTxStmt = db.prepare('SELECT id, type, category, amount, currency, note, date, created_at FROM transactions WHERE id = ?');
    const newTx = selectTxStmt.get(txId);

    res.status(201).json(newTx);
  } catch (err) {
    console.error('Insert transaction failed:', err);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
});

// Delete a transaction
app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
  const txId = req.params.id;
  const userId = req.userId;

  try {
    const checkTxStmt = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?');
    const tx = checkTxStmt.get(txId, userId);

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }

    const deleteStmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    deleteStmt.run(txId);

    res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (err) {
    console.error('Delete transaction failed:', err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// Update Project Costs list
app.put('/api/project-costs', authenticateToken, (req, res) => {
  const costs = req.body; // Array of { id, name, amount, currency }
  const userId = req.userId;

  if (!Array.isArray(costs)) {
    return res.status(400).json({ error: 'Invalid data format. Expected array.' });
  }

  const deleteOldStmt = db.prepare('DELETE FROM project_costs WHERE user_id = ?');
  const insertCostStmt = db.prepare('INSERT INTO project_costs (id, user_id, name, amount, currency) VALUES (?, ?, ?, ?, ?)');

  const updateCostsTx = db.transaction((costsList) => {
    deleteOldStmt.run(userId);
    for (const item of costsList) {
      const itemId = item.id || `pc-${crypto.randomUUID().slice(0, 8)}`;
      insertCostStmt.run(itemId, userId, item.name, parseFloat(item.amount) || 0, item.currency);
    }
  });

  try {
    updateCostsTx(costs);
    
    const selectCostsStmt = db.prepare('SELECT id, name, amount, currency FROM project_costs WHERE user_id = ?');
    const updatedCosts = selectCostsStmt.all(userId);
    res.json(updatedCosts);
  } catch (err) {
    console.error('Update project costs failed:', err);
    res.status(500).json({ error: 'Failed to update project costs.' });
  }
});

// Update Exchange Rate
app.put('/api/exchange-rate', authenticateToken, (req, res) => {
  const { rate } = req.body;
  const userId = req.userId;

  const parsedRate = parseFloat(rate);
  if (rate === undefined || isNaN(parsedRate) || !isFinite(parsedRate) || parsedRate <= 0) {
    return res.status(400).json({ error: 'Rate must be a positive number.' });
  }

  try {
    const updateRateStmt = db.prepare(`
      INSERT INTO exchange_rate (user_id, rate, last_updated)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET rate = excluded.rate, last_updated = excluded.last_updated
    `);
    const timestamp = new Date().toISOString();
    updateRateStmt.run(userId, parsedRate, timestamp);

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
app.put('/api/goals', authenticateToken, (req, res) => {
  const { title, targetAmount, currency } = req.body;
  const userId = req.userId;

  const parsedAmount = parseFloat(targetAmount);
  if (!title || targetAmount === undefined || isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount < 0 || !currency) {
    return res.status(400).json({ error: 'All fields are required and targetAmount must be a non-negative number.' });
  }

  try {
    const updateGoalStmt = db.prepare(`
      INSERT INTO savings_goal (user_id, title, target_amount, currency)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET 
        title = excluded.title, 
        target_amount = excluded.target_amount, 
        currency = excluded.currency
    `);
    
    updateGoalStmt.run(userId, title.trim(), parsedAmount, currency);

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
app.put('/api/countdowns', authenticateToken, (req, res) => {
  const { nextPayday, payCycle, nextRentDay, rentAmount, weeklyExpenseTarget, projectStartDate, projectEndDate } = req.body;
  const userId = req.userId;

  try {
    const updateCountdownStmt = db.prepare(`
      INSERT INTO countdowns (user_id, next_payday, pay_cycle, next_rent_day, rent_amount, weekly_expense_target, project_start_date, project_end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        next_payday = excluded.next_payday,
        pay_cycle = excluded.pay_cycle,
        next_rent_day = excluded.next_rent_day,
        rent_amount = excluded.rent_amount,
        weekly_expense_target = excluded.weekly_expense_target,
        project_start_date = excluded.project_start_date,
        project_end_date = excluded.project_end_date
    `);

    updateCountdownStmt.run(
      userId,
      nextPayday || '',
      payCycle || 'weekly',
      nextRentDay || '',
      rentAmount !== undefined ? parseFloat(rentAmount) : 150,
      weeklyExpenseTarget !== undefined ? parseFloat(weeklyExpenseTarget) : 0,
      projectStartDate || '',
      projectEndDate || ''
    );

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
app.put('/api/jobs', authenticateToken, (req, res) => {
  const { jobs } = req.body;
  const userId = req.userId;
  if (!Array.isArray(jobs)) return res.status(400).json({ error: 'jobs must be an array.' });

  try {
    const tx = db.transaction(() => {
      // Find jobs to keep (must have an id)
      const keepIds = jobs.filter(j => j.id).map(j => j.id);

      if (keepIds.length > 0) {
        // Find job_types of jobs to be deleted so we can cascade delete their work logs
        const placeholders = keepIds.map(() => '?').join(',');
        const toDelete = db.prepare(`SELECT job_type FROM jobs WHERE user_id = ? AND id NOT IN (${placeholders})`).all(userId, ...keepIds);
        
        for (const td of toDelete) {
          db.prepare('DELETE FROM work_logs WHERE user_id = ? AND job_type = ?').run(userId, td.job_type);
        }
        
        db.prepare(`DELETE FROM jobs WHERE user_id = ? AND id NOT IN (${placeholders})`).run(userId, ...keepIds);
      } else {
        // If empty list, delete everything
        db.prepare('DELETE FROM work_logs WHERE user_id = ?').run(userId);
        db.prepare('DELETE FROM jobs WHERE user_id = ?').run(userId);
      }

      const upsert = db.prepare(`
        INSERT INTO jobs (id, user_id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, job_type) DO UPDATE SET 
          title = excluded.title, 
          hourly_rate = excluded.hourly_rate, 
          tax_rate = excluded.tax_rate,
          avg_hours_per_week = excluded.avg_hours_per_week
      `);

      jobs.forEach(j => {
        const rate = parseFloat(j.hourly_rate);
        const tax = Math.min(100, Math.max(0, parseFloat(j.tax_rate) || 0));
        const avgHours = Math.max(0, parseFloat(j.avg_hours_per_week) || 0);
        if (!j.title || isNaN(rate) || rate < 0) return;
        const finalId = j.id || crypto.randomUUID();
        const finalJobType = j.job_type || `job_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;
        upsert.run(finalId, userId, finalJobType, j.title.trim(), rate, tax, avgHours);
      });
    });
    tx();
    
    const updated = db.prepare('SELECT id, job_type, title, hourly_rate, tax_rate, avg_hours_per_week FROM jobs WHERE user_id = ? ORDER BY rowid').all(userId);
    updated.forEach(j => { 
      j.hourly_rate = parseFloat(j.hourly_rate) || 0; 
      j.tax_rate = parseFloat(j.tax_rate) || 0; 
      j.avg_hours_per_week = parseFloat(j.avg_hours_per_week) || 0;
    });
    res.json(updated);
  } catch (err) {
    console.error('Update jobs failed:', err);
    res.status(500).json({ error: 'Failed to update jobs.' });
  }
});

// ---- WORK LOGS ENDPOINTS ----

// Create a work log entry
app.post('/api/work-logs', authenticateToken, (req, res) => {
  const { job_type, date, start_time, end_time, break_minutes } = req.body;
  const userId = req.userId;

  if (!job_type || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'job_type, date, start_time, end_time are required.' });
  }

  try {
    const id = crypto.randomUUID();
    const bm = parseInt(break_minutes) || 0;
    db.prepare('INSERT INTO work_logs (id, user_id, job_type, date, start_time, end_time, break_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, userId, job_type, date, start_time, end_time, bm);
    res.status(201).json({ id, job_type, date, start_time, end_time, break_minutes: bm });
  } catch (err) {
    console.error('Create work log failed:', err);
    res.status(500).json({ error: 'Failed to create work log.' });
  }
});

// Delete a work log entry
app.delete('/api/work-logs/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const result = db.prepare('DELETE FROM work_logs WHERE id = ? AND user_id = ?').run(id, userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Work log not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete work log failed:', err);
    res.status(500).json({ error: 'Failed to delete work log.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
});
