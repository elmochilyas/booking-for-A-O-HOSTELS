import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ImageBackground, Dimensions } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { propertiesApi } from '../services/api';
import { getApiBaseUrl } from '../config/environment';
import { Spacing, Colors, BorderRadius } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PropertyList'>;
  route: { params?: RootStackParamList['PropertyList'] };
};

interface Property {
  id: string;
  name: string;
  location: string;
  address?: string;
  description?: string;
  price: number;
  rating: number;
  review_count: number;
  images?: string[];
  image_url?: string;
  image?: string;
}

export default function PropertyListScreen({ navigation, route }: Props) {
  const { location, checkIn, checkOut, guests } = route.params || {};
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [location, checkIn, checkOut, guests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  }, [location, checkIn, checkOut, guests]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertiesApi.getAll({ location, checkIn, checkOut, guests });
      setProperties(response.data.properties || response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const renderProperty = ({ item }: { item: Property }) => {
    const getImageUri = () => {
      if (item.images && item.images.length > 0) {
        const firstImage = item.images[0];
        if (firstImage.startsWith('http')) return firstImage;
        return `${getApiBaseUrl().replace('/api', '')}/storage/${firstImage}`;
      }
      if (item.image_url) return item.image_url;
      if (item.image) return item.image;
      return null;
    };
    
    const imageUri = getImageUri();
    
    return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id, checkIn, checkOut, guests })}
      activeOpacity={0.9}
    >
      <Surface style={styles.card} elevation={2}>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <ImageBackground
              source={{ uri: imageUri }}
              style={styles.propertyImage}
              imageStyle={styles.propertyImageStyle}
            >
              <View style={styles.imageOverlay}>
                <View style={styles.topBadges}>
                  <Chip style={styles.ratingChip} textStyle={styles.ratingChipText}>
                    ⭐ {typeof item.rating === 'number' ? item.rating.toFixed(1) : 'N/A'}
                  </Chip>
                </View>
                <View style={styles.bottomOverlay}>
                  <View style={styles.priceContainer}>
                    <Text variant="labelSmall" style={styles.priceLabel}>From</Text>
                    <Text variant="titleLarge" style={styles.priceValue}>€{item.price}</Text>
                    <Text variant="labelSmall" style={styles.priceUnit}>/night</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialCommunityIcons name="bed" size={48} color={Colors.text.tertiary} />
              <Text variant="bodySmall" style={styles.noImageText}>No image available</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color={Colors.primary} style={styles.locationIcon} />
            <Text variant="bodySmall" style={styles.location} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={12} color={Colors.warning} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text variant="labelSmall" style={styles.reviewText}>({item.review_count} reviews)</Text>
            <View style={styles.amenityIndicator}>
              <MaterialCommunityIcons name="wifi" size={12} color={Colors.success} />
              <Text variant="labelSmall" style={styles.amenityText}>WiFi</Text>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text variant="titleLarge" style={styles.title}>{location || 'All Properties'}</Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {loading ? 'Searching...' : `${properties.length} properties found`}
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="home-group" size={28} color={Colors.primary} />
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={Colors.error} style={styles.emptyIcon} />
          <Text variant="titleMedium" style={styles.emptyTitle}>Something went wrong</Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>{error}</Text>
          <Button mode="contained" onPress={fetchProperties} style={styles.retryButton}>
            Try Again
          </Button>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
              <MaterialCommunityIcons name="home-search" size={64} color={Colors.text.tertiary} style={styles.emptyIcon} />
              <Text variant="titleMedium" style={styles.emptyTitle}>No properties found</Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                {location ? `No properties in "${location}"` : 'Try a different search location'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  header: { padding: Spacing.lg, paddingBottom: Spacing.lg, backgroundColor: Colors.background.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border.default },
  headerContent: { flex: 1 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  title: { color: Colors.text.primary, marginBottom: Spacing.xs, fontWeight: '600' },
  subtitle: { color: Colors.text.secondary, fontSize: 13 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: Spacing.xxxl },
  listContent: { padding: Spacing.lg, paddingTop: Spacing.lg },
  card: { marginBottom: Spacing.xl, backgroundColor: Colors.background.card, borderRadius: BorderRadius.xl, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  imageContainer: { height: 170, backgroundColor: Colors.neutral[100], position: 'relative' },
  propertyImage: { flex: 1, justifyContent: 'space-between' },
  propertyImageStyle: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', padding: Spacing.lg },
  topBadges: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  ratingChip: { backgroundColor: Colors.background.primary + 'F5', elevation: 3 },
  ratingChipText: { color: Colors.text.primary, fontSize: 13, fontWeight: '600' },
  bottomOverlay: { alignItems: 'flex-end' },
  priceContainer: { backgroundColor: Colors.background.primary + 'FA', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'flex-end', elevation: 2 },
  priceLabel: { color: Colors.text.secondary, fontSize: 11 },
  priceValue: { color: Colors.primary, fontWeight: '700', fontSize: 20 },
  priceUnit: { color: Colors.text.tertiary, fontSize: 11 },
  noImageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: Colors.text.tertiary, marginTop: Spacing.sm },
  content: { padding: Spacing.lg, paddingTop: Spacing.md },
  name: { color: Colors.text.primary, marginBottom: Spacing.sm, fontWeight: '600', fontSize: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  locationIcon: { marginRight: Spacing.xs },
  location: { color: Colors.text.secondary, flex: 1, fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warning + '20', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  ratingText: { fontWeight: '600', color: Colors.warning, fontSize: 13, marginLeft: 4 },
  reviewText: { color: Colors.text.tertiary, fontSize: 12 },
  amenityIndicator: { flexDirection: 'row', alignItems: 'center' },
  amenityText: { color: Colors.success, marginLeft: 4, fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.xl },
  emptyIcon: { fontSize: 72, marginBottom: Spacing.lg },
  emptyTitle: { color: Colors.text.primary, marginBottom: Spacing.sm, fontSize: 18 },
  emptySubtitle: { color: Colors.text.secondary, textAlign: 'center', marginBottom: Spacing.xl, fontSize: 14 },
  retryButton: { marginTop: Spacing.md },
});