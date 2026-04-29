import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

const mockBookings = [
  { id: '123', property: 'A&O Berlin Hauptbahnhof', checkIn: '2026-05-01', checkOut: '2026-05-03', status: 'confirmed' },
];

export default function MyBookingsScreen() {
  const renderBooking = ({ item }: { item: typeof mockBookings[0] }) => (
    <Card style={styles.card}>
      <Card.Title title={item.property} subtitle={`${item.checkIn} - ${item.checkOut}`} />
      <Card.Content>
        <Text style={{ color: item.status === 'confirmed' ? '#22C55E' : '#F59E0B' }}>
          Status: {item.status}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button>View Details</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>My Bookings</Text>
      <FlatList data={mockBookings} renderItem={renderBooking} keyExtractor={(item) => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 16 },
  card: { marginBottom: 12 },
});