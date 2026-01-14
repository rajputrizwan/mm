export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    success: {
      light: '#10b981',
      dark: '#34d399',
    },
    warning: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
    error: {
      light: '#ef4444',
      dark: '#f87171',
    },
    info: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },
  gradients: {
    primary: 'from-blue-600 to-cyan-600',
    primaryHover: 'from-blue-700 to-cyan-700',
    secondary: 'from-teal-600 to-emerald-600',
    accent: 'from-blue-500 to-cyan-500',
  },
  backgrounds: {
    light: {
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      tertiary: 'bg-gray-100',
    },
    dark: {
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800',
      tertiary: 'bg-gray-700',
    },
  },
  borders: {
    light: 'border-gray-200',
    dark: 'border-gray-700',
  },
  text: {
    light: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
    },
    dark: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
    },
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  aiMetrics: {
    confidence: { color: 'blue', gradient: 'from-blue-500 to-blue-600' },
    clarity: { color: 'teal', gradient: 'from-teal-500 to-teal-600' },
    pace: { color: 'cyan', gradient: 'from-cyan-500 to-cyan-600' },
    eyeContact: { color: 'green', gradient: 'from-green-500 to-green-600' },
    technicalAccuracy: { color: 'blue', gradient: 'from-blue-600 to-cyan-600' },
    articulation: { color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
  },
};

export default theme;
