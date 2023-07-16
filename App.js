import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ScreenB from './navigation/screens/ScreenB';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Social from './navigation/screens/Social';
import ProfileScreen from './navigation/screens/ProfileScreen';
import MapsScreen from './navigation/screens/MapsScreen';
import { View } from 'react-native-animatable';
import RootNavigation from './navigation';


const Tab = createMaterialBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, size, color }) => {
            let iconName;
            if (route.name === 'Map') {
              iconName = 'map';
              size = focused ? 25 : 20;
              // color = focused ? '#f0f' : '#555';
            } else if (route.name === 'Discovery') {
              iconName = 'beer';
              size = focused ? 25 : 20;
              // color = focused ? '#f0f' : '#555';
            }
            else if (route.name === 'Social') {
              iconName = 'users';
              size = focused ? 25 : 20;
              // color = focused ? '#f0f' : '#555';
            }
            else if (route.name === 'Notification') {
              iconName = 'bell';
              size = focused ? 25 : 20;
              // color = focused ? '#f0f' : '#555';
            }
            else if (route.name === 'Profile') {
              iconName = 'user-circle';
              size = focused ? 25 : 20;
              // color = focused ? '#f0f' : '#555';
            }
            return (
              <FontAwesome5
                name={iconName}
                size={size}
                color={color}
              />
            )
          },
        })}
        tabBarOptions={{
          activeTintColor: '#f0f',
          inactiveTintColor: '#555',
          activeBackgroundColor: '#fff',
          inactiveBackgroundColor: '#999',
          showLabel: false,
          labelStyle: { fontSize: 12 },
          showIcon: true,

        }}
        activeColor='#000000'
        inactiveColor='#3e2465'
        barStyle={{ backgroundColor: '#ffa31a', height: 80 }}
      >
        <Tab.Screen
          name="Map"
          component={MapsScreen}

        />
        <Tab.Screen
          name="Social"
          component={Social}
          options={{ tabBarBadge: 45 }}
        />
        <Tab.Screen
          name="Discovery"
          component={RootNavigation}
        />
        <Tab.Screen
          name="Notification"
          component={ScreenB}
          options={{ tabBarBadge: 8 }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default App;