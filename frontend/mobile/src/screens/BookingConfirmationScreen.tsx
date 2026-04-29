import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/MainNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingConfirmation'>;
  route: RouteProp<RootStackParamList, 'BookingConfirmation'>;
};

export default function BookingConfirmationScreen({ navigation, route }: Props) {
  const { bookingId } = route.params;

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Booking Confirmed!</Text>
      <Text variant="bodyLarge" style={styles.text}>
        Thank you for your booking. Your confirmation number is:
      </Text>
      <Text variant="titleLarge" style={styles.bookingId}>{bookingId}</Text>
      <Text style={styles.text}>
        A confirmation email has been sent to your email address.
      </Text>
      <Button mode="contained" onPress={() => navigation.navigate('MainTabs')} style={styles.button}>
        Back to Home
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  title: { marginBottom: 16, color: '#22C55E' },
  text: { textAlign: 'center', marginBottom: 8 },
  bookingId: { fontWeight: 'bold', marginVertical: 16 },
  button: { marginTop: 24 },
});