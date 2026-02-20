export const COLLECTIONS = {
  USERS: 'users',
  OUTFITS: 'outfits',
  RATINGS: 'ratings',
  COMMENTS: 'comments',
  AI_SUGGESTIONS: 'aiSuggestions',
} as const;

export const LIMITS = {
  FEED_PAGE_SIZE: 12,
  COMMENTS_PAGE_SIZE: 20,
  MAX_CAPTION_LENGTH: 200,
  MAX_COMMENT_LENGTH: 500,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_AVATAR_SIZE_MB: 5,
  AI_RATE_LIMIT_MS: 60 * 60 * 1000, // 1 hour
} as const;

export const COLORS = {
  primary: '#FF6B6B',
  primaryDark: '#E55555',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#252525',
  border: '#2A2A2A',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  textTertiary: '#5A5A5A',
  star: '#FFD700',
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFA726',
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
