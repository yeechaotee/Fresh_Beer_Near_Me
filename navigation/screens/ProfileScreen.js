
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  LogBox,
} from "react-native";
import { AuthContext } from "../AuthProvider/AuthProvider";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  getDocs,
  limit,
  setDoc,
  doc,
  firestore,
  collectionGroup,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Ionicons from 'react-native-vector-icons/Ionicons';

LogBox.ignoreAllLogs(true);

const storage = getStorage();
const ProfileScreen = ({ navigation, route }) => {
  const [image, setImage] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  // get current user and user role from firebase
  useEffect(
    () =>
      onAuthStateChanged(FIREBASE_AUTH, async (user) => {
        if (user) {
          setUser(user);
          const q = query(
            collection(FIRESTORE_DB, "users"),
            where("owner_uid", "==", user.uid),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            setUserProfile(doc.data());
            console.log(doc.id, " => User Role: ", doc.data().role);
          });
          navigation.addListener("focus", () => setLoading(!loading));
        } else {
          setUser(null);
        }
      }),
    [navigation, loading]
  );
  
  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access the camera roll is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri); // Set the image state
      setImageUploaded(false);
      // Call handleFormSubmit after setting the image state
    }
  };
  useEffect(() => {
    // This effect will run whenever 'image' state changes
    console.log("Image is ", image);
    handleFormSubmit(userProfile);

  }, [image, imageUploaded]); // Add 'image' to the dependency array
  const updateProfilePicture = async (profilePictureUrl) => {
    try {
      const userDocRef = collection(FIRESTORE_DB, 'users');
      const q = query(
        userDocRef,
        where('owner_uid', '==', FIREBASE_AUTH.currentUser.uid),
      );
      const querySnapshot = await getDocs(q);
      const updatePromises = [];
      querySnapshot.forEach((doc) => {
        const userRef = doc.ref; // Use .ref to get the reference to the document
        // Update the "readstatus" field in each document using updateDoc
        updatePromises.push(updateDoc(userRef, { profile_picture: profilePictureUrl }));
      });
      // Execute the update promises using Promise.all
      await Promise.all(updatePromises);
      console.log("Profile picture updated successfully");
    } catch (error) {
      console.log('Error updating profile picture4:', error);
    }
  };
 
  const handleFormSubmit = async (values) => {
    console.log("handleformsubmit, image is ", image);
    console.log("handloeformsubmit, imageupload is", imageUploaded);
    const selectedImage = image; // Use the value from the parameter
    if (selectedImage && !imageUploaded) {
      try {
        console.log("uploading to firebase");
        const imageUrl = await uploadImageToStorage(selectedImage);
        console.log("uploaded to firebase, imageurl:", imageUrl);
        values.profile_picture = imageUrl;
        setImageUploaded(true);
      } catch (error) {
        console.log('Image upload error 2:', error);
        return;
      }
    } else {
      values.profile_picture = userProfile?.profile_picture || '';
    }
    // Update user profile in Firestore
    try {
      console.log("updating user profile");
      await updateProfilePicture(values.profile_picture);
      // Rest of the code for updating other profile details...
      console.log("updated user profile :)");
    } catch (error) {
      console.log('Profile picture update error3:', error);
      return;
    }
  };
  const uploadImageToStorage = async (uri) => {
    const imageName = 'profile_picture_' + new Date().getTime();
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    try {
      const response = await fetch(uploadUri);
      const blob = await response.blob();
      // Dynamically create the storage reference
      const storageRef = ref(storage, 'profile_pictures/' + imageName);
      // Upload the image to Firebase Storage
      await uploadBytes(storageRef, blob);
      // Get the image URL from Firebase Storage
      const imageUrl = await getDownloadURL(storageRef);
      return imageUrl;
    } catch (error) {
      console.log('Image upload error 1:', error);
      throw error;
    }
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={selectImage}>
          <View style={styles.userImgWrapper}>
            <Image
              style={styles.userImg}
              source={{
                uri: userProfile
                  ? userProfile.profile_picture ||
                  "https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg"
                  : "https://static.thenounproject.com/png/5034901-200.png",
              }}
            />
            <Ionicons name="add-circle-sharp" color="#ffa31a" size={50} style={styles.addIcon} />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>
          {userProfile ? userProfile.username || "Undefine" : "Undefine"}
        </Text>
        <Text style={styles.aboutUser}>
          {userProfile ? userProfile.email || "Undefine" : "Undefine"}
        </Text>
        <View style={styles.userBtnWrapper}>
          {
            <>
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => {
                  navigation.navigate("EditProfile", { userId: user.uid });
                }}
              >
                <Text style={styles.userBtnTxt}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() =>
                  FIREBASE_AUTH.signOut()
                    .then(() => {
                      navigation.navigate("GuessLogon");
                    })
                    .catch((error) => setUser({ errorMessage: error.message }))
                }
              >
                <Text style={styles.userBtnTxt}>Logout</Text>
              </TouchableOpacity>
            </>
          }
        </View>
        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default ProfileScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  userImgWrapper: {
    position: "relative", // Required for absolute positioning
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  addIcon: {
    position: "absolute",
    bottom: -10,
    right: -10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  userBtn: {
    borderColor: "#2e64e5",
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: "#2e64e5",
  },
  userInfoWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: "center",
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
