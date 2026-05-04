import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { propertiesApi } from '../services/api';
import { Spacing, Colors, BorderRadius } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoomSelection'>;
  route: { params?: RootStackParamList['RoomSelection'] };
};

interface RoomType {
  id: string;
  type: string;
  capacity: number;
  price: number;
  available: number;
  amenities: string[];
}

export default function RoomSelectionScreen({ navigation, route }: Props) {
  const { propertyId, checkIn, checkOut, guests } = route.params || {};
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [propertyId]);

  const fetchRooms = async () => {
    if (!propertyId) {
      setRooms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await propertiesApi.getRoomTypes(propertyId);
      setRooms(response.data.data || response.data.roomTypes || []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    navigation.navigate('Checkout', { 
      roomId, 
      propertyId,
      checkIn,
      checkOut,
      guestCount: guests,
    });
  };

  const getAvailabilityColor = (count: number) => {
    if (count >= 5) return Colors.success;
    if (count >= 2) return Colors.warning;
    return Colors.error;
  };

  const renderRoom = ({ item }: { item: RoomType }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <Text variant="titleMedium" style={styles.roomType}>{item.type}</Text>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityIcon}>👤</Text>
              <Text variant="bodySmall" style={styles.capacityText}>Up to {item.capacity} guest{item.capacity > 1 ? 's' : ''}</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text variant="headlineSmall" style={styles.price}>€{item.price.toFixed(2)}</Text>
            <Text variant="labelSmall" style={styles.priceLabel}>/night</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.amenitiesRow}>
          {item.amenities?.map((amenity, index) => (
            <Chip key={index} style={styles.amenityChip} textStyle={styles.amenityText}>
              {amenity}
            </Chip>
          ))}
        </View>
        
        <View style={styles.availabilityRow}>
          <View style={styles.availability}>
            <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(item.available) }]} />
            <Text variant="labelMedium" style={[styles.availabilityText, { color: getAvailabilityColor(item.available) }]}>
              {item.available > 0 ? `${item.available} rooms available` : 'Sold out'}
            </Text>
          </View>
          <Button 
            mode="contained" 
            onPress={() => handleSelectRoom(item.id)}
            disabled={item.available === 0}
            style={styles.selectButton}
            contentStyle={styles.buttonContent}
          >
            Select
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const dateRange = checkIn && checkOut 
    ? `${formatDate(checkIn)} - ${formatDate(checkOut)}`
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle}>Select Room</Text>
        {dateRange && (
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar" size={14} color={Colors.primary} style={styles.dateIcon} />
            <Text variant="bodySmall" style={styles.dateText}>{dateRange}</Text>
          </View>
        )}
        {guests && (
          <Text variant="bodySmall" style={styles.guestsText}>{guests} guest{guests > 1 ? 's' : ''}</Text>
        )}
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList 
          data={rooms} 
          renderItem={renderRoom} 
          keyExtractor={(item) => item.id} 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleMedium" style={styles.emptyTitle}>No rooms available</Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>Try different dates</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  header: { padding: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.background.primary },
  headerTitle: { color: Colors.text.primary, marginBottom: Spacing.xs },
  headerSubtitle: { color: Colors.text.secondary },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  dateIcon: { marginRight: Spacing.xs },
  dateText: { color: Colors.primary },
  guestsText: { color: Colors.text.secondary, marginTop: Spacing.xs },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.lg },
  card: { marginBottom: Spacing.lg, backgroundColor: Colors.background.card, borderRadius: BorderRadius.lg },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roomInfo: { flex: 1, marginRight: Spacing.md },
  roomType: { color: Colors.text.primary, marginBottom: Spacing.xs },
  capacityRow: { flexDirection: 'row', alignItems: 'center' },
  capacityIcon: { marginRight: Spacing.xs, fontSize: 14 },
  capacityText: { color: Colors.text.secondary },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontWeight: 'bold', color: Colors.primary },
  priceLabel: { color: Colors.text.tertiary },
  divider: { marginVertical: Spacing.md },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  amenityChip: { backgroundColor: Colors.neutral[100], height: 26 },
  amenityText: { fontSize: 10, color: Colors.text.secondary },
  availabilityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availability: { flexDirection: 'row', alignItems: 'center' },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.xs },
  availabilityText: {},
  selectButton: { marginTop: 0 },
  buttonContent: { paddingVertical: Spacing.xs },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyTitle: { color: Colors.text.primary, marginBottom: Spacing.xs },
  emptySubtitle: { color: Colors.text.secondary },
});