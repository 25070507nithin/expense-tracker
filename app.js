const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// Create an Express app
const app = express();
const port = 3000;

// Use body-parser to parse incoming JSON requests
app.use(bodyParser.json());

// Set up the SQLite database
const db = new sqlite3.Database('./expense_tracker.db');

// Create the necessary tables if they don't already exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      category TEXT,
      amount REAL,
      date TEXT,
      description TEXT
    )
  `);
});

// Add a transaction
app.post('/transactions', (req, res) => {
  const { type, category, amount, date, description } = req.body;
  const sql = `INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [type, category, amount, date, description], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ message: 'Transaction added', id: this.lastID });
  });
});

// Get all transactions
app.get('/transactions', (req, res) => {
  db.all('SELECT * FROM transactions', [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ transactions: rows });
  });
});

// Get transaction by ID
app.get('/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ transaction: row });
  });
});

// Update a transaction by ID
app.put('/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { type, category, amount, date, description } = req.body;
  const sql = `UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?`;
  db.run(sql, [type, category, amount, date, description, id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Transaction updated' });
  });
});

// Delete a transaction by ID
app.delete('/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM transactions WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Transaction deleted' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
