import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors, Spacing } from '../theme';

export default function OfflineBanner() {
  const { isOffline, networkStatus } = useNetworkStatus();

  if (!isOffline) return null;

  const handleRetry = async () => {
    const NetInfo = require('@react-native-community/netinfo').default;
    await NetInfo.fetch();
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="wifi-off" size={16} color="#FFF" />
      <Text style={styles.text}>You are offline</Text>
      <Button
        mode="text"
        onPress={handleRetry}
        textColor="#FFF"
        compact
        style={styles.retryButton}
      >
        Retry
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  text: {
    color: '#FFF',
    marginLeft: Spacing.xs,
    fontSize: 12,
    flex: 1,
  },
  retryButton: {
    marginLeft: Spacing.sm,
  },
});
