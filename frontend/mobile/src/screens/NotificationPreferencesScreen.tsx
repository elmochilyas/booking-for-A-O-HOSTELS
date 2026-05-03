import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, List, Divider, Card } from 'react-native-paper';
import { Spacing, Colors, BorderRadius } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationPreferencesScreen() {
  const [emailBookings, setEmailBookings] = React.useState(true);
  const [emailReminders, setEmailReminders] = React.useState(true);
  const [emailPromotions, setEmailPromotions] = React.useState(false);
  const [smsBookings, setSmsBookings] = React.useState(true);
  const [smsReminders, setSmsReminders] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);

  const NotificationSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card style={styles.section}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
        {children}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <NotificationSection title="Email Notifications">
        <List.Item
          title="Booking Confirmations"
          titleStyle={styles.itemTitle}
          description="Receive email when booking is confirmed"
          descriptionStyle={styles.itemDescription}
          left={(props) => <List.Icon {...props} icon="email-check" color={Colors.primary} />}
          right={() => <Switch value={emailBookings} onValueChange={setEmailBookings} color={Colors.primary} />}
        />
        <List.Item
          title="Pre-arrival Reminders"
          titleStyle={styles.itemTitle}
          description="Get reminded before check-in"
          descriptionStyle={styles.itemDescription}
          left={(props) => <List.Icon {...props} icon="calendar-clock" color={Colors.primary} />}
          right={() => <Switch value={emailReminders} onValueChange={setEmailReminders} color={Colors.primary} />}
        />
        <List.Item
          title="Promotions & Offers"
          titleStyle={styles.itemTitle}
          description="Receive special offers and discounts"
          descriptionStyle={styles.itemDescription}
          left={(props) => <List.Icon {...props} icon="tag" color={Colors.secondary} />}
          right={() => <Switch value={emailPromotions} onValueChange={setEmailPromotions} color={Colors.primary} />}
        />
      </NotificationSection>

      <NotificationSection title="SMS Notifications">
        <List.Item
          title="Booking Updates"
          titleStyle={styles.itemTitle}
          description="Important booking notifications via SMS"
          descriptionStyle={styles.itemDescription}
          left={(props) => <List.Icon {...props} icon="message-text" color={Colors.primary} />}
          right={() => <Switch value={smsBookings} onValueChange={setSmsBookings} color={Colors.primary} />}
        />
        <List.Item
          title="Check-in Reminders"
          titleStyle={styles.itemTitle}
          description="SMS reminders before your stay"
          descriptionStyle={styles.itemDescription}
          left={(props) => <List.Icon {...props} icon="bell" color={Colors.primary} />}
          right={() => <Switch value={smsReminders} onValueChange={setSmsReminders} color={Colors.primary} />}
        />
      </NotificationSection>

      <NotificationSection title="Push Notifications">
        <List.Item
          title="Enable Push Notifications"
          titleStyle={styles.itemTitle}
          description="Receive notifications on your device"
          descriptionStyle={styles.itemDescription}
          left={(props) => <List.Icon {...props} icon="cellphone" color={Colors.primary} />}
          right={() => <Switch value={pushNotifications} onValueChange={setPushNotifications} color={Colors.primary} />}
        />
      </NotificationSection>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 SMS and push notifications are optional. Message and data rates may apply. You can change these settings at any time.
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  scrollView: { flex: 1 },
  contentContainer: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  section: { marginBottom: Spacing.lg, backgroundColor: Colors.background.card },
  sectionTitle: { marginBottom: Spacing.sm, color: Colors.text.primary },
  itemTitle: { color: Colors.text.primary },
  itemDescription: { color: Colors.text.secondary },
  infoBox: { backgroundColor: Colors.primary + '10', padding: Spacing.lg, borderRadius: BorderRadius.md },
  infoText: { color: Colors.text.secondary, lineHeight: 20 },
});