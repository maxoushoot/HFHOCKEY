import { Colors } from './Colors';

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  '3xl': 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const semanticColors = {
  text: {
    primary: Colors.textPrimary,
    secondary: Colors.textSecondary,
    inverse: Colors.white,
  },
  surface: {
    page: Colors.background,
    card: Colors.cardBg,
    muted: Colors.slate,
    subtle: Colors.snowSecondary,
  },
  border: {
    default: Colors.cardBorder,
    subtle: Colors.slate,
  },
  action: {
    primary: Colors.france.blue,
    warning: Colors.warning,
    accent: '#EC4899',
  },
  status: {
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    info: Colors.info,
  },
} as const;

export const typographyScale = {
  display: 34,
  h1: 30,
  h2: 24,
  h3: 20,
  h4: 16,
  body: 14,
  caption: 12,
  micro: 10,
} as const;

export const theme = {
  spacing,
  radius,
  semanticColors,
  typographyScale,
} as const;
