const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');

const { createApp } = require('../src/app');

function makeTestApp() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'expense-app-'));
  const app = createApp({ dataDir });
  return { app, dataDir };
}

describe('expense tracker app', () => {
  let app;
  let dataDir;

  beforeEach(async () => {
    const created = makeTestApp();
    app = created.app;
    dataDir = created.dataDir;
    await app.locals.ready;
  });

  afterEach(async () => {
    await app.locals.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(path.join(process.cwd(), 'expense-report.txt'), { force: true });
  });

  test('responds to health checks', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', app: 'ghas-expense-tracker' });
  });

  test('redirects the home page to expenses', async () => {
    await request(app).get('/').expect(302).expect('Location', '/expenses');
  });

  test('creates and lists an expense with a receipt', async () => {
    await request(app)
      .post('/expenses')
      .type('form')
      .send({
        title: 'Team lunch',
        category: 'food',
        amount: '42.50',
        notes: 'Quarterly planning',
        receiptName: 'lunch.txt',
        receiptContent: 'paid by card'
      })
      .expect(302);

    const list = await request(app).get('/expenses');
    expect(list.text).toContain('Team lunch');
    expect(list.text).toContain('$42.50');

    const search = await request(app).get('/expenses/search').query({ term: 'lunch' });
    expect(search.body.expenses).toHaveLength(1);
    expect(search.body.expenses[0].category).toBe('food');

    const receiptName = search.body.expenses[0].receipt_filename;
    const receipt = await request(app).get(`/receipts/${receiptName}`);
    expect(receipt.text).toBe('paid by card');
  });

  test('shows, deletes, and hides an expense', async () => {
    await request(app)
      .post('/expenses')
      .type('form')
      .send({ title: 'Train ticket', category: 'travel', amount: '18.00' })
      .expect(302);

    const search = await request(app).get('/expenses/search').query({ term: 'Train' });
    const id = search.body.expenses[0].id;

    const show = await request(app).get(`/expenses/${id}`);
    expect(show.text).toContain('Train ticket');

    await request(app).post(`/expenses/${id}/delete`).expect(302);

    const afterDelete = await request(app).get('/expenses/search').query({ term: 'Train' });
    expect(afterDelete.body.expenses).toHaveLength(0);
  });

  test('exports a local report file', async () => {
    await request(app)
      .post('/expenses')
      .type('form')
      .send({ title: 'Coffee', category: 'food', amount: '5.25' });

    const response = await request(app)
      .post('/reports/export')
      .type('form')
      .send({ format: 'txt' });

    expect(response.status).toBe(200);
    expect(fs.existsSync(response.body.outputFile)).toBe(true);
    expect(fs.readFileSync(response.body.outputFile, 'utf8')).toContain('Total: 5.25');
  });

  test('renders the intentionally unsafe preview endpoint', async () => {
    const response = await request(app).get('/preview').query({ note: '<strong>raw</strong>' });

    expect(response.text).toContain('<strong>raw</strong>');
  });

  test('imports settings with the intentionally vulnerable merge helper', async () => {
    const response = await request(app)
      .post('/settings/import')
      .send({ alerts: { weekly: false }, theme: 'contrast' });

    expect(response.body.preferences.theme).toBe('contrast');
    expect(response.body.preferences.alerts.weekly).toBe(false);
  });

  test('accepts only demo login credentials', async () => {
    await request(app)
      .post('/login')
      .send({ username: 'demo', password: 'expense-demo' })
      .expect(200);

    await request(app)
      .post('/login')
      .send({ username: 'demo', password: 'wrong' })
      .expect(401);
  });

  test('renders a 404 for missing expenses', async () => {
    const response = await request(app).get('/expenses/9999');

    expect(response.status).toBe(404);
    expect(response.text).toContain('Expense not found');
  });

  test('renders errors from route failures', async () => {
    const missingReceipt = await request(app).get('/receipts/missing.txt');
    expect(missingReceipt.status).toBe(500);
    expect(missingReceipt.text).toContain('ENOENT');

    const badSearch = await request(app).get('/expenses/search').query({ term: "'" });
    expect(badSearch.status).toBe(500);
    expect(badSearch.text).toContain('SQLITE_ERROR');

    const badCreate = await request(app)
      .post('/expenses')
      .type('form')
      .send({ category: 'food', amount: '4.00' });
    expect(badCreate.status).toBe(500);
    expect(badCreate.text).toContain('SQLITE_CONSTRAINT');

    const badReport = await request(app)
      .post('/reports/export')
      .type('form')
      .send({ format: 'txt; false' });
    expect(badReport.status).toBe(500);
  });
});
