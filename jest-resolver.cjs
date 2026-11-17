/**
 * Jest resolver for Base44 function sources.
 * Base44 convention: every module is a directory containing entry.ts, and
 * modules import siblings by name ("./money" from inside "settlements"),
 * relying on the platform bundler's resolution. This resolver emulates that:
 * exact path, then .ts, then dir/entry.ts, then walking up parent directories.
 */
const path = require('path');

module.exports = function base44Resolver(request, options) {
  if (!request.startsWith('.')) {
    return options.defaultResolver(request, options);
  }

  const stripped = request.replace(/\.js$/, '');
  const rest = stripped.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
  const candidates = [stripped, stripped + '.ts', path.join(stripped, 'entry.ts')];
  for (let depth = 1; depth <= 4; depth++) {
    const base = '../'.repeat(depth) + rest;
    candidates.push(base, base + '.ts', path.join(base, 'entry.ts'));
  }

  for (const cand of candidates) {
    try {
      return options.defaultResolver(cand, options);
    } catch (e) { /* try next candidate */ }
  }

  return options.defaultResolver(request, options);
};
