export const MAX_ATTEMPTS = 5;
export const SNIPPET_DURATIONS = [3, 6, 9, 12, 15] as const;
export const MAX_ROUNDS = 5;
export const MAX_CUSTOM_ROUNDS = 15;
export const CUSTOM_SCORE_POINTS = [5, 4, 3, 2, 1] as const;

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const GENRES = [
  'pop', 'rock', 'hip-hop', 'country', 'jazz', 'classical', 
  'electronic', 'r&b', 'reggae', 'indie', 'metal', 'folk'
] as const;

export const DECADES = [
  { label: '1960s', start: 1960, end: 1969 },
  { label: '1970s', start: 1970, end: 1979 },
  { label: '1980s', start: 1980, end: 1989 },
  { label: '1990s', start: 1990, end: 1999 },
  { label: '2000s', start: 2000, end: 2009 },
  { label: '2010s', start: 2010, end: 2019 },
  { label: '2020s', start: 2020, end: 2029 },
] as const;
