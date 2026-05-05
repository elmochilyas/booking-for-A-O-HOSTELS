import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { View, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { bookingsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Spacing, Colors, BorderRadius } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

interface Booking {
  id: string;
  property: string;
  location: string;
  check_in_date: string;
  check_out_date: string;
  room_type: string;
  guest_count: number;
  total_price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  property_name?: string;
  property_location?: string;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { color: Colors.success, backgroundColor: Colors.success + '20', label: 'Confirmed', icon: 'check' };
    case 'pending':
      return { color: Colors.warning, backgroundColor: Colors.warning + '20', label: 'Pending', icon: 'clock-outline' };
    case 'cancelled':
      return { color: Colors.error, backgroundColor: Colors.error + '20', label: 'Cancelled', icon: 'close' };
    default:
      return { color: Colors.neutral[500], backgroundColor: Colors.neutral[100], label: status, icon: 'help-circle-outline' };
  }
};

export default function MyBookingsScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsApi.getMyBookings();
      setBookings(response.data.data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        { 
          text: 'Cancel Booking', 
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsApi.cancel(bookingId, 'Cancelled by guest');
              fetchBookings();
            } catch {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        },
      ],
      { cancelable: true }
    );
  };

  const ITEM_HEIGHT = 200; // Approximate height of each booking card

  const getItemLayout = useMemo(() => (data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderBooking = useCallback(({ item }: { item: Booking }) => {
    const statusConfig = getStatusConfig(item.status);
    const propertyName = item.property_name || item.property;
    const location = item.property_location || item.location;
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.bookingHeader}>
            <View style={styles.propertyInfo}>
              <Text variant="titleMedium" style={styles.propertyName}>{propertyName}</Text>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={12} color={Colors.text.secondary} style={styles.locationIcon} />
                <Text variant="bodySmall" style={styles.location}>{location}</Text>
              </View>
            </View>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusConfig.backgroundColor }]}
              textStyle={[styles.statusText, { color: statusConfig.color }]}
            >
              {statusConfig.label}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={20} color={Colors.text.secondary} style={styles.detailIcon} />
              <View>
                <Text variant="labelSmall" style={styles.detailLabel}>Check-in</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{item.check_in_date}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar-check" size={20} color={Colors.text.secondary} style={styles.detailIcon} />
              <View>
                <Text variant="labelSmall" style={styles.detailLabel}>Check-out</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{item.check_out_date}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="bed" size={20} color={Colors.text.secondary} style={styles.detailIcon} />
              <View>
                <Text variant="labelSmall" style={styles.detailLabel}>Room</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{item.room_type}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="account-group" size={20} color={Colors.text.secondary} style={styles.detailIcon} />
              <View>
                <Text variant="labelSmall" style={styles.detailLabel}>Guests</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{item.guest_count}</Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text variant="labelMedium" style={styles.priceLabel}>Total</Text>
              <Text variant="titleMedium" style={styles.priceValue}>€{item.total_price}</Text>
            </View>
            
            <View style={styles.actions}>
              <Button 
                mode="outlined" 
                onPress={() => {}}
                style={styles.viewButton}
                contentStyle={styles.buttonContent}
              >
                Details
              </Button>
              
              {item.status !== 'cancelled' && (
                <Button 
                  mode="text" 
                  onPress={() => handleCancelBooking(item.id)}
                  textColor={Colors.danger}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>My Bookings</Text>
        {!loading && !isAuthenticated ? (
          <Text variant="bodyMedium" style={styles.subtitle}>Log in to view your bookings</Text>
        ) : (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {loading ? 'Loading...' : `${bookings.length} booking(s)`}
          </Text>
        )}
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-lock" size={64} color={Colors.text.tertiary} style={styles.emptyIcon} />
          <Text variant="titleMedium" style={styles.emptyTitle}>Login Required</Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>Please log in to view your bookings</Text>
          <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.searchButton}>
            Log In
          </Button>
        </View>
      ) : (
        <FlatList 
          data={bookings} 
          renderItem={renderBooking} 
          keyExtractor={(item) => item.id} 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color={Colors.text.tertiary} style={styles.emptyIcon} />
              <Text variant="titleMedium" style={styles.emptyTitle}>No bookings yet</Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>Your bookings will appear here</Text>
              <Button mode="contained" onPress={() => navigation.navigate('PropertyList', {})} style={styles.searchButton}>
                Search Properties
              </Button>
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
  title: { color: Colors.text.primary, marginBottom: Spacing.xs },
  subtitle: { color: Colors.text.secondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: Spacing.lg },
  card: { marginBottom: Spacing.lg, backgroundColor: Colors.background.card, borderRadius: BorderRadius.lg },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  propertyInfo: { flex: 1, marginRight: Spacing.md },
  propertyName: { color: Colors.text.primary, marginBottom: Spacing.xs },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { marginRight: Spacing.xs, fontSize: 12 },
  location: { color: Colors.text.secondary },
  statusChip: { height: 28 },
  statusText: { fontSize: 12, fontWeight: '600' },
  divider: { marginVertical: Spacing.md },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  detailIcon: { fontSize: 20, marginRight: Spacing.sm },
  detailLabel: { color: Colors.text.tertiary, marginBottom: 2 },
  detailValue: { color: Colors.text.primary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: {},
  priceLabel: { color: Colors.text.tertiary, marginBottom: 2 },
  priceValue: { color: Colors.primary, fontWeight: 'bold' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  viewButton: { marginRight: Spacing.sm },
  buttonContent: { paddingVertical: Spacing.xs },
  cancelButton: {},
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.lg },
  emptyTitle: { color: Colors.text.primary, marginBottom: Spacing.xs },
  emptySubtitle: { color: Colors.text.secondary, marginBottom: Spacing.lg },
  searchButton: { marginTop: Spacing.sm },
});