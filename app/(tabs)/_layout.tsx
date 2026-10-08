import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Chrome as Home, MessageCircle, MapPin, Bot, Search } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#ad8b73',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f5f5f5',
          height: Platform.OS === 'ios' ? 88 : Platform.OS === 'web' ? 72 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : Platform.OS === 'web' ? 12 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito-Regular',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pawsearch"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="compawnion"
        options={{
          title: 'Furlo AI',
          tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}