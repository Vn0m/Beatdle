export const MAX_ATTEMPTS = 5;
export const MAX_ROUNDS = 5;
export const SNIPPET_DURATIONS = [3, 6, 9, 12, 15] as const;
export const ROUND_TIME_SECONDS = 90;

export const SCORE_POINTS = [5, 4, 3, 2, 1] as const;

export const PORT = process.env.PORT || 8000;

export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://beatdle-app.onrender.com',
];
