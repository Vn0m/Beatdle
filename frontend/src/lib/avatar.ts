const AVATAR_COLORS = [
  '#5C7A9C',
  '#6B8E6B', 
  '#9C6B5C', 
  '#7A6B9C', 
  '#5C8E8E', 
  '#9C8E5C', 
  '#7A5C8E', 
  '#5C7A5C', 
  '#9C5C7A', 
  '#6B7A9C', 
];

export function getAvatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getAvatarUrl(userMetadata: Record<string, unknown> | undefined): string | null {
  if (!userMetadata) return null;
  return (userMetadata.avatar_url as string) || (userMetadata.picture as string) || null;
}
