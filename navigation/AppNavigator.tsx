import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import UserGuideScreen from '../screens/UserGuideScreen';
import InputScreen from '../screens/InputScreen';
import { COLORS } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home stack with Home and Input screens
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{
          title: 'PDF Report Maker',
          headerStyle: {
            backgroundColor: COLORS.MIDNIGHT,
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="Input" 
        component={InputScreen}
        options={{
          title: 'Create Report',
          headerStyle: {
            backgroundColor: COLORS.MIDNIGHT,
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// Main app navigator with tabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Guide') {
              iconName = focused ? 'book' : 'book-outline';
            }
            
            // Use type assertion to fix TypeScript error
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.RED,
          tabBarInactiveTintColor: COLORS.SPACE,
          headerStyle: {
            backgroundColor: COLORS.MIDNIGHT,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStack} 
          options={{
            headerShown: false, // Hide header since HomeStack has its own
          }}
        />
        <Tab.Screen 
          name="Guide" 
          component={UserGuideScreen} 
          options={{
            title: 'User Guide'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}