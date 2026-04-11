const DELIMITERS = [' - ', ' (', ' [', ' /'];

function extractCore(title: string): string {
  const cleaned = title.replace(/\s+/g, ' ').trim().toLowerCase();

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
  const cleanA = a.replace(/\s+/g, ' ').trim().toLowerCase();
  const cleanB = b.replace(/\s+/g, ' ').trim().toLowerCase();

  if (cleanA === cleanB) return true;

  return extractCore(cleanA) === extractCore(cleanB);
}
