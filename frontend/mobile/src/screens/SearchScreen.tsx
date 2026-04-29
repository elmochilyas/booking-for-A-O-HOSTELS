import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function SearchScreen({ navigation }: Props) {
  const [location, setLocation] = React.useState('');
  const [checkIn, setCheckIn] = React.useState('');
  const [checkOut, setCheckOut] = React.useState('');
  const [guests, setGuests] = React.useState('1');

  const handleSearch = () => {
    navigation.navigate('PropertyList');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Find Your Stay
      </Text>
      <TextInput
        label="Location"
        value={location}
        onChangeText={setLocation}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Check-in Date"
        value={checkIn}
        onChangeText={setCheckIn}
        mode="outlined"
        style={styles.input}
        placeholder="YYYY-MM-DD"
      />
      <TextInput
        label="Check-out Date"
        value={checkOut}
        onChangeText={setCheckOut}
        mode="outlined"
        style={styles.input}
        placeholder="YYYY-MM-DD"
      />
      <TextInput
        label="Number of Guests"
        value={guests}
        onChangeText={setGuests}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSearch} style={styles.button}>
        Search
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
});