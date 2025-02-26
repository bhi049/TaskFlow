import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { TaskListScreen } from './src/screens/TaskListScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#999',
                headerShown: false,
              }}
            >
              <Tab.Screen
                name="Tasks"
                component={TaskListScreen}
                options={{
                  tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                    <MaterialCommunityIcons name="checkbox-marked" size={size} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                    <MaterialCommunityIcons name="account" size={size} color={color} />
                  ),
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
} 