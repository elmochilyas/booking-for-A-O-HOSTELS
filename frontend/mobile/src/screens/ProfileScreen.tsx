import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, List, Avatar, Divider, ActivityIndicator, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Colors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { guest, logout, fetchProfile, isAuthenticated } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: async () => {
          setLoading(true);
          await logout();
          setLoading(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }},
      ],
      { cancelable: true }
    );
  };

  const getInitials = () => {
    if (!guest) return '?';
    return `${guest.first_name?.[0] || ''}${guest.last_name?.[0] || ''}`.toUpperCase() || '?';
  };

  const getDisplayName = () => {
    if (!guest) return 'Guest';
    return `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Guest';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={getInitials()} 
          style={styles.avatar} 
        />
        <Text variant="headlineSmall" style={styles.name}>{getDisplayName()}</Text>
        <Text variant="bodyMedium" style={styles.email}>{guest?.email || 'Not logged in'}</Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.menu}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Bookings' } as any)}>
          <List.Item 
            title="My Bookings" 
            titleStyle={styles.menuTitle}
            left={(props) => <List.Icon {...props} icon="calendar" color={Colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available in a future update.')}>
          <List.Item 
            title="Payment Methods" 
            titleStyle={styles.menuTitle}
            left={(props) => <List.Icon {...props} icon="credit-card" color={Colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('NotificationPreferences')}>
          <List.Item 
            title="Notifications" 
            titleStyle={styles.menuTitle}
            left={(props) => <List.Icon {...props} icon="bell" color={Colors.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <List.Item 
            title="Dark Mode" 
            titleStyle={styles.menuTitle}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" color={Colors.primary} />}
            right={() => <Switch value={isDark} onValueChange={toggleTheme} color={Colors.primary} />}
          />
        </View>
        
        <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'A&O Club loyalty program will be available in a future update.')}>
          <List.Item 
            title="A&O Club" 
            titleStyle={styles.menuTitle}
            left={(props) => <List.Icon {...props} icon="star" color={Colors.secondary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => Alert.alert('Help & Support', 'For assistance, please contact:\n\n📧 support@aohostels.com\n📞 +49 30 123 456 78\n\nOur team is available 24/7.')}>
          <List.Item 
            title="Help & Support" 
            titleStyle={styles.menuTitle}
            left={(props) => <List.Icon {...props} icon="help-circle" color={Colors.text.secondary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Button 
            mode="outlined" 
            onPress={handleLogout} 
            style={styles.logoutButton}
            textColor={Colors.danger}
            icon="logout"
          >
            Log Out
          </Button>
        )}
        <Text variant="labelSmall" style={styles.version}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatar: { marginBottom: Spacing.md, backgroundColor: Colors.primary },
  name: { marginBottom: Spacing.xs, color: Colors.text.primary },
  email: { color: Colors.text.secondary },
  divider: { marginHorizontal: Spacing.lg },
  menu: { flex: 1, paddingHorizontal: Spacing.sm, paddingTop: Spacing.sm },
  menuTitle: { color: Colors.text.primary },
  switchRow: { marginVertical: Spacing.xs },
  footer: { padding: Spacing.lg, alignItems: 'center' },
  logoutButton: { 
    borderColor: Colors.danger, 
    marginBottom: Spacing.md,
    width: '100%',
  },
  version: { color: Colors.text.tertiary },
});