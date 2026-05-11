const sqlite3 = require('sqlite3').verbose();

function openDatabase(filename) {
  return new sqlite3.Database(filename);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) return reject(error);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => (error ? reject(error) : resolve(row)));
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => (error ? reject(error) : resolve(rows)));
  });
}

async function initializeDatabase(db) {
  await run(db, `
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT DEFAULT '',
      receipt_filename TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function createExpense(db, expense) {
  const result = await run(db, `
    INSERT INTO expenses (title, category, amount, notes, receipt_filename)
    VALUES (?, ?, ?, ?, ?)
  `, [
    expense.title,
    expense.category,
    Number(expense.amount),
    expense.notes || '',
    expense.receiptFilename || null
  ]);

  return getExpense(db, result.id);
}

function listExpenses(db) {
  return all(db, 'SELECT * FROM expenses ORDER BY created_at DESC, id DESC');
}

function getExpense(db, id) {
  return get(db, 'SELECT * FROM expenses WHERE id = ?', [id]);
}

function deleteExpense(db, id) {
  return run(db, 'DELETE FROM expenses WHERE id = ?', [id]);
}

function summarizeByCategory(expenses) {
  return expenses.reduce((summary, expense) => {
    const amount = Number(expense.amount) || 0;
    summary[expense.category] = (summary[expense.category] || 0) + amount;
    return summary;
  }, {});
}

function searchExpensesUnsafe(db, term) {
  const query = `
    SELECT * FROM expenses
    WHERE title LIKE '%${term}%'
       OR category LIKE '%${term}%'
       OR notes LIKE '%${term}%'
    ORDER BY created_at DESC, id DESC
  `;

  return all(db, query);
}

module.exports = {
  all,
  createExpense,
  deleteExpense,
  get,
  getExpense,
  initializeDatabase,
  listExpenses,
  openDatabase,
  run,
  searchExpensesUnsafe,
  summarizeByCategory
};
