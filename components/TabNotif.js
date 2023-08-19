import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const HeaderButton = (props) => (
  <TouchableOpacity
    style={{
      backgroundColor: props.activeTab === props.text ? 'black' : 'white',
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 30,
    }}
    onPress={() => props.setActiveTab(props.text)}
  >
    <Text
      style={{
        color: props.activeTab === props.text ? 'white' : 'black',
        fontSize: 18,
      }}
    >
      {props.text}
    </Text>
  </TouchableOpacity>
);

const TabNotif = ({ userRole }) => {

  const [activeTab, setActiveTab] = useState("Upcoming");


  const [activeData, setActiveData] = useState([]);


  const fetchNotification = async (tabName) => {
    const userId = FIREBASE_AUTH.currentUser ? FIREBASE_AUTH.currentUser.uid : null;

    if (!userId) {
      console.log('User not authenticated.');
      return;
    }


    try {

      const notificationsRef = collection(FIRESTORE_DB, 'notifications');
      const feedsRef = collection(FIRESTORE_DB, "newsfeed");

      const q =
        tabName === "Upcoming" ?
          query(
            feedsRef,
            orderBy("startDateTime", "asc"),
          )
          :
          query(
            notificationsRef,
            where('owner_uid', '==', FIREBASE_AUTH.currentUser.uid),
            where('type', '==', tabName),
            orderBy('timestamp', 'desc')
          );

      const querySnapshot = await getDocs(q);

      const numberOfDocumentsQueried = querySnapshot.size;
      console.log('Number of documents queried:', numberOfDocumentsQueried);


      const notificationPromises = querySnapshot.docs.map(async (doc) => {
        const notificationData = doc.data();
        const timestampString = notificationData.timestamp;
        const timestamp = new Date(timestampString);

        // for tabs that are filtering from "notification" collection
        if (notificationData.owner_uid) {
          const userRef = collection(FIRESTORE_DB, "users");
          const userQuerySnapshot = await getDocs(
            query(userRef, where("owner_uid", "==", notificationData.owner_uid), limit(1))
          );

          if (!userQuerySnapshot.empty) {
            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();

            const NotifCreaterSnapshot = await getDocs(
              query(userRef, where("owner_uid", "==", notificationData.createdby), limit(1))
            );
            const profilePicture = NotifCreaterSnapshot.docs[0].data().profile_picture;
            return {
              id: doc.id,
              ...notificationData,
              timestamp,
              profile_picture: profilePicture, // Include the user's profile picture
            };

          }
        }

        // for tabs that are filtering from "newsfeed" collection
        if (notificationData.creater) {
          const userRef = collection(FIRESTORE_DB, "users");
          const userQuerySnapshot = await getDocs(
            query(userRef, where("email", "==", notificationData.creater), limit(1))
          );

          if (!userQuerySnapshot.empty) {
            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();

            if (notificationData.startDateTime) {
              // Example date string in the format "Sat Aug 26 2023"

              // Get the current date
              const currentDate = new Date();

              // Calculate three days ago
              const threeDaysLater = new Date();
              threeDaysLater.setDate(currentDate.getDate() + 3);
              //console.log("3 days ago", threeDaysLater);

              const startdateString = notificationData.startDateTime;
              const enddateString = notificationData.endDatTime;

              // Parse the date string into a JavaScript Date object
              const startdateFromStr = new Date(startdateString);
              const enddateFromStr = new Date(enddateString);

              console.log("The notif", notificationData.createTime.nanoseconds);
              console.log("The notif", notificationData.createTime.seconds);
              const handcreatedate = new Date(notificationData.createTime.seconds * 1000 + notificationData.createTime.nanoseconds / 1000000);

              // Compare the two dates
              if (startdateFromStr <= threeDaysLater && startdateFromStr <= enddateFromStr) {

                const profilePicture = userDoc.data().profile_picture;
                const eventorpromo = notificationData.type ? " a promotion" : "an event";

                return {
                  id: doc.id,
                  body:
                    ` Hey, ${eventorpromo} is happening from ${notificationData.startDateTime} to ${notificationData.endDatTime}. Check out news feed from social for more!`,
                  ...notificationData,
                  timestamp: handcreatedate,
                  profile_picture: profilePicture,
                };

              }
            }

          }
        }

        return null;
      });

      const notifications = await Promise.all(notificationPromises);
      const nonNullNotifications = notifications.filter((notification) => notification !== null);
      setActiveData(nonNullNotifications);
    } catch (error) {
      console.log(`Error fetching ${tabName} notifications:`, error);
    }
  };

  const handleTabClick = (tabName) => {
    if (tabName !== null) {
      setActiveTab(tabName);
      fetchNotification(tabName);
    }
  };

  useEffect(() => {
    // Fetch initial data when component mounts
    handleTabClick(activeTab);
  }, []);

  const tabsBD = [
    { id: '1', name: 'Upcoming' },
    { id: '4', name: 'New Venue' },
    { id: '3', name: 'Promo/Event' },
    // Add more tabs as needed
  ];

  const tabsBO = [
    { id: '1', name: 'Upcoming' },
    { id: '2', name: 'Activity' },
    { id: '3', name: '                  ' },
    // Add more tabs as needed
  ];
  const tabs = userRole == "businessUser" ? tabsBO : tabsBD;
  console.log('tabs is ', userRole);


  function removeDivTags(text) {
    // Replace <div> and </div> tags with an empty string
    const cleanedText = text.replace(/<\/?div>/g, '');

    return cleanedText;
  }


  return (

    <View style={{ alignSelf: 'center' }}>
      <View style={styles.tabContainer}>

        {tabs.map((tab) => (

          <HeaderButton
            key={tab.id}
            text={tab.name}
            activeTab={activeTab}
            setActiveTab={handleTabClick}
            disabled={!tab.name}
          />

        ))}
      </View>
      <SafeAreaView style={styles.container}>

        <FlatList
          data={activeData}
          renderItem={({ item }) => (
            <View style={styles.rowContainer}>

              <View style={styles.rowIcon} >
                {
                  <Image
                    style={{ width: 50, height: 50, borderRadius: 25, marginTop: -3 }}
                    source={{ uri: item.profile_picture }}
                  />
                }
              </View>
              <View style={{ ...styles.rowContent, flex: 3 }}>
                <Text style={styles.rowHead}>{item.title}</Text>
                <Text style={styles.rowText}>{removeDivTags(item.body)}</Text>
                <Text style={styles.rowText}>{item.timestamp.toLocaleString()}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginBottom: 70,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  rowIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#c3c3c3',
    borderRadius: 20,
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowHead: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rowText: {
    fontSize: 16,
    marginBottom: 4,
  },
  rowTime: {
    fontSize: 14,
    color: '#808080',
  },
  noNotificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotificationText: {
    fontSize: 18,
    color: 'gray',
  },
});

export default TabNotif;