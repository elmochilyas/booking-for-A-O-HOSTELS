import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/MainNavigator';
import { paymentsApi, bookingsApi } from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
  route: RouteProp<RootStackParamList, 'Checkout'>;
};

export default function CheckoutScreen({ navigation, route }: Props) {
  const { roomId } = route.params;
  const [loading, setLoading] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [totalPrice] = React.useState(130);
  const [deposit] = React.useState(26);

  const handleProceedToPayment = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const bookingResponse = await bookingsApi.create({
        room_type_id: roomId,
        guest_count: 1,
        check_in_date: '2026-05-01',
        check_out_date: '2026-05-03',
        property_id: '1',
        guest_id: '1',
      });

      const bookingId = bookingResponse.data.data.id;

      const paymentResponse = await paymentsApi.createPaymentIntent(bookingId, true);
      
      if (paymentResponse.data.success) {
        const confirmResponse = await paymentsApi.confirmPayment(paymentResponse.data.data.payment_id);
        
        if (confirmResponse.data.success) {
          navigation.navigate('BookingConfirmation', { bookingId });
        } else {
          Alert.alert('Payment Failed', 'Please try again');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Guest Details</Text>
      <TextInput label="First Name" value={firstName} onChangeText={setFirstName} mode="outlined" style={styles.input} />
      <TextInput label="Last Name" value={lastName} onChangeText={setLastName} mode="outlined" style={styles.input} />
      <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={styles.input} />
      
      <Divider style={styles.divider} />
      
      <Text variant="titleLarge" style={styles.title}>Booking Summary</Text>
      <View style={styles.summaryRow}>
        <Text>Room:</Text>
        <Text>Double Room</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text>Nights:</Text>
        <Text>2</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text>Total Price:</Text>
        <Text>€{totalPrice}</Text>
      </View>
      
      <View style={styles.depositBox}>
        <Text variant="titleMedium">Payment Details</Text>
        <View style={styles.summaryRow}>
          <Text>Deposit (20%):</Text>
          <Text style={styles.deposit}>€{deposit}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Balance at property:</Text>
          <Text>€{totalPrice - deposit}</Text>
        </View>
        <Text style={styles.note}>Pay 20% now, remaining balance due at check-in</Text>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Payment Method</Text>
      <Text style={styles.cardNote}>Credit/Debit Card via Stripe</Text>
      
      <Button 
        mode="contained" 
        onPress={handleProceedToPayment} 
        style={styles.button}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : `Pay €${deposit} Deposit`}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 16 },
  input: { marginBottom: 12 },
  divider: { marginVertical: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  depositBox: { backgroundColor: '#F0F9FF', padding: 16, borderRadius: 8, marginVertical: 16 },
  deposit: { fontWeight: 'bold', color: '#22C55E' },
  note: { fontSize: 12, color: '#666', marginTop: 8 },
  sectionTitle: { marginBottom: 8 },
  cardNote: { color: '#666', marginBottom: 16 },
  button: { marginTop: 24 },
});