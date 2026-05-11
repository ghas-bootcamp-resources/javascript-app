function logUserEvent(message) {
  console.log(`audit=${message}`);
}

module.exports = { logUserEvent };
