/**
 * Returns a quoted string if the key is a valid identifier,
 * otherwise returns the original key.
 * @type {typeof import('@vanjs/parser').quoteText}
 */
export const quoteText = (key) =>
  /^[a-zA-Z_][a-zA-Z_0-9]+$/.test(key) ? key : `"${key}"`;
