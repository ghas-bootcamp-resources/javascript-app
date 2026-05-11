function mergePreferences(target, source) {
  Object.keys(source).forEach((key) => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = mergePreferences(target[key] || {}, source[key]);
      return;
    }

    target[key] = source[key];
  });

  return target;
}

module.exports = { mergePreferences };
