import React from "react";
import { StyleSheet, View, Text, FlatList, TextInput, SafeAreaView, Button, ScrollView, KeyboardAvoidingView, Image, TouchableOpacity, LogBox, } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import {
  addDoc,
  collection,
  onSnapshot,
  getDoc,
  query,
  getDocs,
  setDoc,
  doc,
  orderBy,
  where,
  limit,
  limitToLast,
  startAt,
  startAfter,
  endBefore
} from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import uuid from "uuid";
import { VenueInfo } from "../../components/home/VenueItems";
import GetNewsFeed from '../../components/profile/getNewsFeed';
import sendCustomPushNotification from './NotificationUtils';
import { useNavigation } from '@react-navigation/native';

LogBox.ignoreAllLogs(true);

const Drawer = createDrawerNavigator();

const handleHead = ({ tintColor }) => <Text style={{ color: tintColor }}>H1</Text>

function NewsFeed() {
  let page = 0;
  const PAGE_SIZE = 5;

  const [activeData, setActiveData] = React.useState([]);
  const auth = FIREBASE_AUTH;
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [showFoot, setShowFoot] = React.useState(0)
  const [isRefresh, setIsRefresh] = React.useState(false)

  React.useEffect(() => {
    async function isAdmin() {
      const feedsRef = collection(FIRESTORE_DB, "users");
      const q = query(feedsRef, where("email", "==", auth.currentUser.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setIsAdmin(data.role === "businessUser");
      })
    }
    getNewsFeed();
    isAdmin();
  }, [])

  async function getNewsFeed() {
    const feedsRef = collection(FIRESTORE_DB, "newsfeed");
    console.log(page)
    if (page === 0) {
      const q = query(feedsRef, orderBy("createTime", "desc"), limit(PAGE_SIZE * (page + 1)));
      const querySnapshot = await getDocs(q);
      next = querySnapshot.docs[querySnapshot.docs.length - 1];
      console.log("aaa", next)
      querySnapshot.forEach((doc) => {
        activeData.push({
          id: doc.id,
          ...doc.data(),
          createTime: doc.data().createTime.toDate().toDateString(),
        });
      });
    } else {
      const q1 = query(feedsRef, orderBy("createTime", "desc"), limit(PAGE_SIZE * page));
      const querySnapshot1 = await getDocs(q1);
      const next = querySnapshot1.docs[querySnapshot1.docs.length - 1];
      if (next) {
        const q = query(feedsRef, orderBy("createTime", "desc"), startAfter(next), limit(PAGE_SIZE));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          activeData.push({
            id: doc.id,
            ...doc.data(),
            createTime: doc.data().createTime.toDate().toDateString(),
          });
        });
      }
    }
    setActiveData([...activeData]);
    setIsRefresh(false);
  }

  function _onEndReached({ distanceFromEnd }) {
    if (isRefresh) {
      page++;
      getNewsFeed();
      console.log()
    }
  }

  function _renderFooter() {
    if (showFoot === 1) {
      return (
        <View style={{ height: 30, alignItems: 'center', justifyContent: 'flex-start', }}>
          <Text style={{ color: '#999999', fontSize: 14, marginTop: 5, marginBottom: 5, }}>
            Nothing
          </Text>
        </View>
      )
    } else if (showFoot === 2) {
      return (
        <View style={{ height: 30, alignItems: 'center', justifyContent: 'flex-start', }}>
          <Text style={{ color: '#999999', fontSize: 14, marginTop: 5, marginBottom: 5, }}>Loading...</Text>
        </View>
      );
    } else if (showFoot === 0) {
      return (
        <View style={{ height: 30, alignItems: 'center', justifyContent: 'flex-start', }}>
          <Text style={{ color: '#999999', fontSize: 14, marginTop: 5, marginBottom: 5, }}>welcome</Text>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activeData}
        renderItem={({ item }) => (
          <View>
            <View style={styles.rowHeader}>
              <View style={styles.rowIcon} >
                {
                  item.avatar ? <Image source={{ uri: item.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} /> : <></>
                }
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowHead}>{item.creater}</Text>
                <Text style={styles.rowText}>{item.createTime}</Text>
              </View>
            </View>
            <View style={styles.rowContent}>
              {
                item.startDateTime && item.endDatTime ?
                  item.type ? <Text style={{ ...styles.rowText, marginRight: 5 }}>Type: Promotion</Text> : <Text style={styles.rowText}>Type: Event</Text>
                  : <></>
              }
              {
                item.startDateTime ? <Text style={{ ...styles.rowText, marginRight: 5 }}>Start Date: {typeof item.startDateTime === 'string' ? item.startDateTime : ""}</Text> : <></>
              }
              {
                item.endDatTime ? <Text style={styles.rowText}>End Date: {typeof item.endDatTime === 'string' ? item.endDatTime : ""}</Text> : <></>
              }
              {
                item.numberOfPeople && item.numberOfPeople !== "" && item.numberOfPeople !== "0" ? <Text style={styles.rowText}>Number of people participating: {item.numberOfPeople}</Text> : <></>
              }
            </View>
            <Text style={styles.rowMessage}>{item.description.replace(/<\/?[^>]+(>|$)/g, "")}</Text>
            {
              item.image ? <Image source={{ uri: item.image }} style={{ width: 250, height: 250 }} /> : <></>
            }
            {/* <View style={styles.rowContainer}>
                      <View style={styles.rowContainer}>
                        {
                          !isAdmin ? <>
                            <FontAwesome5
                              name={'heart'}
                              size={20}
                              color={'black'}
                            />
                            <FontAwesome5
                                name={'comment'}
                                size={20}
                                color={'black'}
                                style={{ paddingLeft: 10 }}
                            />
                          </> : <></>
                        }
                      </View>
                  </View> */}
          </View>
        )}
        keyExtractor={(item, index) => index}
        onEndReached={_onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={_renderFooter()}
        onMomentumScrollBegin={() => { setIsRefresh(true); }}
      />
    </View>
  );
}

async function uploadImageAsync(uri) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const fileRef = ref(getStorage(), uuid.v4());
  const result = await uploadBytes(fileRef, blob);

  // We're done with the blob, close and release it
  blob.close();

  return await getDownloadURL(fileRef);
}

function CreateFeed({ navigation }) {
  const richText = React.useRef();
  const [state, setState] = React.useState({
    uploading: false,
  });
  const [image, setImage] = React.useState("");
  const [description, setDescription] = React.useState("");

  const _handleImagePicked = async (pickerResult) => {
    try {
      setState({ uploading: true });

      if (!pickerResult.canceled) {
        const uploadUrl = await uploadImageAsync(pickerResult.assets[0].uri);
        console.log(uploadUrl)
        setImage(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      setState({ uploading: false });
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });
    console.log({ pickerResult });
    _handleImagePicked(pickerResult);
  };

  const _maybeRenderImage = () => {
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 30,
          width: 250,

          borderRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: "rgba(0,0,0,1)",
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: "hidden",
          }}
        >
          <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {/* <RichToolbar
          editor={richText}
          actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.heading1]}
          iconMap={{ [actions.heading1]: handleHead }}
        /> */}
        <Button title="Pick an image" onPress={pickImage} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, minHeight: 400 }}>
          <Text>Description:</Text>
          <RichEditor
            ref={richText}
            style={{ minHeight: 400 }}
            value={description}
            onChange={descriptionText => {
              setDescription(descriptionText);
            }}
          />
        </KeyboardAvoidingView>
        <Button title="Create Feed" onPress={async () => {
          const data = {
            type: false,
            startDateTime: "",
            endDatTime: "",
            numberOfPeople: "0",
            description: description,
            image: image,
            creater: FIREBASE_AUTH.currentUser.email,
            createTime: new Date(),
            avatar: FIREBASE_AUTH.currentUser.photoURL,
          }
          // Add a new document with a generated id
          const newRef = doc(collection(FIRESTORE_DB, "newsfeed"));
          // later...
          await setDoc(newRef, data);

          alert("Create Feed Success");
          navigation.navigate("News Feed");
        }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CreateFeedByAdmin({ navigation }) {
  const [state, setState] = React.useState({
    uploading: false,
    image: null,
  });
  const richText = React.useRef();
  const [dateTimeType, setDateTimeType] = React.useState(true);
  const [startDateTime, setStartDateTime] = React.useState(new Date());
  const [endDatTime, setEntDateTime] = React.useState(new Date());
  const [numberOfPeople, setNumberOfPeople] = React.useState("");
  const [mode, setMode] = React.useState('date');
  const [show, setShow] = React.useState(false);
  const [type, setType] = React.useState(true); // promotion: true, event: false
  const [title, setTitle] = React.useState(null); // promotion: true, event: false
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState(null);

  const onSetPromitionToType = (value) => {
    setType(true);
  }

  const onSetEventToType = (value) => {
    setType(false);
  }

  const onSetTitle = (value) => {
    setTitle(value);
  }

  const onChange = React.useCallback((event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    // set date
    if (dateTimeType) {
      if (currentDate < new Date()) {
        alert("Please a valid start date")
      } else {
        setStartDateTime(currentDate)
      }
    } else {
      console.log(currentDate, startDateTime);
      if (currentDate < startDateTime) {
        alert("Please a valid end date")
      } else {
        setEntDateTime(currentDate)
      }
    }
    setShow(false);
  }, [startDateTime, endDatTime]);

  const _handleImagePicked = async (pickerResult) => {
    try {
      setState({ ...state, uploading: true });

      if (!pickerResult.canceled) {
        const uploadUrl = await uploadImageAsync(pickerResult.assets[0].uri);
        setImage(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      setState({ ...state, uploading: false });
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });
    console.log({ pickerResult });
    _handleImagePicked(pickerResult);
  };

  const _maybeRenderImage = () => {
    let { image } = state;
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 30,
          width: 250,
          borderRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: "rgba(0,0,0,1)",
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: "hidden",
          }}
        >
          <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Text style={{ marginBottom: 20, marginTop: 20, fontWeight: "bold", textAlign: "center" }}>
          Create New Post
        </Text>
        <View style={{ display: "flex", flexDirection: "row", padding: 10, alignItems: "center" }}>
          <Text style={{ marginBottom: 5, marginTop: 5, fontWeight: "bold", textAlign: "center" }}>
            Type:
          </Text>
          <Checkbox style={{ marginLeft: 10 }} value={type} onValueChange={onSetPromitionToType} />
          <Text style={{ marginLeft: 10 }}>Promotion</Text>
          <Checkbox style={{ marginLeft: 10 }} value={!type} onValueChange={onSetEventToType} />
          <Text style={{ marginLeft: 10 }}>Event</Text>
        </View>
        <View style={{ display: "flex", flexDirection: "row", padding: 10, alignItems: "center" }}>
          <Text style={{ marginBottom: 5, marginTop: 5, fontWeight: "bold", textAlign: "center" }}>
            Title:
          </Text>
          <TextInput
            style={{ marginLeft: 10, borderWidth: 1, padding: 5, flex: 1 }}
            placeholder="Enter title"
            value={title}
            onChangeText={onSetTitle}
          />
        </View>
        <View style={{ display: "flex", padding: 10, justifyContent: "flex-start" }}>
          <Text style={{ marginBottom: 5, marginTop: 5, fontWeight: "bold", textAlign: "left" }}>
            Datetime:
          </Text>
          <View style={{ display: "flex", flexDirection: "row", padding: 0, alignItems: "center", }}>
            <Text style={{ marginBottom: 5, marginTop: 5, fontWeight: "bold", textAlign: "left" }}>
              Start Date:
            </Text>
            <TextInput
              value={startDateTime.toDateString()}
              style={{ ...styles.numberInput, width: 200 }}
              placeholder="date time"
              onTouchStart={() => {
                setMode("date")
                setShow(true)
                setDateTimeType(true);
              }}
            />
          </View>
          <View style={{ display: "flex", flexDirection: "row", padding: 0, alignItems: "center" }}>
            <Text style={{ marginBottom: 5, marginTop: 5, fontWeight: "bold", textAlign: "left" }}>
              End   Date:
            </Text>
            <TextInput
              value={endDatTime.toDateString()}
              style={{ ...styles.numberInput, width: 200 }}
              placeholder="date time"
              keyboardType="default"
              onTouchStart={() => {
                setMode("date")
                setShow(true)
                setDateTimeType(false);
              }}
            />
          </View>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dateTimeType ? startDateTime : endDatTime}
              mode={mode}
              display="spinner"
              is24Hour={true}
              minimumDate={new Date()}
              onChange={onChange}
            />
          )}
        </View>
        <View style={{ display: "flex", flexDirection: "row", padding: 10, alignItems: "center" }}>
          <Text style={{ marginBottom: 5, marginTop: 5, fontWeight: "bold", textAlign: "center" }}>
            Number of people participating:
          </Text>
          <TextInput
            value={numberOfPeople}
            style={styles.numberInput}
            placeholder="number"
            keyboardType="numeric"
            onChange={(val) => {
              setNumberOfPeople(val.nativeEvent.text);
            }}
          />
        </View>
        {/* <RichToolbar
          editor={richText}
          actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.heading1]}
          iconMap={{ [actions.heading1]: handleHead }}
        /> */}
        <Button title="Pick an image" onPress={pickImage} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, minHeight: 100 }}>
          <RichEditor
            ref={richText}
            style={{ minHeight: 500 }}
            placeholder="Description"
            value={description}
            onChange={descriptionText => {
              setDescription(descriptionText);
            }}
          />
        </KeyboardAvoidingView>
        <Button title="Create Feed" onPress={async () => {
          const data = {
            type: type,
            startDateTime: startDateTime.toDateString(),
            endDatTime: endDatTime.toDateString(),
            numberOfPeople: numberOfPeople,
            description: description,
            image: image,
            creater: FIREBASE_AUTH.currentUser.email,
            createTime: new Date(),
            avatar: FIREBASE_AUTH.currentUser.photoURL,
            title: title,
          }
          console.log(data);
          try {
            // Add a new document with a generated id
            const newRef = doc(collection(FIRESTORE_DB, "newsfeed"));
            // later...


            // Query the 'users' collection to get user IDs or device tokens of all users
            const usersCollection = collection(FIRESTORE_DB, 'users');
            const roleQuery = query(usersCollection, where('role', '==', 'user'));

            // Retrieve user documents that match the query
            const querySnapshot = await getDocs(roleQuery);

            // Create an array to store recipient IDs
            const recipientIds = [];

            // Loop through the query snapshot to extract user IDs or device tokens
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              // Assuming you have a field in your user data containing user IDs or device tokens
              // Adjust the field name accordingly
              const userId = userData.owner_uid; // Replace 'uid' with the actual field name
              recipientIds.push(userId);
            });

            // Loop through each recipient and send a notification
            for (const recipientId of recipientIds) {

              const typeofpost = "Promo/Event";
              const getTitle = title ? title : "New Promo/Event";
              const data1 = {
                type: typeofpost,
                title: getTitle,
                body: description,
                timestamp: new Date().toISOString(),
                owner_uid: recipientId, // Use the current recipient's ID
                readstatus: false,
                createdby: FIREBASE_AUTH.currentUser.uid,

              };

              //console.log("each reci setis", recipientId);
              const newRef1 = doc(collection(FIRESTORE_DB, "notifications"));

              await setDoc(newRef1, data1);
            }

            await setDoc(newRef, data);
            alert("Create Feed Success");
            navigation.navigate("News Feed");
          } catch (e) {
            alert("Create Feed Fail");
          }
        }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// function AddFriends() {
//   return (
//     <SafeAreaView style={{ flex: 1, padding: 10 }}>
//       <View style={{ alignItems: "center"}}>
//         <Text style={{ marginBottom: 20, marginTop: 20, fontWeight: "bold"}}>
//           Add Via User Name
//         </Text>
//       </View>
//         <TextInput style={styles.input} value="username"/>
//         <View  style={{ marginBottom: 10 }}>
//           <Button title="Send friend Request" />
//         </View>
//         <View style={{alignItems: "center"}}>
//           <Text style={{marginTop: 40, fontWeight: "bold"}}>OR</Text>
//         </View>
//         <View style={{ marginBottom: 10, marginTop: 60}}>
//           <Button title="Add Via Your Phone Contact" />
//         </View>
//         <Button style={{ marginTop: 10 }} title="Nearby Scan" />
//     </SafeAreaView>
//   );
// }

function StarRating() {

  const navigation = useNavigation();

  const [state, setState] = React.useState({
    id: null,
    Default_Rating: 2.5,
    message: "",
    Max_Rating: 5,
    data: null
  })

  const Star = 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/star_filled.png';

  //Empty Star. You can also give the path from local
  const Star_With_Border = 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/star_corner.png';

  async function onSubmitComment() {
    if (state.id === null) {
      alert("Please search and select one beer")
      return
    }
    const data = {
      id: state.id,
      rating: state.Default_Rating,
      message: state.message,
      data: null
    }
    const newRef = doc(collection(FIRESTORE_DB, "reviews"));
    await setDoc(newRef, data);
    // reviews & rating
    console.log(state.id)
    const docRef = doc(FIRESTORE_DB, "venues", state.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const reviews = data.reviews;
      const rating = data.rating;
      const newRating = (rating * reviews + state.Default_Rating) / (reviews + 1);
      await setDoc(docRef, {
        ...data,
        rating: newRating.toFixed(1),
        reviews: reviews + 1
      })
      setState({
        ...state,
        data: {
          ...state.data,
          rating: newRating.toFixed(1),
          reviews: reviews + 1
        }
      })
      // notification business user
      const bussinessUserId = data.owner_uid;
      const data1 = {
        type: "Activity",
        title: "You have a new rating",
        body: `You have a new rating. Venue: [${data.name}] Rating: ${state.Default_Rating.toFixed(1)}, Message: ${state.message}`,
        timestamp: new Date().toISOString(),
        owner_uid: bussinessUserId,
        readstatus: false,
        createdby: FIREBASE_AUTH.currentUser.uid,
      }
      const newRef1 = doc(collection(FIRESTORE_DB, "notifications"));
      await setDoc(newRef1, data1);
      navigation.goBack();

    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
    alert("success")
  }
  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <ScrollView>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <TextInput style={styles.input} placeholder="searching beer by name" onChangeText={async (text) => {
            if (text === "" || !text) {
              setState({
                ...state,
                data: null
              })
              return;
            }
            const feedsRef = collection(FIRESTORE_DB, "venues");
            const q = query(feedsRef, where("name", "==", text));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              console.log(doc.id)
              const data = doc.data();
              console.log(data)
              setState({
                ...state,
                id: doc.id,
                data: data
              })
            })
          }} />
          {
            state.data ? (
              <View style={{ marginTop: 10, padding: 15, backgroundColor: "white", }}>
                <Image
                  source={{
                    uri: state.data.image_url,
                  }}
                  style={{ width: 300, height: 180 }}
                />
                {/* Venue Info */}
                <VenueInfo
                  name={state.data.name}
                  categories={state.data.categories}
                  price={state.data.price}
                  reviews={state.data.reviews}
                  rating={state.data.rating}
                />
              </View>
            ) : <></>
          }
          <View style={ratingStyles.childView}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setState({ ...state, Default_Rating: 1 })}>
              <Image
                style={ratingStyles.StarImage}
                source={
                  1 <= state.Default_Rating
                    ? { uri: Star }
                    : { uri: Star_With_Border }
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setState({ ...state, Default_Rating: 2 })}>
              <Image
                style={ratingStyles.StarImage}
                source={
                  2 <= state.Default_Rating
                    ? { uri: Star }
                    : { uri: Star_With_Border }
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setState({ ...state, Default_Rating: 3 })}>
              <Image
                style={ratingStyles.StarImage}
                source={
                  3 <= state.Default_Rating
                    ? { uri: Star }
                    : { uri: Star_With_Border }
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setState({ ...state, Default_Rating: 4 })}>
              <Image
                style={ratingStyles.StarImage}
                source={
                  4 <= state.Default_Rating
                    ? { uri: Star }
                    : { uri: Star_With_Border }
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setState({ ...state, Default_Rating: 5 })}>
              <Image
                style={ratingStyles.StarImage}
                source={
                  5 <= state.Default_Rating
                    ? { uri: Star }
                    : { uri: Star_With_Border }
                }
              />
            </TouchableOpacity>
          </View>

          <Text style={ratingStyles.textStyle}>
            {state.Default_Rating} / {state.Max_Rating}
          </Text>
          <Text style={{ marginBottom: 20, marginTop: 20, fontWeight: "bold" }}>
            leave a comment
          </Text>
          <TextInput style={styles.input} placeholder="leave a comment" onChangeText={(text) => {
            setState({ ...state, message: text })
          }} />
          <Button style={{ width: "100%" }} title="Submit" onPress={onSubmitComment} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// function Report() {
//   return (
//     <SafeAreaView style={{ flex: 1, padding: 10 }}>
//       <View style={{ alignItems: "center"}}>
//         <Text style={{ marginBottom: 20, marginTop: 20, fontWeight: "bold"}}>
//           TODO: Report Page
//         </Text>
//       </View>
//     </SafeAreaView>
//   )
// }


function ManagePost() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <ScrollView>
        <View style={{ alignItems: "center" }}>
          <Text>
            <GetNewsFeed></GetNewsFeed>
          </Text>
        </View>

      </ScrollView>

    </SafeAreaView>

  )
}


export default function SocialScreen({ navigation }) {
  const auth = FIREBASE_AUTH;
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    async function isAdmin() {
      const feedsRef = collection(FIRESTORE_DB, "users");
      const q = query(feedsRef, where("email", "==", auth.currentUser.email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data.role)
        setIsAdmin(data.role === "businessUser");
      })
    }
    isAdmin();
  }, [])

  return (
    <Drawer.Navigator initialRouteName="Social Home">
      <Drawer.Screen
        name="News Feed"
        component={NewsFeed}
        options={{
          title: "News Feed",
          headerStyle: {
            backgroundColor: "#ffa31a",
          },
          headerTitleAlign: "center",
          lazy: false,
          unmountOnBlur: true,
        }}
      />
      {
        isAdmin ? <Drawer.Screen
          name="Create Post"
          component={CreateFeedByAdmin}
          options={{
            title: "Create Post",
            headerStyle: {
              backgroundColor: "#ffa31a",
            },
            headerTitleAlign: "center",
          }}
        /> :
          <Drawer.Screen
            name="Create Post"
            component={CreateFeed}
            options={{
              title: "Create Post",
              headerStyle: {
                backgroundColor: "#ffa31a",
              },
              headerTitleAlign: "center",
            }}
          />
      }
      {/* {
        !isAdmin ? <Drawer.Screen
          name="Add Friends"
          component={AddFriends}
          options={{
            title: "Add Friends",
            headerStyle: {
              backgroundColor: "#ffa31a",
            },
            headerTitleAlign: "center",
          }}
        />: <></>
      } */}
      {
        !isAdmin ? <Drawer.Screen
          name="Star Rating"
          component={StarRating}
          options={{
            title: "Star Rating",
            headerStyle: {
              backgroundColor: "#ffa31a",
            },
            headerTitleAlign: "center",
          }}
        /> : <></>
      }
      {
        <Drawer.Screen
          name="Manage Post"
          component={ManagePost}
          options={{
            title: "My Post",
            headerStyle: {
              backgroundColor: "#ffa31a",
            },
            headerTitleAlign: "center",
          }}
        />
      }
      {/* {
        isAdmin ? <Drawer.Screen
          name="Report"
          component={Report}
          options={{
            title: "Report",
            headerStyle: {
              backgroundColor: "#ffa31a",
            },
            headerTitleAlign: "center",
          }}
        />: <></>
      } */}
    </Drawer.Navigator>
  );
}

const ratingStyles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  childView: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 30,
  },
  button: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 30,
    padding: 15,
    backgroundColor: '#8ad24e',
  },
  StarImage: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 23,
    color: '#000',
    marginTop: 15,
  },
  textStyleSmall: {
    textAlign: 'center',
    fontSize: 16,

    color: '#000',
    marginTop: 15,
  },
});

const styles = StyleSheet.create({
  numberInput: {
    width: 100,
    height: 30,
    margin: 1,
    borderWidth: 1,
    padding: 2,
  },
  input: {
    width: '90%',
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
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
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  rowMessage: {
    fontSize: 16,
    marginBottom: 4,
    marginTop: 8,
    color: '#808080',
  },
  rowTime: {
    fontSize: 14,
    color: '#808080',
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: '#c3c3c3',
    borderRadius: 50,
  },
});