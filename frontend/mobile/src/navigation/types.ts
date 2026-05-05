import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Search: undefined;
  PropertyList: { location?: string; checkIn?: string; checkOut?: string; guests?: number };
  PropertyDetail: { propertyId: string; checkIn?: string; checkOut?: string; guests?: number };
  RoomSelection: { propertyId: string; checkIn?: string; checkOut?: string; guests?: number };
  Checkout: { roomId: string; propertyId?: string; checkIn?: string; checkOut?: string; guestCount?: number };
  BookingConfirmation: { bookingId: string };
  Login: undefined;
  Register: undefined;
  NotificationPreferences: undefined;
};
