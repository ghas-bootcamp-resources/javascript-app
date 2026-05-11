const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));
const output = args.output || path.join(process.cwd(), 'expense-report.txt');
const format = args.format || 'txt';
const count = args.count || 0;
const total = args.total || 0;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `Expense report (${format})\nCount: ${count}\nTotal: ${total}\n`, 'utf8');
console.log(`wrote ${output}`);
