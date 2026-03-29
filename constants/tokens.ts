import { useColorScheme } from '@/hooks/use-color-scheme';

export const palette = {
  coral: '#FF6B6B',
  coralMuted: '#FF6B6B88',
  coralSubtle: '#FF6B6B22',
  coralBorder: '#FF6B6B44',
  green: '#22CC88',
  red: '#FF4444',
  gold: '#FFD700',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  pink: '#FF6BFF',
  orange: '#FF8C42',
  cyan: '#44BBFF',
} as const;

type ThemeColors = {
  background: string;
  surface: string;
  surfaceBorder: string;
  border: string;
  primary: string;
  primaryMuted: string;
  primarySubtle: string;
  primaryBorder: string;
  success: string;
  danger: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  textPlaceholder: string;
  textOnPrimary: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarInactive: string;
  overlay: string;
};

type ThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

type ThemeRadii = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  full: number;
};

export type AppTheme = {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
};

const darkTheme: AppTheme = {
  colors: {
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceBorder: '#2A2A2A',
    border: '#333',
    primary: palette.coral,
    primaryMuted: palette.coralMuted,
    primarySubtle: palette.coralSubtle,
    primaryBorder: palette.coralBorder,
    success: palette.green,
    danger: palette.red,
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textTertiary: '#888888',
    textMuted: '#666666',
    textPlaceholder: '#555555',
    textOnPrimary: '#FFFFFF',
    tabBar: '#0D0D0D',
    tabBarBorder: '#1A1A1A',
    tabBarInactive: '#666',
    overlay: 'rgba(0,0,0,0.9)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 60,
  },
  radii: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    full: 9999,
  },
} as const;

const lightTheme: AppTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceBorder: '#E5E5E5',
    border: '#DDD',
    primary: palette.coral,
    primaryMuted: palette.coralMuted,
    primarySubtle: palette.coralSubtle,
    primaryBorder: palette.coralBorder,
    success: palette.green,
    danger: palette.red,
    text: '#11181C',
    textSecondary: '#555555',
    textTertiary: '#888888',
    textMuted: '#AAAAAA',
    textPlaceholder: '#999999',
    textOnPrimary: '#FFFFFF',
    tabBar: '#FFFFFF',
    tabBarBorder: '#EEE',
    tabBarInactive: '#999',
    overlay: 'rgba(0,0,0,0.7)',
  },
  spacing: darkTheme.spacing,
  radii: darkTheme.radii,
} as const;

export function useAppTheme(): AppTheme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
