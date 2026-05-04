import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { Spacing, Colors, BorderRadius } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingConfirmation'>;
  route: { params?: RootStackParamList['BookingConfirmation'] };
};

export default function BookingConfirmationScreen({ navigation, route }: Props) {
  const { bookingId } = route.params || {};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.successIconContainer}>
        <View style={styles.successCircle}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
      </View>
      
      <Text variant="headlineMedium" style={styles.title}>Booking Confirmed!</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Thank you for your booking
      </Text>
      
      <Card style={styles.confirmationCard}>
        <Card.Content>
          <Text variant="labelMedium" style={styles.confirmLabel}>Confirmation Number</Text>
          <Text variant="headlineSmall" style={styles.bookingId}>{bookingId}</Text>
        </Card.Content>
      </Card>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📧</Text>
          <Text variant="bodyMedium" style={styles.detailText}>
            A confirmation email has been sent to your email address
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text variant="bodyMedium" style={styles.detailText}>
            Check-in details will be sent 24 hours before your stay
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>❓</Text>
          <Text variant="bodyMedium" style={styles.detailText}>
            Need help? Contact us at support@aohostels.com
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('MainTabs')} 
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          icon="home"
        >
          Back to Home
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('MainTabs')} 
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
          icon="calendar"
        >
          View My Bookings
        </Button>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  scrollView: { flex: 1 },
  contentContainer: { padding: Spacing.lg, alignItems: 'center' },
  successIconContainer: { marginVertical: Spacing.xl },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center' },
  successIcon: { fontSize: 48, color: Colors.text.inverse },
  title: { color: Colors.text.primary, marginBottom: Spacing.xs, textAlign: 'center' },
  subtitle: { color: Colors.text.secondary, marginBottom: Spacing.xl, textAlign: 'center' },
  confirmationCard: { width: '100%', marginBottom: Spacing.xl, backgroundColor: Colors.success + '10', borderRadius: BorderRadius.lg },
  confirmLabel: { color: Colors.text.secondary, marginBottom: Spacing.xs },
  bookingId: { color: Colors.success, fontWeight: 'bold' },
  detailsContainer: { width: '100%', marginBottom: Spacing.xl },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  detailIcon: { marginRight: Spacing.md, fontSize: 20 },
  detailText: { flex: 1, color: Colors.text.secondary, lineHeight: 20 },
  actions: { width: '100%' },
  primaryButton: { marginBottom: Spacing.md },
  secondaryButton: { marginBottom: Spacing.md },
  buttonContent: { paddingVertical: Spacing.xs },
});