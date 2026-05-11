const { createApp } = require('./app');

const port = process.env.PORT || 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`GHAS Expense Tracker running at http://localhost:${port}`);
});
