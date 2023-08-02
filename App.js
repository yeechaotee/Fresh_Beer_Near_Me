import React, { useEffect, useState,useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ScreenB from './navigation/screens/ScreenB';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Social from './navigation/screens/Social';
import ProfileScreen from './navigation/screens/ProfileScreen';
import MapsScreen from './navigation/screens/MapsScreen';
//import { View } from 'react-native-animatable';
import RootNavigation from './navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './navigation/screens/Login';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebase';
import Signup from './navigation/screens/Signup';
import NotificationsScreen from './navigation/screens/NotificationsScreen';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from "expo-constants";
import { Text, View, Button, Platform } from 'react-native';
import { dismissAllNotificationsAsync, getPresentedNotificationsAsync } from 'expo-notifications';

const Tab = createMaterialBottomTabNavigator();
const Stack = createNativeStackNavigator();
const LogonStack = createNativeStackNavigator();

function LogonLayout() {

  
  const [presentedNotificationCount, setPresentedNotificationCount] = useState(0);

  const getPresentedNotifications = async () => {
    try {
      const presentedNotifications = await getPresentedNotificationsAsync();
      const notificationCount = presentedNotifications.length;
      setPresentedNotificationCount(notificationCount);
    } catch (error) {
      console.log('Error getting presented notifications:', error);
    }
  };

  useEffect(() => {
    // Call the function to get the initial count
    getPresentedNotifications();

    // Subscribe to notification events and update the count when a new notification is presented
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      getPresentedNotifications();
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.remove();
  }, []);

  return (
    <Tab.Navigator initialRouteName='Discovery'
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
        //options={{ tabBarBadge: 45 }}
      />
      <Tab.Screen
        name="Discovery"
        component={RootNavigation}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationsScreen}
        options={{  tabBarBadge: presentedNotificationCount > 0 ? presentedNotificationCount : null,
         }}>

           
         </Tab.Screen>
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />


    </Tab.Navigator>
  )
}

function GuessLogon() {
  return (
    <Tab.Navigator initialRouteName='Discovery'
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
        name="Discovery"
        component={RootNavigation}
      />
      <Tab.Screen
        name="Profile"
        component={Signup}
      />


    </Tab.Navigator>
  )
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    allowAnnouncements: true,
  }),
});

function App() {

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(
    () =>
      onAuthStateChanged(FIREBASE_AUTH, (user) => {
        // console.log('User info ---> ', user);
        if (user) {
          setUser(user);
        }
        else {
          setUser(null);
        }
        setLoadingInitial(false);

        console.log('User info ---> ', user);
      })
    , []);

  const SignedInStack = () => (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Discovery">
        <Stack.Screen name="LoggedOn" component={LogonLayout} options={{ title: "Logon as " + user.email }} />
      </Stack.Navigator>
    </NavigationContainer>
  )

  const SignedOutStack = () => (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GuessLogon">
        <Stack.Screen name="GuessLogon" component={GuessLogon} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )

  return (
    <> 
      {user ?  !loadingInitial && SignedInStack() : !loadingInitial && SignedOutStack()}
    </>
    // <NavigationContainer>
    //   <Stack.Navigator initialRouteName="Login">
    //     {user ?
    //       (<Stack.Screen name={"Logon as " + user.email} component={LogonLayout} options={{ headerShown: false }} />) :
    //       (<Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />)}
    //     <Stack.Screen name="Signup" component={Signup} options={{ title: 'Sign up' }} />

    //   </Stack.Navigator>
    // </NavigationContainer>
  );
}

export default App;