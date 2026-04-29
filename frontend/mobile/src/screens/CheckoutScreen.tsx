import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Divider } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/MainNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
  route: RouteProp<RootStackParamList, 'Checkout'>;
};

export default function CheckoutScreen({ navigation, route }: Props) {
  const { roomId } = route.params;
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handlePayment = () => {
    navigation.navigate('BookingConfirmation', { bookingId: '123' });
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Guest Details</Text>
      <TextInput label="First Name" value={firstName} onChangeText={setFirstName} mode="outlined" style={styles.input} />
      <TextInput label="Last Name" value={lastName} onChangeText={setLastName} mode="outlined" style={styles.input} />
      <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={styles.input} />
      
      <Divider style={styles.divider} />
      
      <Text variant="titleLarge" style={styles.title}>Booking Summary</Text>
      <Text>Room: Double Room</Text>
      <Text>Nights: 2</Text>
      <Text>Price: €130</Text>
      
      <Button mode="contained" onPress={handlePayment} style={styles.button}>
        Proceed to Payment
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 16 },
  input: { marginBottom: 12 },
  divider: { marginVertical: 16 },
  button: { marginTop: 24 },
});