import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Divider, ActivityIndicator, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { paymentsApi, bookingsApi, propertiesApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Spacing, Colors, BorderRadius } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
  route: { params?: RootStackParamList['Checkout'] };
};

interface RoomDetails {
  id: string;
  type: string;
  price: number;
  capacity: number;
}

export default function CheckoutScreen({ navigation, route }: Props) {
  const { roomId, propertyId, checkIn, checkOut, guestCount } = route.params || {};
  const { guest, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [deposit, setDeposit] = useState(0);

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId, propertyId]);

  useEffect(() => {
    if (guest) {
      setFirstName(guest.first_name || '');
      setLastName(guest.last_name || '');
      setEmail(guest.email || '');
    }
  }, [guest]);

  useEffect(() => {
    if (room && checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const total = room.price * nights;
      const depositAmount = Math.ceil(total * 0.2);
      setTotalPrice(total);
      setDeposit(depositAmount);
    }
  }, [room, checkIn, checkOut]);

  const fetchRoomDetails = async () => {
    if (!propertyId) return;
    try {
      const response = await propertiesApi.getRoomTypes(propertyId);
      const rooms = response.data.data || response.data.roomTypes || [];
      const selectedRoom = rooms.find((r: RoomDetails) => r.id === roomId);
      if (selectedRoom) {
        setRoom(selectedRoom);
      }
    } catch (error) {
      console.error('Failed to fetch room details');
    }
  };

  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleProceedToPayment = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isAuthenticated || !guest) {
      Alert.alert('Login Required', 'Please log in to complete your booking', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    setLoading(true);
    try {
      if (!propertyId || !roomId) {
        Alert.alert('Error', 'Invalid property or room');
        setLoading(false);
        return;
      }

      const bookingResponse = await bookingsApi.create({
        room_type_id: roomId || '',
        guest_count: guestCount || 1,
        check_in_date: checkIn || new Date().toISOString().split('T')[0],
        check_out_date: checkOut || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        property_id: propertyId || '',
        guest_id: guest.id,
      });

      const booking = bookingResponse.data.data || bookingResponse.data.booking;
      const bookingId = booking?.id;
      
      if (!bookingId) {
        Alert.alert('Error', 'Failed to create booking');
        setLoading(false);
        return;
      }

      const paymentResponse = await paymentsApi.createPaymentIntent(
        bookingId,
        totalPrice,
        20
      );
      
      if (paymentResponse.data.success) {
        const paymentIntentId = paymentResponse.data.data?.payment_intent_id || paymentResponse.data.paymentIntentId;
        
        if (!paymentIntentId) {
          Alert.alert('Error', 'Payment initialization failed');
          setLoading(false);
          return;
        }
        
        const confirmResponse = await paymentsApi.confirmPayment(
          paymentResponse.data.data?.payment_id || paymentResponse.data.paymentId,
          paymentIntentId
        );
        
        if (confirmResponse.data.success) {
          navigation.navigate('BookingConfirmation', { bookingId });
        } else {
          Alert.alert('Payment Failed', confirmResponse.data.message || 'Please try again');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const nights = getNights();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']} removeClippedSubviews={false}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Guest Details</Text>
            <View style={styles.row}>
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
            </View>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>Room:</Text>
              <Text variant="bodyMedium">{room?.type || 'Selected Room'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>Nights:</Text>
              <Text variant="bodyMedium">{nights || 1}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>Price per night:</Text>
              <Text variant="bodyMedium">€{room?.price || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>Total Price:</Text>
              <Text variant="bodyMedium">€{totalPrice}</Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={[styles.section, styles.paymentCard]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Payment Details</Text>
            
            <View style={styles.paymentRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>Deposit (20%):</Text>
              <Text variant="titleMedium" style={styles.depositAmount}>€{deposit}</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>Balance at property:</Text>
              <Text variant="bodyMedium">€{totalPrice - deposit}</Text>
            </View>
            
            <View style={styles.infoBox}>
              <Text variant="labelSmall" style={styles.infoText}>
                Pay 20% now, remaining balance due at check-in
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethodRow}>
              <View style={styles.cardIcon}>
                <Text variant="labelLarge" style={styles.cardIconText}>💳</Text>
              </View>
              <Text variant="bodyMedium" style={styles.cardText}>Credit/Debit Card via Stripe</Text>
            </View>
          </Card.Content>
        </Card>
        
        <Button 
          mode="contained" 
          onPress={handleProceedToPayment} 
          style={styles.payButton}
          disabled={loading}
          contentStyle={styles.buttonContent}
        >
          {loading ? <ActivityIndicator color={Colors.text.inverse} /> : `Pay €${deposit} Deposit`}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  scrollView: { flex: 1 },
  contentContainer: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  section: { marginBottom: Spacing.lg, backgroundColor: Colors.background.card },
  sectionTitle: { marginBottom: Spacing.md, color: Colors.text.primary },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1 },
  input: { marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { color: Colors.text.secondary },
  paymentCard: { backgroundColor: Colors.primary + '10' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  depositAmount: { fontWeight: 'bold', color: Colors.success },
  infoBox: { backgroundColor: Colors.primary + '20', padding: Spacing.sm, borderRadius: BorderRadius.sm, marginTop: Spacing.sm },
  infoText: { color: Colors.primary },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardIcon: { width: 40, height: 28, backgroundColor: Colors.neutral[200], borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  cardIconText: { fontSize: 16 },
  cardText: { color: Colors.text.secondary },
  payButton: { marginTop: Spacing.md },
  buttonContent: { paddingVertical: Spacing.xs },
});