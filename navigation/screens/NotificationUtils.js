//import { Notifications } from 'expo';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB  } from '../../firebase';
import * as Notifications from 'expo-notifications';

const projectId = 'e8e6d84c-21a0-433c-acfc-4c1e40ae9d2c';

export async function sendCustomPushNotification(title, body, type) {
  try {

    // Retrieve a list of user documents from Firestore
    const usersCollection = collection(FIRESTORE_DB, 'users');
    const roleQuery = query(usersCollection, where('role', '==', 'user'));
    const usersSnapshot = await getDocs(roleQuery);

     // Loop through each user document
    usersSnapshot.forEach(async (userDoc) => {
      const expoPushToken = userDoc.data().expoPushToken;

      // Check if the user has an Expo push token
      if (expoPushToken) {
        console.log('Test who get notification, docid is:', userDoc.id,  'uid is:', userDoc.data().owner_uid, 'expo push token is:', expoPushToken);

        const notification = await Notifications.scheduleNotificationAsync({
          content: {
            title: title,
            body: body,
          },
          trigger: { seconds: 2, repeats: false },
        });

        if (notification) {
          const notificationData = {
            owner_uid: userDoc.data().owner_uid,
            title: title,
            body: body,
            timestamp: new Date().toISOString(),
            type: type,
            createdby: FIREBASE_AUTH.currentUser.uid,
          };

          await addDoc(collection(FIRESTORE_DB, 'notifications'), notificationData);
          console.log('Custom Notification data added to Firestore:', notificationData);
        }
      }
    });
  } catch (error) {
    console.log('Error sending custom push notifications:', error);
  }
}