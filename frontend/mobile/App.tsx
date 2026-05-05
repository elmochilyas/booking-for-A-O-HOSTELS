import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainNavigator from './src/navigation/MainNavigator';
import { theme as paperTheme } from './src/theme';
import { useAuthStore } from './src/stores/authStore';
import { ThemeProvider } from './src/theme/ThemeContext';
import { navigationRef } from './src/services/navigationService';
import OfflineBanner from './src/components/OfflineBanner';
import { Colors, Spacing } from './src/theme';

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
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider>
            <OffineBanner />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider>
          <NavigationContainer theme={navTheme} ref={navigationRef}>
            <OffineBanner />
            <MainNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}