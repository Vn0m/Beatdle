const DELIMITERS = [' - ', ' (', ' [', ' /'];

function normalize(title: string): string {
  return title
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCore(title: string): string {
  const cleaned = normalize(title);

  let earliestSplit = cleaned.length;
  for (const d of DELIMITERS) {
    const idx = cleaned.indexOf(d);
    if (idx > 0 && idx < earliestSplit) {
      earliestSplit = idx;
    }
  }

  return cleaned.slice(0, earliestSplit).trim();
}

export function isFuzzyTitleMatch(a: string, b: string): boolean {
  const cleanA = normalize(a);
  const cleanB = normalize(b);

  if (cleanA === cleanB) return true;

  return extractCore(cleanA) === extractCore(cleanB);
}
