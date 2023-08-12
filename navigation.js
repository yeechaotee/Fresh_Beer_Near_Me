import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native';
import DiscoverScreen from './navigation/screens/DiscoverScreen';
import VenueDetail from './navigation/screens/VenueDetail';
import Signup from './navigation/screens/Signup';

export default function RootNavigation() {
    const Stack = createStackNavigator();

    const screenOptions = {
        headerShown: false,
    };

    // just change initialRouteName point to any .js page will auto initial at that screen
    return (
        <Stack.Navigator initialRouteName='DiscoveryScreen' screenOptions={screenOptions}>
            <Stack.Screen name='DiscoveryScreen' component={DiscoverScreen} />
            <Stack.Screen name='VenueDetail' component={VenueDetail} />
            <Stack.Screen name='Signup' component={Signup} />
        </Stack.Navigator>

    )
}