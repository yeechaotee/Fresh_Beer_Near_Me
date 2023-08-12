import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where } from 'firebase/firestore';
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
  const [activeTab, setActiveTab] = useState('Activity');
  const [activeData, setActiveData] = useState([]);
  

   const fetchNotification = async (tabName) => {
    const userId = FIREBASE_AUTH.currentUser ? FIREBASE_AUTH.currentUser.uid : null;

    if (!userId) {
      console.log('User not authenticated.');
      return;
    }

    try {
      const notificationsRef = collection(FIRESTORE_DB, 'notifications');
      const q = query(
        notificationsRef,
        where('owner_uid', '==', userId),
        where('type', '==', tabName)
        
      );

      const querySnapshot = await getDocs(q);
      const notifications = [];

      querySnapshot.forEach((doc) => {
        const notificationData = doc.data();
        const timestampString = notificationData.timestamp;
        const timestamp = new Date(timestampString); 
        notifications.push({ id: doc.id, ...notificationData, timestamp  });
      });

      setActiveData(notifications);
    } catch (error) {
      console.log(`Error fetching ${tabName} notifications:`, error);
    }
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    fetchNotification(tabName);
  };

  useEffect(() => {
    // Fetch initial data when component mounts
    handleTabClick(activeTab);
  }, []);

  const tabsBD = [
    //{ id: '1', name: 'Activity' },
    { id: '2', name: 'Promotion' },
    { id: '3', name: 'Event' },
    { id: '4', name: 'News Feed' },
    // Add more tabs as needed
  ];

  const tabsBO = [
    { id: '1', name: 'Activity' },
    { id: '2', name: 'Promotion' },
    { id: '3', name: 'Event' },
    //{ id: '4', name: 'News Feed' },
    // Add more tabs as needed
  ];
  const tabs = userRole === "businessUser"? tabsBO:tabsBD;
  //console.log('tabs is ',userRole);

  /* //hardcoded testing data

  const generateRandomTime = () => {
  const hours = Math.floor(Math.random() * 12); // Random hour (0-11)
  const minutes = Math.floor(Math.random() * 60); // Random minute (0-59)
  const isAM = Math.random() < 0.5; // Randomly choose AM or PM

  // Format hours to be in two digits
  const formattedHours = hours.toString().padStart(2, '0');

  // Format minutes to be in two digits
  const formattedMinutes = minutes.toString().padStart(2, '0');

  // Determine if it's AM or PM
  const period = isAM ? 'AM' : 'PM';

  // Return the formatted time
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

  const SampleDataActivity = [
    { id: '1', name: 'Franco', message: 'testmessage', time: generateRandomTime() },
    { id: '2', name: 'Matilda', message: 'testmessage', time: generateRandomTime() },
    // Other data for Activity
  ];

  const SampleDataPromotion = Array.from({ length: 100 }, (item, index) => ({
    id: index + 1,
    name: `Mike ${index + 1}`,
    message: `testmessage ${index + 1}`,
    time: generateRandomTime(),
  }));

  const SampleDataEvent = Array.from({ length: 100 }, (item, index) => ({
    id: index + 1,
    name: `YC ${index + 1}`,
    message: `testmessage ${index + 1}`,
    time: generateRandomTime(),
  }));

  const SampleDataNewsFeed = Array.from({ length: 100 }, (item, index) => ({
    id: index + 1,
    name: `Mandy ${index + 1}`,
    message: `testmessage ${index + 1}`,
    time: generateRandomTime(),
  }));

  let activeData = [];

  switch (activeTab) {
    case 'Activity':
      activeData = SampleDataActivity;
      break;
    case 'Promotion':
      activeData = SampleDataPromotion;
      break;
    case 'Event':
      //activeData = fetchNotification;
      activeData = SampleDataEvent;
      break;
    case 'News Feed':
      activeData = SampleDataNewsFeed;
      break;

    // Add more cases for additional tabs if needed

    default:
      activeData = [];
  }
  */

  return (
    
    <View style={{ alignSelf: 'center' }}>
      <View style={styles.tabContainer}>
       
        {tabs.map((tab) => (
            
            
          <HeaderButton
            key={tab.id}
            text={tab.name}
            activeTab={activeTab}
            setActiveTab={handleTabClick}
          />
        ))}
      </View>
      <View style={styles.container}>
        {/*<Text>{activeTab}</Text>*/}
        <FlatList
          data={activeData}
          renderItem={({ item }) => (
            <View style={styles.rowContainer}>
              <View style={styles.rowIcon} />
              <View style={styles.rowContent}>
                <Text style={styles.rowHead}>{item.title}</Text>
                <Text style={styles.rowText}>{item.body}</Text>
                 <Text style={styles.rowText}>{item.timestamp.toLocaleString()}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
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
    //fontWeight: 'bold',
    marginBottom: 4,
  },
  rowTime: {
    fontSize: 14,
    color: '#808080',
  },
});

export default TabNotif;
