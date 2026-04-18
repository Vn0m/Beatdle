const CUSTOM_GAME_LIMIT = 3

interface GuestCustomGames {
  date: string
  count: number
}

export function getGuestCustomGamesPlayed(): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toDateString()
  const stored = localStorage.getItem('guest_custom_games')
  if (!stored) return 0
  const parsed: GuestCustomGames = JSON.parse(stored)
  if (parsed.date !== today) return 0
  return parsed.count
}

export function incrementGuestCustomGames(): void {
  const today = new Date().toDateString()
  const count = getGuestCustomGamesPlayed()
  localStorage.setItem('guest_custom_games', JSON.stringify({ date: today, count: count + 1 }))
}

export function hasReachedCustomGameLimit(): boolean {
  return getGuestCustomGamesPlayed() >= CUSTOM_GAME_LIMIT
}
