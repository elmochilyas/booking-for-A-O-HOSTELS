import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/MainNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoomSelection'>;
  route: RouteProp<RootStackParamList, 'RoomSelection'>;
};

const mockRooms = [
  { id: '1', type: 'Bed in Mixed Dorm', capacity: 1, price: 25, available: 5 },
  { id: '2', type: 'Bed in Female Dorm', capacity: 1, price: 28, available: 3 },
  { id: '3', type: 'Double Room', capacity: 2, price: 65, available: 2 },
  { id: '4', type: 'Family Room', capacity: 4, price: 120, available: 1 },
];

export default function RoomSelectionScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;

  const handleSelectRoom = (roomId: string) => {
    navigation.navigate('Checkout', { roomId });
  };

  const renderRoom = ({ item }: { item: typeof mockRooms[0] }) => (
    <Card style={styles.card}>
      <Card.Title title={item.type} subtitle={`${item.capacity} guest • €${item.price}/night`} />
      <Card.Content>
        <Text>{item.available} rooms available</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleSelectRoom(item.id)}>Select</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList data={mockRooms} renderItem={renderRoom} keyExtractor={(item) => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 12 },
});