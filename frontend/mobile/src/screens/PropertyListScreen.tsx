import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PropertyList'>;
};

const mockProperties = [
  { id: '1', name: 'A&O Berlin Hauptbahnhof', location: 'Berlin', price: 25, rating: 4.5 },
  { id: '2', name: 'A&O München Hauptbahnhof', location: 'Munich', price: 30, rating: 4.3 },
];

export default function PropertyListScreen({ navigation }: Props) {
  const renderProperty = ({ item }: { item: typeof mockProperties[0] }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}>
      <Card style={styles.card}>
        <Card.Title title={item.name} subtitle={item.location} />
        <Card.Content>
          <Text>From €{item.price}/night</Text>
          <Text>Rating: {item.rating}⭐</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 12 },
});