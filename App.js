import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CoursScreen from './src/screens/CoursScreen';
import ExosScreen from './src/screens/ExosScreen';
import { COLORS } from './src/config';

const Tab = createBottomTabNavigator();
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: COLORS.bg, card: COLORS.card, border: COLORS.border, primary: COLORS.accent, text: COLORS.text } };

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: COLORS.accent, tabBarInactiveTintColor: COLORS.muted }}>
          <Tab.Screen name="Cours" component={CoursScreen} options={{ tabBarIcon: () => <Text>📚</Text> }} />
          <Tab.Screen name="Exos" component={ExosScreen} options={{ tabBarIcon: () => <Text>🧪</Text> }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
