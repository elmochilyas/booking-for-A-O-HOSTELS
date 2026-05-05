import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { propertiesApi } from '../services/api';
import { Spacing, Colors, BorderRadius } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PropertyDetail'>;
  route: { params?: RootStackParamList['PropertyDetail'] };
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
  const { propertyId, checkIn, checkOut, guests } = route.params || {};
  const [property, setProperty] = useState<Property | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    if (!propertyId) {
      Alert.alert('Error', 'Invalid property');
      navigation.goBack();
      return;
    }
    setLoading(true);
    try {
      const response = await propertiesApi.getById(propertyId);
      setProperty(response.data.property);
      setAmenities(response.data.property.amenities || []);
    } catch (error: unknown) {
      Alert.alert('Error', 'Failed to load property details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleViewRooms = () => {
    if (!propertyId) return;
    navigation.navigate('RoomSelection', { 
      propertyId,
      checkIn,
      checkOut,
      guests,
    });
  };

  const handleCall = () => {
    if (property?.phone) {
      Linking.openURL(`tel:${property.phone}`);
    }
  };

  const handleEmail = () => {
    if (property?.email) {
      Linking.openURL(`mailto:${property.email}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text variant="bodyLarge" style={styles.errorText}>Property not found</Text>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>{property.name}</Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={Colors.text.secondary} style={styles.locationIcon} />
          <Text variant="bodyMedium" style={styles.location}>{property.location}</Text>
        </View>
        <Text variant="bodySmall" style={styles.address}>{property.address}</Text>
      </View>
      
      {property.rating && (
        <Card style={styles.ratingCard}>
          <Card.Content style={styles.ratingContent}>
            <View style={styles.ratingValue}>
              <Text variant="headlineMedium" style={styles.ratingNumber}>{property.rating}</Text>
              <Text variant="labelSmall" style={styles.ratingLabel}>/5</Text>
            </View>
            <View style={styles.ratingInfo}>
              <Text variant="titleMedium" style={styles.ratingText}>{property.rating >= 4.5 ? 'Excellent' : property.rating >= 4 ? 'Great' : 'Good'}</Text>
              <Text variant="bodySmall" style={styles.reviewCount}>{property.review_count} reviews</Text>
            </View>
          </Card.Content>
        </Card>
      )}
      
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
          <Text variant="bodyMedium" style={styles.description}>{property.description}</Text>
        </Card.Content>
      </Card>
      
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Check-in / Check-out</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <MaterialCommunityIcons name="door" size={24} color={Colors.primary} style={styles.timeIcon} />
              <Text variant="labelMedium" style={styles.timeLabel}>Check-in</Text>
              <Text variant="titleMedium" style={styles.timeValue}>{property.check_in_time}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <MaterialCommunityIcons name="exit-run" size={24} color={Colors.primary} style={styles.timeIcon} />
              <Text variant="labelMedium" style={styles.timeLabel}>Check-out</Text>
              <Text variant="titleMedium" style={styles.timeValue}>{property.check_out_time}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {amenities.map((amenity) => (
              <Chip
                key={amenity.id}
                icon={amenity.is_free ? 'check-circle' : 'minus-circle'}
                style={[styles.amenityChip, amenity.is_free ? styles.freeChip : styles.paidChip]}
                textStyle={[styles.amenityText, amenity.is_free ? styles.freeText : styles.paidText]}
              >
                {amenity.name}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactRow}>
            <Button mode="outlined" icon="phone" onPress={handleCall} style={styles.contactButton}>
              Call
            </Button>
            <Button mode="outlined" icon="email" onPress={handleEmail} style={styles.contactButton}>
              Email
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      <Button 
        mode="contained" 
        onPress={handleViewRooms} 
        style={styles.viewRoomsButton}
        contentStyle={styles.buttonContent}
        icon="bed"
      >
        View Available Rooms
      </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  scrollView: { flex: 1 },
  contentContainer: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: Colors.text.secondary, marginBottom: Spacing.lg },
  backButton: { marginTop: Spacing.md },
  header: { marginBottom: Spacing.lg },
  title: { marginBottom: Spacing.sm, color: Colors.text.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  locationIcon: { marginRight: Spacing.xs, fontSize: 16 },
  location: { color: Colors.text.secondary },
  address: { color: Colors.text.tertiary },
  ratingCard: { marginBottom: Spacing.lg, backgroundColor: Colors.background.card },
  ratingContent: { flexDirection: 'row', alignItems: 'center' },
  ratingValue: { flexDirection: 'row', alignItems: 'baseline', marginRight: Spacing.md },
  ratingNumber: { fontWeight: 'bold', color: Colors.warning },
  ratingLabel: { color: Colors.text.tertiary },
  ratingInfo: { flex: 1 },
  ratingText: { color: Colors.text.primary },
  reviewCount: { color: Colors.text.secondary },
  section: { marginBottom: Spacing.lg, backgroundColor: Colors.background.card },
  sectionTitle: { marginBottom: Spacing.md, color: Colors.text.primary },
  description: { color: Colors.text.secondary, lineHeight: 22 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeItem: { flex: 1, alignItems: 'center' },
  timeIcon: { fontSize: 24, marginBottom: Spacing.xs },
  timeLabel: { color: Colors.text.secondary, marginBottom: Spacing.xs },
  timeValue: { color: Colors.text.primary },
  timeDivider: { width: 1, height: 60, backgroundColor: Colors.border.default, marginHorizontal: Spacing.md },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  amenityChip: { marginBottom: Spacing.xs },
  freeChip: { backgroundColor: Colors.success + '20' },
  paidChip: { backgroundColor: Colors.warning + '20' },
  amenityText: { fontSize: 12 },
  freeText: { color: Colors.success },
  paidText: { color: Colors.warning },
  contactRow: { flexDirection: 'row', gap: Spacing.md },
  contactButton: { flex: 1 },
  viewRoomsButton: { marginTop: Spacing.md },
  buttonContent: { paddingVertical: Spacing.xs },
});