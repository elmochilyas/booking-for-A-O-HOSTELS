import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, List, Avatar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function ProfileScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Avatar.Text size={80} label="JD" style={styles.avatar} />
      <Text variant="headlineSmall" style={styles.name}>John Doe</Text>
      <Text variant="bodyMedium" style={styles.email}>john@example.com</Text>
      
      <View style={styles.menu}>
        <List.Item title="My Bookings" left={(props) => <List.Icon {...props} icon="calendar" />} />
        <List.Item title="Payment Methods" left={(props) => <List.Icon {...props} icon="credit-card" />} />
        <TouchableOpacity onPress={() => navigation.navigate('NotificationPreferences')}>
          <List.Item title="Notifications" left={(props) => <List.Icon {...props} icon="bell" />} />
        </TouchableOpacity>
        <List.Item title="A&O Club" left={(props) => <List.Icon {...props} icon="star" />} />
      </View>
      
      <Button mode="outlined" onPress={() => navigation.replace('Login')} style={styles.logout}>
        Log Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  avatar: { marginTop: 24, marginBottom: 16 },
  name: { marginBottom: 4 },
  email: { color: '#666', marginBottom: 24 },
  menu: { width: '100%' },
  logout: { marginTop: 24 },
});