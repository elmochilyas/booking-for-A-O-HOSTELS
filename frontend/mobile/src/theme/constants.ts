export const Colors = {
  primary: '#0066CC',
  secondary: '#FF6B35',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  danger: '#DC2626',
  
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    card: '#FFFFFF',
  },
  
  border: {
    default: '#E5E7EB',
    focused: '#0066CC',
  },
  
  status: {
    confirmed: '#22C55E',
    pending: '#F59E0B',
    cancelled: '#EF4444',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Typography = {
  headline: {
    large: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
    medium: { fontSize: 28, lineHeight: 36, fontWeight: '600' as const },
    small: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  },
  title: {
    large: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
    medium: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  },
  body: {
    large: { fontSize: 16, lineHeight: 24 },
    medium: { fontSize: 14, lineHeight: 20 },
    small: { fontSize: 12, lineHeight: 16 },
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};