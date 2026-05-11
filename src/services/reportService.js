const { exec } = require('child_process');
const path = require('path');

function summarizeExpenses(expenses) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  return {
    count: expenses.length,
    total: Number(total.toFixed(2))
  };
}

function exportReportUnsafe(format, dataDir, summary) {
  const outputFile = path.join(dataDir, `expense-report.${format}`);
  const script = path.join(__dirname, '..', '..', 'scripts', 'render-report.js');
  const command = `node ${script} --format ${format} --output ${outputFile} --count ${summary.count} --total ${summary.total}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve({ outputFile, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

module.exports = {
  exportReportUnsafe,
  summarizeExpenses
};
