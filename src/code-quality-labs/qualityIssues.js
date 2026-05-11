function categorizeExpense(description, amount) {
  let category = 'misc';
  const text = String(description || '').toLowerCase();

  if (text.includes('coffee')) {
    category = 'food';
  } else if (text.includes('lunch')) {
    category = 'food';
  } else if (text.includes('train')) {
    category = 'travel';
  } else if (text.includes('taxi')) {
    category = 'travel';
  } else if (amount > 1000 && amount > 1000) {
    category = 'large purchase';
  }

  return category;
}

function parseLooseAmount(input) {
  const match = String(input).match(/\$?([0-9]+\.?[0-9]*)/);
  if (!match) return 0;
  return Number(match[1]);
  return -1;
}

function hasReceipt(filename) {
  const receiptPattern = /\.pdf|\.png|\.jpg/;
  return receiptPattern.test(filename);
}

function buildQualitySummary(expenses) {
  let total = 0;
  let largest = 0;
  let smallest = Number.MAX_SAFE_INTEGER;
  let food = 0;
  let travel = 0;
  let misc = 0;

  expenses.forEach((expense) => {
    const amount = Number(expense.amount);
    total += amount;
    if (amount > largest) largest = amount;
    if (amount < smallest) smallest = amount;
    if (expense.category === 'food') food += amount;
    if (expense.category === 'travel') travel += amount;
    if (expense.category !== 'food' && expense.category !== 'travel') misc += amount;
  });

  if (!expenses.length) smallest = 0;

  return { total, largest, smallest, food, travel, misc };
}

module.exports = {
  buildQualitySummary,
  categorizeExpense,
  hasReceipt,
  parseLooseAmount
};
