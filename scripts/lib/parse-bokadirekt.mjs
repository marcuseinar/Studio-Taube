/**
 * Extracts the service catalogue from a Bokadirekt salon page.
 *
 * The catalogue is embedded in the page as a JSON blob rather than served by a
 * documented endpoint, so this reads it by brace-matching from a known key.
 * That is fragile by nature: callers must treat a parse failure as "unknown",
 * never as "the salon sells nothing".
 */
export function parseCatalogue(html) {
  const marker = '"services":[{"id":';
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error('No services block found in the Bokadirekt page.');

  const start = html.indexOf('[', markerIndex);
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < html.length; i += 1) {
    const character = html[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (character === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (character === '[' || character === '{') depth += 1;
    else if (character === ']' || character === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(html.slice(start, i + 1));
    }
  }

  throw new Error('Services block in the Bokadirekt page never closed.');
}

export function countServices(categories) {
  return categories.reduce((total, category) => total + (category.services?.length ?? 0), 0);
}
