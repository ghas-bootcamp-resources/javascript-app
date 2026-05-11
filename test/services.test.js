const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  createExpense,
  initializeDatabase,
  listExpenses,
  openDatabase,
  searchExpensesUnsafe,
  summarizeByCategory
} = require('../src/db');
const {
  buildReceiptName,
  readReceiptUnsafe,
  saveReceipt
} = require('../src/services/receiptService');
const {
  exportReportUnsafe,
  summarizeExpenses
} = require('../src/services/reportService');
const {
  buildQualitySummary,
  categorizeExpense,
  hasReceipt,
  parseLooseAmount
} = require('../src/code-quality-labs/qualityIssues');
const { mergePreferences } = require('../src/security-labs/prototypePollution');
const approvedSecrets = require('../src/security-labs/approvedSecretPlaceholders');

function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => (error ? reject(error) : resolve()));
  });
}

describe('services and helpers', () => {
  let dataDir;
  let db;

  beforeEach(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'expense-services-'));
    db = openDatabase(path.join(dataDir, 'test.sqlite'));
    await initializeDatabase(db);
  });

  afterEach(async () => {
    await closeDatabase(db);
    fs.rmSync(dataDir, { recursive: true, force: true });
    delete Object.prototype.trainingFlag;
  });

  test('creates, lists, searches, and summarizes expenses', async () => {
    await createExpense(db, {
      title: 'Notebook',
      category: 'office',
      amount: 12.49,
      notes: 'paper'
    });
    await createExpense(db, {
      title: 'Taxi',
      category: 'travel',
      amount: 20,
      notes: 'airport'
    });

    const expenses = await listExpenses(db);
    expect(expenses).toHaveLength(2);

    const matches = await searchExpensesUnsafe(db, 'Taxi');
    expect(matches).toHaveLength(1);
    expect(matches[0].title).toBe('Taxi');

    expect(summarizeByCategory(expenses)).toEqual({ office: 12.49, travel: 20 });
    expect(summarizeExpenses(expenses)).toEqual({ count: 2, total: 32.49 });
  });

  test('stores and reads receipts', async () => {
    const uploadDir = path.join(dataDir, 'receipts');
    const filename = buildReceiptName('Meal Receipt.txt');
    const extensionless = buildReceiptName('receipt');

    expect(filename).toMatch(/Meal-Receipt\.txt$/);
    expect(extensionless).toMatch(/receipt\.txt$/);
    await saveReceipt(uploadDir, filename, 'receipt text');

    await expect(readReceiptUnsafe(uploadDir, filename)).resolves.toBe('receipt text');
  });

  test('exports report files', async () => {
    const result = await exportReportUnsafe('txt', dataDir, { count: 3, total: 99.75 });

    expect(fs.existsSync(result.outputFile)).toBe(true);
    expect(result.stdout).toContain('wrote');
    expect(fs.readFileSync(result.outputFile, 'utf8')).toContain('Count: 3');
    expect(summarizeExpenses([{ amount: null }, { amount: 1.25 }])).toEqual({ count: 2, total: 1.25 });
  });

  test('merges imported preferences', () => {
    const payload = JSON.parse('{"__proto__":{"trainingFlag":"polluted"},"currency":"EUR"}');
    const preferences = mergePreferences({ currency: 'USD' }, payload);

    expect(preferences.currency).toBe('EUR');
    expect({}.trainingFlag).toBe('polluted');
  });

  test('runs code quality lab helpers', () => {
    expect(categorizeExpense('coffee with team', 8)).toBe('food');
    expect(categorizeExpense('lunch with team', 18)).toBe('food');
    expect(categorizeExpense('train ticket', 12)).toBe('travel');
    expect(categorizeExpense('taxi ride', 28)).toBe('travel');
    expect(categorizeExpense('hardware', 1500)).toBe('large purchase');
    expect(categorizeExpense('pens', 5)).toBe('misc');
    expect(parseLooseAmount('$19.95')).toBe(19.95);
    expect(parseLooseAmount('free')).toBe(0);
    expect(hasReceipt('receipt.pdf')).toBe(true);
    expect(hasReceipt('receipt.png')).toBe(true);
    expect(hasReceipt('receipt.jpg')).toBe(true);
    expect(hasReceipt('notes.txt')).toBe(false);
    expect(buildQualitySummary([
      { category: 'food', amount: 10 },
      { category: 'travel', amount: 20 },
      { category: 'office', amount: 5 }
    ])).toEqual({ total: 35, largest: 20, smallest: 5, food: 10, travel: 20, misc: 5 });
    expect(buildQualitySummary([])).toEqual({ total: 0, largest: 0, smallest: 0, food: 0, travel: 0, misc: 0 });
  });

  test('documents approved secret placeholder slots', () => {
    expect(Object.keys(approvedSecrets)).toEqual([
      'APPROVED_SECRET_ONE',
      'APPROVED_SECRET_TWO',
      'APPROVED_SECRET_THREE',
      'APPROVED_SECRET_FOUR'
    ]);
  });
});
