import { Image } from 'expo-image';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ name, color }: { name: string; color: string }) {
  return (
    <Image
      source={`${name}`}
      style={{ width: 24, height: 24 }}
      tintColor={color}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        tabBarStyle: {
          backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
          borderTopColor: isDark ? '#1A1A1A' : '#EEE',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
          // tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
          // tabBarIcon: ({ color }) => <TabIcon name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          // tabBarIcon: ({ color }) => (
          //   <TabIcon name="bubble.left.and.bubble.right.fill" color={color} />
          // ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          // tabBarIcon: ({ color }) => <TabIcon name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
