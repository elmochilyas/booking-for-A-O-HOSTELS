import { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainNavigator from './src/navigation/MainNavigator';
import { theme as paperTheme } from './src/theme';
import { useAuthStore } from './src/stores/authStore';
import { ThemeProvider } from './src/theme/ThemeContext';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: paperTheme.colors.primary,
    background: paperTheme.colors.background,
    card: paperTheme.colors.surface,
    text: paperTheme.colors.onBackground,
    border: paperTheme.colors.outline,
    notification: paperTheme.colors.error,
  },
};

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider>
          <NavigationContainer theme={navTheme}>
            <MainNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}