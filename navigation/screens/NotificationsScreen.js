//import * as React from "react";
import React, { useEffect, useState, useRef } from 'react';
//import { StyleSheet, View, Text } from "react-native";

////////////////////////////////

import { SafeAreaView } from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Button, Platform
} from 'react-native';

import { TailwindProvider } from 'tailwindcss-react-native';
import TabNotif from '../../components/TabNotif';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from "expo-constants";
import { addDoc, collection, collectionGroup, onSnapshot, setDoc, doc, getDoc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { dismissAllNotificationsAsync, getPresentedNotificationsAsync, cancelScheduledNotificationAsync, getNotificationAsync } from 'expo-notifications';
import { updateUsertoken } from 'firebase/firestore';// Import your function for updating the Firestore document
/////////////////////////////////////////////////////////

export default function NotificationsScreen(navigation) {

  const onPressHandler = () => {
    navigation.goBack();
  }

  const [user, setUser] = useState(User);
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);
  const currUser = FIREBASE_AUTH.currentUser;

  const projectId = 'e8e6d84c-21a0-433c-acfc-4c1e40ae9d2c';
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  //for manual dismiss
  const dismissAllNotifications = async () => {
    try {
      await dismissAllNotificationsAsync();

      const notificationsRef = collection(FIRESTORE_DB, 'notifications');
      const q = query(
        notificationsRef,
        where('owner_uid', '==', FIREBASE_AUTH.currentUser.uid),
        where('readstatus', '==', false)
      );

      const querySnapshot = await getDocs(q);

      const updatePromises = [];
      querySnapshot.forEach((doc) => {
        const notificationRef = doc.ref; // Use .ref to get the reference to the document
        // Update the "readstatus" field in each document using updateDoc
        updatePromises.push(updateDoc(notificationRef, { readstatus: true }));
      });

      // Execute the update promises using Promise.all
      await Promise.all(updatePromises);
    } catch (error) {
      console.log('Error dismissing notifications:', error);
    }
  };



  //To be uncomment after integration

  //for manual trigger
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

    //clear all notification
    dismissAllNotifications();

    // Call the function to get the initial count
    getPresentedNotifications();

    // Subscribe to notification events and update the count when a new notification is presented
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      getPresentedNotifications();
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.remove();
  }, []);

  //get current user's docid
  const getCurrentUserDocId = async (userId) => {
    try {
      // Assuming you have a collection named after the current user's ID in Firestore
      const userCollectionRef = collection(FIRESTORE_DB, 'users');
      // Create a query to fetch the documents in the user's collection (should be only one document)
      const q = query(userCollectionRef, where('owner_uid', '==', userId));

      // Execute the query and get the query snapshot
      const querySnapshot = await getDocs(q);

      // Check if there is a document in the user's collection
      if (!querySnapshot.empty) {
        // Get the first document from the query snapshot
        const userDoc = querySnapshot.docs[0];
        // Get the docID of the user's document
        const docId = userDoc.id;
        //const userRole = userDoc.role;
        const userRole = userDoc.data().role; // Access the "role" field
        return { docId, userRole };
        //return docId;
      } else {
        console.log('User document not found');
        return null;
      }
    } catch (error) {
      console.log('Error getting current user document ID:', error);
      return null;
    }
  };

  const updateUsertoken = async (docId, expoPushToken) => {
    try {
      // Assuming you have a collection called "users" in Firestore
      //const userRef = doc(FIRESTORE_DB, 'users', FIREBASE_AUTH.currentUser.uid);
      const userRef = doc(FIRESTORE_DB, 'users', docId);

      // Update the "expoPushToken" field in the user's document
      await setDoc(userRef, { expoPushToken: expoPushToken }, { merge: true });

      console.log('User expoPushToken updated successfully.');
    } catch (error) {
      console.log('Error updating user expoPushToken:', error);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const userId = FIREBASE_AUTH.currentUser ? FIREBASE_AUTH.currentUser.uid : null;
      if (userId) {
        const { docId, userRole } = await getCurrentUserDocId(userId);
        if (docId) {
          //updateUsertoken(docId, token);
          setCurrentLoggedInUser({ docId, userRole });
        } else {
          console.log('User document not found.');
        }
      }
    };

    // Call the fetchUserToken function
    fetchUserRole();

    // Rest of your code
  }, []);


  return (

    <TailwindProvider>
      <SafeAreaView className="bg-white flex-1 relative">
        <View className="flex-row px-6 mt-8 items-center space-x-2">
          <Text className="text-[#2A2B4B] text-3xl font-semibold">Notification</Text>
        </View>

        {/* Second Section */}
        <View style={{ backgroundColor: 'white', padding: 10 }}>
          <TabNotif userRole={currentLoggedInUser ? currentLoggedInUser.userRole : null} />
        </View>



      </SafeAreaView>
    </TailwindProvider>

  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textStyle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
});

// Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
async function sendPushNotification() {
  try {
    // Cancel all previously scheduled notifications
    //await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule a new notification
    const notification = await Notifications.scheduleNotificationAsync({
      //identifier: uuidv4(),
      content: {
        title: "Happy Hour! Huat Arhhh 🍻",
        body: 'Test',
        //data: { data: 'goes here' },
      },
      trigger: { seconds: 2, repeats: false },
    });

    //console.log('NotificationID:', notificationId);

    // Convert the timestamp to a string
    const timestampString = new Date().toISOString();

    // Add the notification data to Firestore
    if (notification) {
      const notificationData = {
        owner_uid: FIREBASE_AUTH.currentUser.uid,
        title: "Happy Hour! Huat 8 🍻",
        body: 'Test',
        //data: { data: 'goes here' },
        timestamp: timestampString,
        //timestamp: serverTimestamp(),
        type: "Promotion"
      };

      console.log('timestampString:', timestampString);
      await addDoc(collection(FIRESTORE_DB, 'notifications'), notificationData);
      console.log('Notification data added to Firestore:', notificationData);
    }
  } catch (error) {
    console.log('Error sending push notification:', error);
  }
}


async function schedulePushNotification() {

  // Cancel all previously scheduled notifications

  await Notifications.scheduleNotificationAsync({
    identifier: notification.identifier,
    content: {
      title: "Test 2 Schedule Fresh Beer Near Me! 🍻 ",
      body: 'Test',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2, repeats: false },
  });

}



async function registerForPushNotificationsAsync(projectId) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}