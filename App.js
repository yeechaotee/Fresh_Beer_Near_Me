import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ScreenB from './navigation/screens/ScreenB';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Social from './navigation/screens/Social';
import ProfileScreen from './navigation/screens/ProfileScreen';
import MapsScreen from './navigation/screens/MapsScreen';
import { View } from 'react-native-animatable';
import RootNavigation from './navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './navigation/screens/Login';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebase';
import Signup from './navigation/screens/Signup';
import NotificationsScreen from './navigation/screens/NotificationsScreen';


const Tab = createMaterialBottomTabNavigator();

const Stack = createNativeStackNavigator();

const LogonStack = createNativeStackNavigator();

function LogonLayout() {
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
        options={{ tabBarBadge: 45 }}
      />
      <Tab.Screen
        name="Discovery"
        component={RootNavigation}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationsScreen}
        options={{ tabBarBadge: 8 }}
      />
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
  )
}

export default App;