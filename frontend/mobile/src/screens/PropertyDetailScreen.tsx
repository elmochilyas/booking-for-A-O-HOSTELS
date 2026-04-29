import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/MainNavigator';
import { propertiesApi } from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PropertyDetail'>;
  route: RouteProp<RootStackParamList, 'PropertyDetail'>;
};

interface Property {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  phone: string;
  email: string;
  check_in_time: string;
  check_out_time: string;
  rating: number;
  review_count: number;
}

interface Amenity {
  id: string;
  name: string;
  category: string;
  is_free: boolean;
}

export default function PropertyDetailScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;
  const [property, setProperty] = useState<Property | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await propertiesApi.getById(propertyId);
      setProperty(response.data.property);
      setAmenities(response.data.property.amenities || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load property details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleViewRooms = () => {
    navigation.navigate('RoomSelection', { propertyId });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Property not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>{property.name}</Text>
      <Text style={styles.location}>{property.location}</Text>
      <Text style={styles.address}>{property.address}</Text>
      
      <Divider style={styles.divider} />
      
      <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
      <Text style={styles.description}>{property.description}</Text>
      
      <Divider style={styles.divider} />
      
      <Text variant="titleMedium" style={styles.sectionTitle}>Check-in / Check-out</Text>
      <Text style={styles.text}>Check-in: {property.check_in_time}</Text>
      <Text style={styles.text}>Check-out: {property.check_out_time}</Text>
      
      <Divider style={styles.divider} />
      
      <Text variant="titleMedium" style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenities}>
        {amenities.map((amenity) => (
          <Text key={amenity.id} style={styles.amenityItem}>
            {amenity.is_free ? '✓' : '•'} {amenity.name}
          </Text>
        ))}
      </View>
      
      {property.rating && (
        <>
          <Divider style={styles.divider} />
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Rating: {property.rating}/5 ({property.review_count} reviews)
          </Text>
        </>
      )}
      
      <Divider style={styles.divider} />
      
      <Button mode="contained" onPress={handleViewRooms} style={styles.button}>
        View Available Rooms
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { marginBottom: 4 },
  location: { color: '#666', marginBottom: 4 },
  address: { color: '#888', marginBottom: 12 },
  description: { marginBottom: 12 },
  sectionTitle: { marginBottom: 8 },
  amenities: { marginBottom: 16 },
  amenityItem: { marginBottom: 4 },
  text: { marginBottom: 4 },
  divider: { marginVertical: 16 },
  button: { marginTop: 16 },
});