/**
 * Extract route params
 * @param {string} pattern
 * @param {string} path
 * @returns {Record<string, string> | null}
 */
export const extractParams = (pattern, path) => {
  /** @type {Record<string, string>} */
  const params = {};
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return null;

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
};
