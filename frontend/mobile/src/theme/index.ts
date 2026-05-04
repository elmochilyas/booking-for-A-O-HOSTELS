import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Colors, Spacing, BorderRadius } from './constants';

const fontConfig = {
  displayLarge: { fontFamily: 'System', fontSize: 57, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 64 },
  displayMedium: { fontFamily: 'System', fontSize: 45, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 52 },
  displaySmall: { fontFamily: 'System', fontSize: 36, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 44 },
  headlineLarge: { fontFamily: 'System', fontSize: 32, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 40 },
  headlineMedium: { fontFamily: 'System', fontSize: 28, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 36 },
  headlineSmall: { fontFamily: 'System', fontSize: 24, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 32 },
  titleLarge: { fontFamily: 'System', fontSize: 22, fontWeight: '400' as const, letterSpacing: 0, lineHeight: 28 },
  titleMedium: { fontFamily: 'System', fontSize: 16, fontWeight: '500' as const, letterSpacing: 0.15, lineHeight: 24 },
  titleSmall: { fontFamily: 'System', fontSize: 14, fontWeight: '500' as const, letterSpacing: 0.1, lineHeight: 20 },
  labelLarge: { fontFamily: 'System', fontSize: 14, fontWeight: '500' as const, letterSpacing: 0.1, lineHeight: 20 },
  labelMedium: { fontFamily: 'System', fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5, lineHeight: 16 },
  labelSmall: { fontFamily: 'System', fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.5, lineHeight: 16 },
  bodyLarge: { fontFamily: 'System', fontSize: 16, fontWeight: '400' as const, letterSpacing: 0.15, lineHeight: 24 },
  bodyMedium: { fontFamily: 'System', fontSize: 14, fontWeight: '400' as const, letterSpacing: 0.25, lineHeight: 20 },
  bodySmall: { fontFamily: 'System', fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.4, lineHeight: 16 },
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: '#E6F0FA',
    secondary: Colors.secondary,
    secondaryContainer: '#FFF0E8',
    tertiary: Colors.success,
    tertiaryContainer: '#E8FAE8',
    error: Colors.error,
    errorContainer: '#FEE8E8',
    background: Colors.background.primary,
    surface: Colors.background.card,
    surfaceVariant: Colors.background.secondary,
    onPrimary: Colors.text.inverse,
    onPrimaryContainer: Colors.primary,
    onSecondary: Colors.text.inverse,
    onSecondaryContainer: Colors.secondary,
    onTertiary: Colors.text.inverse,
    onTertiaryContainer: Colors.success,
    onError: Colors.text.inverse,
    onErrorContainer: Colors.error,
    onBackground: Colors.text.primary,
    onSurface: Colors.text.primary,
    onSurfaceVariant: Colors.text.secondary,
    outline: Colors.border.default,
    outlineVariant: Colors.border.default,
    inverseSurface: Colors.neutral[900],
    inverseOnSurface: Colors.neutral[50],
    inversePrimary: Colors.primary,
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: BorderRadius.md,
};

export const customTheme = {
  colors: {
    primary: Colors.primary,
    secondary: Colors.secondary,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    danger: Colors.danger,
    text: Colors.text,
    neutral: Colors.neutral,
    background: Colors.background,
    border: Colors.border,
    status: Colors.status,
  },
  spacing: Spacing,
  borderRadius: BorderRadius,
};

export { Colors, Spacing, BorderRadius };