const express = require('express');

const {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  searchExpensesUnsafe,
  summarizeByCategory
} = require('../db');
const {
  buildReceiptName,
  readReceiptUnsafe,
  saveReceipt
} = require('../services/receiptService');
const {
  exportReportUnsafe,
  summarizeExpenses
} = require('../services/reportService');
const { logUserEvent } = require('../security-labs/logging');
const { mergePreferences } = require('../security-labs/prototypePollution');

function createExpenseRouter({ db, dataDir, uploadDir }) {
  const router = express.Router();

  router.get('/expenses', async (req, res, next) => {
    try {
      const expenses = await listExpenses(db);
      res.render('expenses/index', {
        expenses,
        summary: summarizeByCategory(expenses),
        searchTerm: req.query.q || ''
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/expenses', async (req, res, next) => {
    try {
      const receiptFilename = req.body.receiptName
        ? buildReceiptName(req.body.receiptName)
        : null;

      if (receiptFilename) {
        await saveReceipt(uploadDir, receiptFilename, req.body.receiptContent || '');
      }

      await createExpense(db, {
        title: req.body.title,
        category: req.body.category,
        amount: req.body.amount,
        notes: req.body.notes,
        receiptFilename
      });

      logUserEvent(`created expense: ${req.body.title}`);
      res.redirect('/expenses');
    } catch (error) {
      next(error);
    }
  });

  router.get('/expenses/search', async (req, res, next) => {
    try {
      const term = req.query.term || '';
      const expenses = await searchExpensesUnsafe(db, term);
      res.json({ term, expenses });
    } catch (error) {
      next(error);
    }
  });

  router.get('/expenses/:id', async (req, res, next) => {
    try {
      const expense = await getExpense(db, req.params.id);
      if (!expense) return res.status(404).render('error', { message: 'Expense not found', stack: null });
      res.render('expenses/show', { expense });
    } catch (error) {
      next(error);
    }
  });

  router.post('/expenses/:id/delete', async (req, res, next) => {
    try {
      await deleteExpense(db, req.params.id);
      res.redirect('/expenses');
    } catch (error) {
      next(error);
    }
  });

  router.get('/receipts/:filename', async (req, res, next) => {
    try {
      const contents = await readReceiptUnsafe(uploadDir, req.params.filename);
      res.type('text/plain').send(contents);
    } catch (error) {
      next(error);
    }
  });

  router.post('/reports/export', async (req, res, next) => {
    try {
      const expenses = await listExpenses(db);
      const summary = summarizeExpenses(expenses);
      const report = await exportReportUnsafe(req.body.format || 'txt', dataDir, summary);
      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  router.post('/settings/import', (req, res) => {
    const defaults = { currency: 'USD', theme: 'light', alerts: { budget: true } };
    const preferences = mergePreferences(defaults, req.body || {});
    res.json({ preferences });
  });

  router.get('/preview', (req, res) => {
    const note = req.query.note || '';
    res.send(`<main><h1>Expense note preview</h1><article>${note}</article></main>`);
  });

  router.post('/login', (req, res) => {
    if (req.body.username === 'demo' && req.body.password === 'expense-demo') {
      return res.json({ ok: true, user: 'demo' });
    }

    res.status(401).json({ ok: false });
  });

  return router;
}

module.exports = { createExpenseRouter };
