import React, { useEffect, useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  Button,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FormButton from '../../components/FormButton';

import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
// import ImagePicker from 'react-native-image-crop-picker';

import { AuthContext } from '../AuthProvider/AuthProvider';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { collection, query, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import storage from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import Constants from "expo-constants";
import Modal from 'react-native-modal';

const EditProfileScreen = ({ navigation, route }) => {
  // const { user, logout } = useContext(AuthContext);
  //const [user, setUser] = useState(User);

  /*
  useEffect(() => {
    // Fetch the user data from Firebase Auth
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (authUser) => {
      if (authUser) {
        setUser(authUser); // Set the user state with the authenticated user object
      } else {
        setUser(null); // If not authenticated, set user state to null
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);
  */

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [userData, setUserData] = useState({ gender: '', birthday: null });

  const [beerProfileIsOpen, setBeerProfileIsOpen] = useState(false);
  const [beerProfileValue, setBeerProfileValue] = useState([]);
  const beerProfiles = [
    { label: "Crisp", value: "Crisp" },
    { label: "Hop", value: "Hop" },
    { label: "Malt", value: "Malt" },
    { label: "Roast", value: "Roast" },
    { label: "Stout", value: "medium" },
    { label: "Fruit & Spice", value: "Fruit & Spice" },
    { label: "Tart & Funky", value: "Tart & Funky" },
  ];

  const [favBeerIsOpen, setfavBeerIsOpen] = useState(false);
  const [favBeerValue, setfavBeerValue] = useState([]);
  const favBeers = [
    { label: "Brown Ale", value: "Brown Ale" },
    { label: "Pale Ale", value: "Pale Ale" },
    { label: "Lager", value: "Lager" },
    { label: "Malt", value: "Malt" },
    { label: "Stout", value: "medium" },
    { label: "Amber", value: "Amber" },
    { label: "Blonde", value: "Blonde" },
    { label: "Brown", value: "Brown" },
    { label: "Cream", value: "Cream" },
    { label: "Dark", value: "Dark" },
    { label: "Caramel", value: "Caramel" },
    { label: "Red", value: "Red" },
    { label: "Honey", value: "Honey" },
    { label: "Lime", value: "Lime" },
    { label: "Black", value: "Black" },
  ];

  const [regionIsOpen, setregionIsOpen] = useState(false);
  const [regionValue, setregionValue] = useState([]);
  const regions = [
    { label: "North", value: "North" },
    { label: "South", value: "South" },
    { label: "East", value: "East" },
    { label: "West", value: "West" },
  ];

  /*
  const getUser = async () => {
    const currentUser = await firestore()
      .collection('users')
      .doc(route.params.userId)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          console.log('User Data', documentSnapshot.data());
          setUserData(documentSnapshot.data());
        }
      })
  }
  */
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };



  //get current user's docid
  const getUser = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser ? FIREBASE_AUTH.currentUser.uid : null;
      const userCollectionRef = collection(FIRESTORE_DB, 'users');
      const q = query(userCollectionRef, where('owner_uid', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        // Get the docID of the user's document
        //const docId = userDoc.id;
        console.log("what is favBeer", userDoc.data().favBeer);
        setUserData(userDoc.data());
        //return { docId, userRole };
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
  /*
  const updateUser = async (docId, expoPushToken) => {
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
  */

  //console.log("user is:" + User)

  /*
  const handleUpdate = async () => {
    // let imgUrl = await uploadImage();
    let imgUrl = null;
    if (imgUrl == null && userData.userImg) {
      imgUrl = userData.userImg;
    }

    firestore()
      .collection('users')
      .doc(route.params.userId)
      .update({
        fname: userData.fname,
        lname: userData.lname,
        
        about: userData.about,
        phone: userData.phone,
        country: userData.country,
        city: userData.city,
        
        // userImg: imgUrl,
      })
      .then(() => {
        console.log('User Updated!');
        Alert.alert(
          'Profile Updated!',
          'Your profile has been updated successfully.'
        );
      })
  }
*/
  const handleUpdate = async () => {
    const userId = FIREBASE_AUTH.currentUser ? FIREBASE_AUTH.currentUser.uid : null;

    const userCollectionRef = collection(FIRESTORE_DB, 'users');
    const q = query(userCollectionRef, where('owner_uid', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Assuming you want to update the first matching user document
      const userRef = doc(FIRESTORE_DB, 'users', userDoc.id);

      try {
        await updateDoc(userRef, {
          profile_picture: userData.profile_picture,
          fname: userData.fname,
          lname: userData.lname,
          username: userData.username,
          UpdatedAt: new Date().toISOString(),
          ...(userData.gender !== undefined && { gender: userData.gender }),
          ...(userData.birthday !== undefined && { birthday: userData.birthday }),

          ...(userData.region !== undefined && { region: userData.region }), // Add region
          ...(userData.beerProfile !== undefined && { beerProfile: userData.beerProfile }), // Add beerProfile
          ...(userData.favBeer !== undefined && { favBeer: userData.favBeer }), // Add favBeer


          // other fields...
        });

        console.log('User Updated!');
        Alert.alert(
          'Profile Updated!',
          'Your profile has been updated successfully.'
        );
      } catch (error) {
        console.error('Error updating user:', error);
        Alert.alert('Error', 'An error occurred while updating your profile.');
      }
    } else {
      console.log('User not found or unauthorized');
      // Handle the case where the user document was not found or the user is unauthorized
    }
  };


  const uploadImage = async () => {
    if (image == null) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
        100,
      );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);

      // Alert.alert(
      //   'Image uploaded!',
      //   'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
      // );
      return url;

    } catch (e) {
      console.log(e);
      return null;
    }

  };

  // useEffect(() => {
  //   onAuthStateChanged(FIREBASE_AUTH, (user) => {
  //     setUser(user);
  //   });
  // }, []);

  useEffect(() => {
    getUser();
  }, []);

  const takePhotoFromCamera = () => {
    // ImagePicker.openCamera({
    //   compressImageMaxWidth: 300,
    //   compressImageMaxHeight: 300,
    //   cropping: true,
    //   compressImageQuality: 0.7,
    // }).then((image) => {
    //   console.log(image);
    //   const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
    //   setImage(imageUri);
    //   this.bs.current.snapTo(1);
    // });
  };

  const choosePhotoFromLibrary = () => {
    // ImagePicker.openPicker({
    //   width: 300,
    //   height: 300,
    //   cropping: true,
    //   compressImageQuality: 0.7,
    // }).then((image) => {
    //   console.log(image);
    //   const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
    //   setImage(imageUri);
    //   this.bs.current.snapTo(1);
    // });
  };

  renderInner = () => (
    <View style={styles.panel}>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.panelTitle}>Upload Photo</Text>
        <Text style={styles.panelSubtitle}>Choose Your Profile Picture</Text>
      </View>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={takePhotoFromCamera}>
        <Text style={styles.panelButtonTitle}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={choosePhotoFromLibrary}>
        <Text style={styles.panelButtonTitle}>Choose From Library</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={() => this.bs.current.snapTo(1)}>
        <Text style={styles.panelButtonTitle}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  bs = React.createRef();
  fall = new Animated.Value(1);


  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // New state for selected date

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };


  return (
    <View style={styles.container}>
      <BottomSheet
        ref={this.bs}
        snapPoints={[330, -5]}
        renderContent={this.renderInner}
        renderHeader={this.renderHeader}
        initialSnap={1}
        callbackNode={this.fall}
        enabledGestureInteraction={true}
      />
      <Animated.View
        style={{
          margin: 20,
          opacity: Animated.add(0.1, Animated.multiply(this.fall, 1.0)),
        }}
      >
        <SafeAreaView>
          <View style={styles.action}>
            <FontAwesome name="user-o" color="#333333" size={20} />
            <TextInput
              placeholder="First Name"
              placeholderTextColor="#666666"
              autoCorrect={false}
              value={userData ? userData.fname : ''}
              onChangeText={(txt) => setUserData({ ...userData, fname: txt })}
              style={styles.textInput}
            />
          </View>
          <View style={styles.action}>
            <FontAwesome name="user-o" color="#333333" size={20} />
            <TextInput
              placeholder="Last Name"
              placeholderTextColor="#666666"
              value={userData ? userData.lname : ''}
              onChangeText={(txt) => setUserData({ ...userData, lname: txt })}
              autoCorrect={false}
              style={styles.textInput}
            />
          </View>
          <View style={styles.action}>
            <Ionicons name="ios-clipboard-outline" color="#333333" size={20} />
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="username"
              placeholderTextColor="#666666"
              value={userData ? userData.username : ''}
              onChangeText={(txt) => setUserData({ ...userData, username: txt })}
              autoCorrect={true}
              style={[styles.textInput, { height: 40 }]}
            />
          </View>

          <View style={styles.action}>
            <Ionicons name="ios-clipboard-outline" color="#333333" size={20} />
            <Picker
              selectedValue={userData ? userData.gender : ''}
              onValueChange={(itemValue) => setUserData({ ...userData, gender: itemValue })}
              style={[styles.textInput, { height: 40 }]}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />

            </Picker>
          </View>
          {isDatePickerVisible && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setSelectedDate(selectedDate); // Set the selected date
                  setUserData({ ...userData, birthday: selectedDate.toISOString() });
                }
                setDatePickerVisible(false); // Hide the date picker
              }}
            />
          )}

          <TouchableOpacity onPress={showDatePicker}>
            <View style={styles.action}>
              <FontAwesome name="calendar" color="#333333" size={20} />
              <TextInput
                placeholder="Birthday"
                placeholderTextColor="#666666"
                editable={false}
                value={
                  selectedDate
                    ? selectedDate.toDateString()
                    : userData.birthday
                      ? new Date(userData.birthday).toDateString()
                      : ''
                }
                style={styles.textInput}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.action}>
            <Ionicons name="ios-clipboard-outline" color="#333333" size={20} />
            <Picker
              selectedValue={userData ? userData.region : ''}
              onValueChange={(itemValue) => setUserData({ ...userData, region: itemValue })}
              style={[styles.textInput, { height: 40 }]}
            >
              <Picker.Item label="Select region" value="" />
              <Picker.Item label="North" value="North" />
              <Picker.Item label="South" value="South" />
              <Picker.Item label="East" value="East" />
              <Picker.Item label="West" value="West" />
            </Picker>
          </View>
          <Modal isVisible={isModalVisible}>
            {/* Modal content */}
            <View style={styles.modalContent}>
              {/* Your modal content goes here */}
              <Text>This is a modal!</Text>
              <Button title="Close" onPress={toggleModal} />
            </View>
          </Modal>
          <TouchableOpacity onPress={toggleModal}>
            <Text>Edit Beer Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleModal}>
            <Text>Edit Fav Beer</Text>
          </TouchableOpacity>






          <FormButton buttonTitle="Update" onPress={handleUpdate} />
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    marginTop: 10,
  },
  panel: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    width: '100%',
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#333333',
    shadowOffset: { width: -1, height: -3 },
    shadowRadius: 2,
    shadowOpacity: 0.4,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#2e64e5',
    alignItems: 'center',
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    padding: 10,
  },
  actionError: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#333333',
  },
});
