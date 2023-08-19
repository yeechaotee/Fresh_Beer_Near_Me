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

import Animated, { set } from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';

import { AuthContext } from '../AuthProvider/AuthProvider';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { collection, query, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import storage from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import EditProfModal from "../../components/signup/EditProfModal";
import ProfileScreen from './ProfileScreen';

const EditProfileScreen = ({ navigation, route }) => {

  //user role
  const [userRole, setUserRole] = useState(null);

  //business UEN
  const [businessUEN, setBusinessUEN] = useState(null);
  const [bizInfo, setBizInfo] = useState("");

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [userData, setUserData] = useState({ gender: '', birthday: null });

  //modal needs
  const [modalVisible, setModalVisible] = useState(false);
  const handleOpenModal = () => {
    setModalVisible(true);
  };


  //modal return contents
  const [beerProfile, setBeerProfile] = useState([]);
  const [favBeer, setFavBeer] = useState([]);
  const [region, setRegion] = useState([]);


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
        setBizInfo(userDoc.data().bizInfo);
        console.log('User role:', userDoc.data().role);
        setUserRole(userDoc.data().role);
        console.log('User businessUEN:', userDoc.data().businessUEN);
        setBusinessUEN(userDoc.data().businessUEN);
        setUserData(userDoc.data());
        setBeerProfile(userDoc.data().beerProfile);
        setFavBeer(userDoc.data().favBeer);
        setRegion(userDoc.data().region);
      } else {
        console.log('User document not found');
        return null;
      }
    } catch (error) {
      console.log('Error getting current user document ID:', error);
      return null;
    }
  };
 
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
          ...(userData.fname !== undefined && { fname: userData.fname }),
          ...(userData.lname !== undefined && { lname: userData.lname }),
          username: userData.username,
          UpdatedAt: new Date().toISOString(),
          ...(userData.gender !== undefined && { gender: userData.gender }),
          ...(userData.birthday !== undefined && { birthday: userData.birthday }),


          ...(userData.region !== undefined && { region: region }), // Add region
          ...(userData.beerProfile !== undefined && { beerProfile: beerProfile }), // Add beerProfile
          ...(userData.favBeer !== undefined && { favBeer: favBeer }), // Add favBeer

          ...(userData.bizInfo !== undefined && { bizInfo: bizInfo }), // Add business info
        });

        console.log('User Updated!');

        navigation.navigate('ProfileScreen');

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

      return url;

    } catch (e) {
      console.log(e);
      return null;
    }

  };


  useEffect(() => {
    getUser();
  }, []);


  bs = React.createRef();
  fall = new Animated.Value(1);


  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // New state for selected date

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const handleDateChange = (event, selected) => {
    if (selected) {
      setSelectedDate(selected);
      setDatePickerVisible(false); // Hide the DatePicker
    } else {
      setDatePickerVisible(false); // Hide the DatePicker if the user cancels
    }
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
        <ScrollView>

          {/*show biz user*/}
          {userRole === "businessUser" && (
            <React.Fragment>
              <View style={styles.action}>
                <Ionicons name="document-text-outline" color="#333333" size={20} />
                <Text>  {businessUEN}</Text>
              </View>
            </React.Fragment>)}

          {userRole === "user" && (
            <React.Fragment>
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
            </React.Fragment>)}

          {/*show regardless*/}
          <View style={styles.action}>
            <FontAwesome name="user-o" color="#333333" size={20} />
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

          {userRole === "user" && (
            <React.Fragment>
              <View style={styles.action}>
                <Ionicons name="male-female-outline" color="#333333" size={20} />
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
            </React.Fragment>)}

          {userRole === 'user' && (
            <>
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
            </>
          )}


          {/*if userRole = user*/}
          {userRole === "user" && (
            <React.Fragment>
              <View style={styles.action}>
                <Text style={styles.Header1}>Your Preferences</Text>
              </View>
              <View style={styles.action}>
                <Text>your fav. beers: {favBeer.join(', ')}</Text>
              </View>
              <View style={styles.action}>
                <Text>your beer profile: {beerProfile.join(', ')}</Text>
              </View>
              <View style={styles.action}>
                <Text>your current region: {region}</Text>
              </View>
              <FormButton buttonTitle="Change Preferences" onPress={handleOpenModal} />
            </React.Fragment>)}

          {/*business user editable fields here*/}
          {userRole === "businessUser" && (
            <React.Fragment>
              <View style={styles.action}>
                <Ionicons name="document-text-outline" color="#333333" size={20} />
                <Text>  business Information</Text>
              </View>
              <View style={styles.action2}>

                <TextInput
                  placeholder="Tell us about your business: "
                  placeholderTextColor="#666666"
                  autoCorrect={false}
                  multiline={true}
                  value={bizInfo}
                  onChangeText={(txt) => setBizInfo(txt)}
                  style={styles.textInput2}
                />


              </View>

            </React.Fragment>)}

          <FormButton buttonTitle="Update" onPress={handleUpdate} />
          <EditProfModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            setBeerProfile={setBeerProfile}
            setFavBeer={setFavBeer}
            setRegion={setRegion}
          />
        </ScrollView>
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
  safearea: {
    marginBottom: 100,
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
    marginTop: 5,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    padding: 7,
  },
  action2: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    padding: 7,
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
  textInput2: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#333333',
    height: 300,
  },
  Header1: {
    color: "#000",
    fontSize: 20,
    fontStyle: "normal",
    fontWeight: "700",
    alignSelf: "center",
  },
});
