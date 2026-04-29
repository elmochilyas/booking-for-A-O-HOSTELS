import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/MainNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PropertyDetail'>;
  route: RouteProp<RootStackParamList, 'PropertyDetail'>;
};

export default function PropertyDetailScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;

  const handleViewRooms = () => {
    navigation.navigate('RoomSelection', { propertyId });
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>A&O Berlin Hauptbahnhof</Text>
      <Text style={styles.address}>Kirchstraße 1, 10557 Berlin</Text>
      <Text variant="bodyLarge" style={styles.description}>
        Modern hostel in the heart of Berlin, just 5 minutes from the main train station.
        Free WiFi, 24/7 reception, bar and guest kitchen.
      </Text>
      <Text variant="titleMedium" style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenities}>
        <Text>✓ Free WiFi</Text>
        <Text>✓ 24/7 Reception</Text>
        <Text>✓ Bar</Text>
        <Text>✓ Guest Kitchen</Text>
        <Text>✓ Bike Rental</Text>
      </View>
      <Button mode="contained" onPress={handleViewRooms} style={styles.button}>
        View Available Rooms
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 8 },
  address: { color: '#666', marginBottom: 12 },
  description: { marginBottom: 16 },
  sectionTitle: { marginBottom: 8 },
  amenities: { marginBottom: 16 },
  button: { marginTop: 16 },
});