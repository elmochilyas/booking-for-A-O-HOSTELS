import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, List, Divider } from 'react-native-paper';

export default function NotificationPreferencesScreen() {
  const [emailBookings, setEmailBookings] = React.useState(true);
  const [emailReminders, setEmailReminders] = React.useState(true);
  const [emailPromotions, setEmailPromotions] = React.useState(false);
  const [smsBookings, setSmsBookings] = React.useState(true);
  const [smsReminders, setSmsReminders] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Email Notifications</Text>
      
      <List.Item
        title="Booking Confirmations"
        description="Receive email when booking is confirmed"
        right={() => <Switch value={emailBookings} onValueChange={setEmailBookings} />}
      />
      <List.Item
        title="Pre-arrival Reminders"
        description="Get reminded before check-in"
        right={() => <Switch value={emailReminders} onValueChange={setEmailReminders} />}
      />
      <List.Item
        title="Promotions & Offers"
        description="Receive special offers and discounts"
        right={() => <Switch value={emailPromotions} onValueChange={setEmailPromotions} />}
      />
      
      <Divider style={styles.divider} />
      
      <Text variant="titleLarge" style={styles.title}>SMS Notifications</Text>
      
      <List.Item
        title="Booking Updates"
        description="Important booking notifications via SMS"
        right={() => <Switch value={smsBookings} onValueChange={setSmsBookings} />}
      />
      <List.Item
        title="Check-in Reminders"
        description="SMS reminders before your stay"
        right={() => <Switch value={smsReminders} onValueChange={setSmsReminders} />}
      />
      
      <Divider style={styles.divider} />
      
      <Text variant="titleLarge" style={styles.title}>Push Notifications</Text>
      
      <List.Item
        title="Enable Push Notifications"
        description="Receive notifications on your device"
        right={() => <Switch value={pushNotifications} onValueChange={setPushNotifications} />}
      />
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          SMS and push notifications are optional. Message and data rates may apply.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { padding: 16, paddingBottom: 8 },
  divider: { marginVertical: 8 },
  infoBox: { padding: 16, backgroundColor: '#F3F4F6', margin: 16, borderRadius: 8 },
  infoText: { fontSize: 12, color: '#666' },
});