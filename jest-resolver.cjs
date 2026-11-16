/**
 * Jest resolver for Base44 function sources.
 * Base44 convention: every function/module is a directory containing entry.ts.
 * Also supports TS sources imported with a ".js" extension.
 */
const path = require('path');

module.exports = function base44Resolver(request, options) {
  if (!request.startsWith('.')) {
    return options.defaultResolver(request, options);
  }
  try {
    return options.defaultResolver(request, options);
  } catch (e) { /* fall through */ }

  if (request.endsWith('.js')) {
    try {
      return options.defaultResolver(request.slice(0, -3) + '.ts', options);
    } catch (e) { /* fall through */ }
    try {
      return options.defaultResolver(path.join(request.slice(0, -3), 'entry.ts'), options);
    } catch (e) { /* fall through */ }
  }

  if (!path.extname(request)) {
    try {
      return options.defaultResolver(request + '.ts', options);
    } catch (e) { /* fall through */ }
    try {
      return options.defaultResolver(path.join(request, 'entry.ts'), options);
    } catch (e) { /* fall through */ }
  }

  return options.defaultResolver(request, options);
};
