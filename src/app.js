const express = require('express');
const fs = require('fs');
const path = require('path');

const { createExpenseRouter } = require('./routes/expenses');
const { initializeDatabase, openDatabase } = require('./db');

function createApp(options = {}) {
  const app = express();
  const dataDir = options.dataDir || path.join(process.cwd(), '.expense-tracker-data');
  const uploadDir = options.uploadDir || path.join(dataDir, 'receipts');
  const databaseFile = options.databaseFile || path.join(dataDir, 'expenses.sqlite');

  fs.mkdirSync(uploadDir, { recursive: true });

  const db = options.db || openDatabase(databaseFile);
  const ready = initializeDatabase(db);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.use('/public', express.static(path.join(__dirname, '..', 'public')));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(async (req, res, next) => {
    try {
      await ready;
      next();
    } catch (error) {
      next(error);
    }
  });

  app.get('/', (req, res) => {
    res.redirect('/expenses');
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', app: 'ghas-expense-tracker' });
  });

  app.use('/', createExpenseRouter({ db, dataDir, uploadDir }));

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(500).render('error', {
      message: error.message,
      stack: process.env.NODE_ENV === 'test' ? error.stack : null
    });
  });

  app.locals.db = db;
  app.locals.ready = ready;
  app.locals.close = () => new Promise((resolve, reject) => {
    db.close((error) => (error ? reject(error) : resolve()));
  });

  return app;
}

module.exports = { createApp };
