export const MAX_ATTEMPTS = 5;
export const SNIPPET_DURATIONS = [3, 6, 9, 12, 15] as const;
export const MAX_ROUNDS = 5;
export const MAX_CUSTOM_ROUNDS = 15;
export const CUSTOM_SCORE_POINTS = [5, 4, 3, 2, 1] as const;

export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
