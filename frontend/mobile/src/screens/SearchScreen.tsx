import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ImageBackground, FlatList, Pressable, useWindowDimensions } from 'react-native';
import { TextInput, Button, Text, Card, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { Spacing, Colors, BorderRadius } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { propertiesApi } from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

interface Destination {
  id: string;
  city: string;
  country: string;
  properties: number;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  highlights: string[];
}

const cityImages: Record<string, string> = {
  'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
  'Munich': 'https://images.unsplash.com/photo-1598927818659-72b55fcb90de?w=800&q=80',
  'Hamburg': 'https://images.unsplash.com/photo-1568627256550-6673e8e1a4c2?w=800&q=80',
  'Frankfurt': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
  'Cologne': 'https://images.unsplash.com/photo-1544144433-d50aff500b91?w=800&q=80',
  'Dresden': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
  'Stuttgart': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80',
  'Leipzig': 'https://images.unsplash.com/photo-1580339755966-7162a0f03d6e?w=800&q=80',
  'Heidelberg': 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80',
};

const cityDescriptions: Record<string, string> = {
  'Berlin': 'Vibrant art scene & historic landmarks',
  'Munich': 'Bavarian charm & world-class breweries',
  'Hamburg': 'Port city with stunning waterways',
  'Frankfurt': 'Financial hub with historic old town',
  'Cologne': 'Cathedral city on the Rhine',
  'Dresden': 'Elbe Florence with baroque architecture',
  'Stuttgart': 'Auto city & royal palaces',
  'Leipzig': 'Creative hub with rich music heritage',
  'Heidelberg': 'Romantic old town & castle ruins',
};

const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

// Fallback destinations when API is not available
const fallbackDestinations: Destination[] = [
  { id: '1', city: 'Berlin', country: 'Germany', properties: 245, priceFrom: 45, rating: 8.7, reviewCount: 18420, image: cityImages['Berlin'] || defaultImage, description: 'Vibrant art scene & historic landmarks', highlights: [] },
  { id: '2', city: 'Munich', country: 'Germany', properties: 186, priceFrom: 62, rating: 8.9, reviewCount: 12350, image: cityImages['Munich'] || defaultImage, description: 'Bavarian charm & world-class breweries', highlights: [] },
  { id: '3', city: 'Hamburg', country: 'Germany', properties: 156, priceFrom: 55, rating: 8.5, reviewCount: 9870, image: cityImages['Hamburg'] || defaultImage, description: 'Port city with stunning waterways', highlights: [] },
  { id: '4', city: 'Frankfurt', country: 'Germany', properties: 134, priceFrom: 58, rating: 8.3, reviewCount: 7650, image: cityImages['Frankfurt'] || defaultImage, description: 'Financial hub with historic old town', highlights: [] },
  { id: '5', city: 'Cologne', country: 'Germany', properties: 178, priceFrom: 49, rating: 8.4, reviewCount: 11200, image: cityImages['Cologne'] || defaultImage, description: 'Cathedral city on the Rhine', highlights: [] },
  { id: '6', city: 'Dresden', country: 'Germany', properties: 89, priceFrom: 42, rating: 8.6, reviewCount: 5400, image: cityImages['Dresden'] || defaultImage, description: 'Elbe Florence with baroque architecture', highlights: [] },
  { id: '7', city: 'Stuttgart', country: 'Germany', properties: 78, priceFrom: 52, rating: 8.2, reviewCount: 4200, image: cityImages['Stuttgart'] || defaultImage, description: 'Auto city & royal palaces', highlights: [] },
  { id: '8', city: 'Leipzig', country: 'Germany', properties: 95, priceFrom: 38, rating: 8.5, reviewCount: 6100, image: cityImages['Leipzig'] || defaultImage, description: 'Creative hub with rich music heritage', highlights: [] },
  { id: '9', city: 'Heidelberg', country: 'Germany', properties: 67, priceFrom: 65, rating: 9.0, reviewCount: 3800, image: cityImages['Heidelberg'] || defaultImage, description: 'Romantic old town & castle ruins', highlights: [] },
];

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function SearchScreen({ navigation }: Props) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CARD_WIDTH = SCREEN_WIDTH * 0.7;
  const CITY_CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2 - 4;

  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState('1');
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await propertiesApi.getDestinations();
      const destData = (response.data.destinations || []).map((dest: Record<string, unknown>, index: number): Destination => ({
        id: (dest.city as string) || String(index),
        city: (dest.city as string) || '',
        country: (dest.country as string) || 'Germany',
        properties: (dest.properties as number) || 0,
        priceFrom: (dest.priceFrom as number) || 0,
        rating: (dest.rating as number) || 0,
        reviewCount: (dest.reviewCount as number) || 0,
        image: cityImages[dest.city as string] || defaultImage,
        description: cityDescriptions[dest.city as string] || `Explore ${dest.city}`,
        highlights: [],
      }));
      setDestinations(destData.length > 0 ? destData : fallbackDestinations);
    } catch (error: unknown) {
      console.log('Failed to fetch destinations:', error instanceof Error ? error.message : error);
      // Use fallback destinations when API fails
      setDestinations(fallbackDestinations);
    } finally {
      setLoadingDestinations(false);
    }
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const minCheckInDate = today;
  const minCheckOutDate = useMemo(() => {
    if (checkInDate) {
      return new Date(checkInDate);
    }
    return tomorrow;
  }, [checkInDate, tomorrow]);

  const handleCheckInChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      if (checkOutDate && checkOutDate <= selectedDate) {
        const newCheckOut = new Date(selectedDate);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOutDate(newCheckOut);
      }
    }
  };

  const handleCheckOutChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  const handleSearch = () => {
    if (!location.trim()) {
      Alert.alert('Required', 'Please enter a destination');
      return;
    }

    if (checkInDate && checkInDate < minCheckInDate) {
      Alert.alert('Invalid Date', 'Check-in date cannot be in the past');
      return;
    }

    if (checkOutDate && checkInDate && checkOutDate <= checkInDate) {
      Alert.alert('Invalid Date', 'Check-out must be after check-in');
      return;
    }

    navigation.navigate('PropertyList', {
      location: location.trim(),
      checkIn: checkInDate ? formatDate(checkInDate) : undefined,
      checkOut: checkOutDate ? formatDate(checkOutDate) : undefined,
      guests: parseInt(guests, 10) || 1,
    });
  };

  const handleDestinationSelect = (city: string) => {
    setLocation(city);
    navigation.navigate('PropertyList', {
      location: city,
      checkIn: undefined,
      checkOut: undefined,
      guests: 1,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80' }}
            style={styles.hero}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroOverlay}>
              <Text variant="headlineMedium" style={styles.title}>
                Find Your Stay
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Search for hotels, hostels, and apartments
              </Text>
            </View>
          </ImageBackground>

          <Surface style={styles.searchCard} elevation={2}>
            <Card.Content>
              <View style={styles.searchHeader}>
                <MaterialCommunityIcons name="magnify" size={24} color={Colors.primary} />
                <Text variant="titleMedium" style={styles.searchTitle}>Search Properties</Text>
              </View>
              
              <TextInput
                label="Where do you want to go?"
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="map-marker" />}
                placeholder="City or destination"
                outlineColor={Colors.border.default}
                activeOutlineColor={Colors.primary}
              />
              
              <View style={styles.dateRow}>
                <Surface style={styles.dateInput} elevation={1}>
                  <TouchableOpacity 
                    style={styles.dateButtonInner}
                    onPress={() => setShowCheckInPicker(true)}
                  >
                    <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
                    <View style={styles.dateTextContainer}>
                      <Text variant="labelSmall" style={styles.dateLabel}>Check-in</Text>
                      <Text variant="bodyMedium" style={[styles.dateValue, !checkInDate && styles.datePlaceholder]}>
                        {checkInDate ? formatDate(checkInDate) : 'Select'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Surface>

                <Surface style={styles.dateInput} elevation={1}>
                  <TouchableOpacity 
                    style={styles.dateButtonInner}
                    onPress={() => setShowCheckOutPicker(true)}
                  >
                    <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
                    <View style={styles.dateTextContainer}>
                      <Text variant="labelSmall" style={styles.dateLabel}>Check-out</Text>
                      <Text variant="bodyMedium" style={[styles.dateValue, !checkOutDate && styles.datePlaceholder]}>
                        {checkOutDate ? formatDate(checkOutDate) : 'Select'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Surface>
              </View>

              {showCheckInPicker && (
                <DateTimePicker
                  value={checkInDate || today}
                  minimumDate={minCheckInDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleCheckInChange}
                />
              )}

              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOutDate || tomorrow}
                  minimumDate={minCheckOutDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleCheckOutChange}
                />
              )}
              
              <View style={styles.guestRow}>
                <TextInput
                  label="Guests"
                  value={guests}
                  onChangeText={(text) => {
                    const num = text.replace(/[^0-9]/g, '');
                    setGuests(num);
                  }}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.guestInput}
                  left={<TextInput.Icon icon="account-group" />}
                  outlineColor={Colors.border.default}
                  activeOutlineColor={Colors.primary}
                />
              </View>
              
                <Button 
                  mode="contained" 
                  onPress={handleSearch} 
                  style={styles.searchButton}
                  contentStyle={styles.buttonContent}
                  icon="magnify"
                  buttonColor={Colors.primary}
                  accessibilityLabel="Search properties"
                  accessibilityRole="button"
                >
                  Search Properties
                </Button>
            </Card.Content>
          </Surface>

          <View style={styles.popularSection}>
            {!loadingDestinations && destinations.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text variant="titleLarge" style={styles.sectionTitle}>Featured Destinations</Text>
                  <TouchableOpacity>
                    <Text variant="labelLarge" style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  horizontal
                  data={destinations.slice(0, 5)}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredList}
                  snapToInterval={CARD_WIDTH + Spacing.md}
                  decelerationRate="fast"
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => handleDestinationSelect(item.city)}
                      style={({ pressed }) => [styles.featuredCard, { width: CARD_WIDTH }, pressed && styles.cardPressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${item.city}, ${item.country}`}
                    >
                      <ImageBackground
                        source={{ uri: item.image || defaultImage }}
                        style={styles.featuredCardImage}
                        imageStyle={styles.featuredImageStyle}
                        onError={() => console.log(`Failed to load image for ${item.city}`)}
                      >
                        <View style={styles.featuredOverlay}>
                          <View style={styles.ratingBadge}>
                            <MaterialCommunityIcons name="star" size={12} color="#FFF" />
                            <Text variant="labelSmall" style={styles.ratingText}>{typeof item.rating === 'number' ? item.rating.toFixed(1) : 'N/A'}</Text>
                            <Text variant="labelSmall" style={styles.reviewText}>({item.reviewCount.toLocaleString()})</Text>
                          </View>
                          
                          <View style={styles.featuredInfo}>
                            <Text variant="titleMedium" style={styles.featuredCity}>{item.city}</Text>
                            <Text variant="labelMedium" style={styles.featuredCountry}>{item.country}</Text>
                            <Text variant="bodySmall" style={styles.featuredDesc} numberOfLines={1}>{item.description}</Text>
                          </View>
                          
                          <View style={styles.featuredFooter}>
                            <View>
                              <Text variant="labelSmall" style={styles.priceLabel}>From</Text>
                              <Text variant="titleMedium" style={styles.priceValue}>€{item.priceFrom}</Text>
                            </View>
                            <View style={styles.propertiesBadge}>
                              <Text variant="labelSmall" style={styles.propertiesText}>{item.properties} properties</Text>
                            </View>
                          </View>
                        </View>
                      </ImageBackground>
                    </Pressable>
                  )}
                />

                {destinations.length > 5 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text variant="titleSmall" style={styles.sectionTitleSecondary}>More Destinations</Text>
                    </View>

                    <View style={styles.citiesGrid}>
                      {destinations.slice(5).map((city) => (
                        <Pressable
                          key={city.id}
                          onPress={() => handleDestinationSelect(city.city)}
                          style={({ pressed }) => [styles.cityCard, pressed && styles.cardPressed]}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${city.city}, ${city.country}`}
                        >
                          <ImageBackground
                            source={{ uri: city.image }}
                            style={styles.cityCardImage}
                            imageStyle={styles.cityImageStyle}
                          >
                            <View style={styles.cityOverlay}>
                              <View style={styles.cityInfo}>
                                <Text variant="titleSmall" style={styles.cityName}>{city.city}</Text>
                                <Text variant="labelSmall" style={styles.cityCountry}>{city.country}</Text>
                              </View>
                              <View style={styles.cityStats}>
                                <View style={styles.cityRating}>
                                  <MaterialCommunityIcons name="star" size={10} color="#FFD700" />
                                  <Text variant="labelSmall" style={styles.cityRatingText}>{typeof city.rating === 'number' ? city.rating.toFixed(1) : 'N/A'}</Text>
                                </View>
                                <Text variant="labelSmall" style={styles.cityPrice}>from €{city.priceFrom}</Text>
                              </View>
                            </View>
                          </ImageBackground>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}

                <Card style={styles.trendingCard}>
                  <Card.Content style={styles.trendingContent}>
                    <View style={styles.trendingHeader}>
                      <MaterialCommunityIcons name="trending-up" size={24} color={Colors.secondary} />
                      <Text variant="titleMedium" style={styles.trendingTitle}>Trending this week</Text>
                    </View>
                    <View style={styles.trendingList}>
                      {destinations.slice(0, 3).map((dest, idx) => (
                        <TouchableOpacity key={dest.id} style={styles.trendingItem} onPress={() => handleDestinationSelect(dest.city)}>
                          <View style={styles.trendingRank}>
                            <Text variant="labelMedium" style={styles.rankText}>{idx + 1}</Text>
                          </View>
                          <View style={styles.trendingInfo}>
                            <Text variant="bodyMedium" style={styles.trendingCity}>{dest.city}</Text>
                            <Text variant="bodySmall" style={styles.trendingProperties}>{dest.properties} properties</Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.text.tertiary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              </>
            ) : loadingDestinations ? (
              <View style={styles.loadingContainer}>
                <Text variant="bodyMedium" style={styles.loadingText}>Loading destinations...</Text>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text variant="bodyMedium" style={styles.noDataText}>No destinations available</Text>
              </View>
            )}
          </View>

          <View style={styles.features}>
            <Card style={styles.featureCard}>
              <Card.Content style={styles.featureContent}>
                <MaterialCommunityIcons name="tag-outline" size={28} color={Colors.primary} style={styles.featureIcon} />
                <View style={styles.featureText}>
                  <Text variant="titleSmall" style={styles.featureTitle}>Best Price Guarantee</Text>
                  <Text variant="bodySmall" style={styles.featureDesc}>Find a lower price? We'll match it!</Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard}>
              <Card.Content style={styles.featureContent}>
                <MaterialCommunityIcons name="shield-check-outline" size={28} color={Colors.primary} style={styles.featureIcon} />
                <View style={styles.featureText}>
                  <Text variant="titleSmall" style={styles.featureTitle}>Secure Booking</Text>
                  <Text variant="bodySmall" style={styles.featureDesc}>Your data is safe with us</Text>
                </View>
              </Card.Content>
            </Card>
            
            <Card style={styles.featureCard}>
              <Card.Content style={styles.featureContent}>
                <MaterialCommunityIcons name="headset" size={28} color={Colors.primary} style={styles.featureIcon} />
                <View style={styles.featureText}>
                  <Text variant="titleSmall" style={styles.featureTitle}>24/7 Support</Text>
                  <Text variant="bodySmall" style={styles.featureDesc}>We're here to help anytime</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: { height: 200, justifyContent: 'center', alignItems: 'center' },
  heroImage: { borderBottomLeftRadius: BorderRadius.xl, borderBottomRightRadius: BorderRadius.xl },
  heroOverlay: { 
    flex: 1, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomLeftRadius: BorderRadius.xl, 
    borderBottomRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  title: { color: Colors.text.inverse, marginBottom: Spacing.xs, textAlign: 'center', fontWeight: '700', fontSize: 28 },
  subtitle: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: Spacing.lg },
  searchCard: { marginHorizontal: Spacing.lg, marginTop: -Spacing.xl, backgroundColor: Colors.background.card, borderRadius: BorderRadius.xl, overflow: 'hidden', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  searchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border.default },
  searchTitle: { marginLeft: Spacing.sm, color: Colors.text.primary, fontWeight: '600' },
  input: { marginBottom: Spacing.md, backgroundColor: Colors.background.primary },
  dateRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  dateInput: { flex: 1, backgroundColor: Colors.background.secondary, borderRadius: BorderRadius.md, overflow: 'hidden' },
  dateButtonInner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  dateTextContainer: { marginLeft: Spacing.sm, flex: 1 },
  dateLabel: { color: Colors.text.secondary, marginBottom: 2 },
  dateValue: { color: Colors.text.primary },
  datePlaceholder: { color: Colors.text.tertiary },
  guestRow: { marginBottom: Spacing.sm },
  guestInput: { backgroundColor: Colors.background.primary },
  searchButton: { marginTop: Spacing.sm, borderRadius: BorderRadius.md },
  buttonContent: { paddingVertical: Spacing.xs },
  popularSection: { marginTop: Spacing.md, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, paddingHorizontal: Spacing.lg },
  sectionTitle: { color: Colors.text.primary, fontWeight: '700', fontSize: 17 },
  sectionTitleSecondary: { color: Colors.text.primary, fontWeight: '600', marginBottom: Spacing.md, paddingHorizontal: Spacing.lg, fontSize: 16 },
  seeAllText: { color: Colors.primary, fontWeight: '600' },
  seeAllTextSmall: { color: Colors.primary },
  featuredList: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.sm },
  featuredCard: { width: CARD_WIDTH, height: 200, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  featuredCardImage: { flex: 1, justifyContent: 'space-between' },
  featuredImageStyle: { borderRadius: BorderRadius.lg },
  featuredOverlay: { flex: 1, justifyContent: 'space-between', padding: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.25)' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: Spacing.xs, paddingVertical: 2, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  ratingText: { color: '#FFF', fontWeight: '700', marginLeft: 2, fontSize: 11 },
  reviewText: { color: 'rgba(255,255,255,0.8)', marginLeft: 2, fontSize: 10 },
  featuredInfo: { alignItems: 'flex-start' },
  featuredCity: { color: '#FFF', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, fontSize: 15 },
  featuredCountry: { color: 'rgba(255,255,255,0.9)', marginBottom: 2 },
  featuredDesc: { color: 'rgba(255,255,255,0.8)', maxWidth: '80%', fontSize: 11 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  priceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9 },
  priceValue: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  propertiesBadge: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: Spacing.xs, paddingVertical: 2, borderRadius: BorderRadius.sm },
  propertiesText: { color: Colors.text.primary, fontWeight: '600', fontSize: 10 },
  citiesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  cityCard: { width: CITY_CARD_WIDTH, height: 130, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  cityCardImage: { flex: 1, justifyContent: 'flex-end' },
  cityImageStyle: { borderRadius: BorderRadius.lg },
  cityOverlay: { flex: 1, justifyContent: 'space-between', padding: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.35)' },
  cityInfo: {},
  cityName: { color: '#FFF', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, fontSize: 14 },
  cityCountry: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  cityStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cityRating: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  cityRatingText: { color: '#FFD700', fontWeight: '600', marginLeft: 2, fontSize: 10 },
  cityPrice: { color: '#FFF', fontWeight: '600', fontSize: 11 },
  trendingCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: Spacing.md, backgroundColor: Colors.background.card, borderRadius: BorderRadius.lg },
  trendingContent: { padding: Spacing.sm },
  trendingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  trendingTitle: { color: Colors.text.primary, fontWeight: '600', marginLeft: Spacing.sm, fontSize: 15 },
  trendingList: {},
  trendingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border.default },
  trendingRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  rankText: { color: '#FFF', fontWeight: '700', fontSize: 11 },
  trendingInfo: { flex: 1 },
  trendingCity: { color: Colors.text.primary, fontWeight: '600', fontSize: 14 },
  trendingProperties: { color: Colors.text.secondary, fontSize: 11 },
  loadingContainer: { padding: Spacing.xl, alignItems: 'center' },
  loadingText: { color: Colors.text.secondary },
  noDataContainer: { padding: Spacing.xl, alignItems: 'center' },
  noDataText: { color: Colors.text.secondary },
  features: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  featureCard: { backgroundColor: Colors.background.card, borderRadius: BorderRadius.lg },
  featureContent: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm },
  featureIcon: { marginRight: Spacing.sm },
  featureText: { flex: 1 },
  featureTitle: { color: Colors.text.primary, marginBottom: 2, fontSize: 14 },
  featureDesc: { color: Colors.text.secondary, fontSize: 12 },
});