import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface EnvironmentConfig {
  apiUrl: string;
  stripePublishableKey: string;
}

const getApiUrl = (): string => {
  if (__DEV__) {
    // Try every known location for the Expo dev-server host across SDK versions
    const debuggerHost =
      Constants.expoConfig?.hostUri ??                                        // SDK 46+ (@expo/cli)
      (Constants as any).expoGoConfig?.debuggerHost ??                        // SDK 46+ (Expo Go)
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ??            // SDK 44-45
      (Constants as any).manifest?.debuggerHost;                              // SDK < 44

    if (debuggerHost) {
      // debuggerHost is "192.168.x.x:8081" — strip the Metro port, use our API port
      const host = debuggerHost.split(':')[0];
      const url = `http://${host}:8000/api`;
      console.log('[API] resolved URL from Expo host:', url);
      return url;
    }

    // Static fallback when no Expo dev-server context (CI, bare builds, etc.)
    const fallback = Platform.OS === 'android'
      ? 'http://10.0.2.2:8000/api'   // Android emulator → host machine loopback
      : 'http://localhost:8000/api';  // iOS simulator
    console.log('[API] using static fallback URL:', fallback);
    return fallback;
  }

  return 'https://api.aohostels.com/api';
};

export const environment: EnvironmentConfig = {
  apiUrl: getApiUrl(),
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_xxx',
};

export const config = environment;

// Helper to update API URL at runtime (useful for switching between emulator and physical device)
export const setApiUrl = (url: string): void => {
  environment.apiUrl = url;
};

export const getApiBaseUrl = (): string => {
  return environment.apiUrl;
};