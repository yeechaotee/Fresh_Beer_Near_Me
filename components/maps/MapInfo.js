import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  View,
  Text,
  Linking,
  TouchableWithoutFeedback,
} from "react-native";
import VenueItems from "../home/VenueItems";
import { FIRESTORE_DB } from "../../firebase";
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
  orderBy,
} from "firebase/firestore";

const MapInfoModal = ({ modalVisible, setModalVisible, locationName }) => {
  const [posts, setPosts] = useState([]);
  let venueName = "Beer-BearBrick";
  //let venueName = locationName !== '' ? locationName : "Beer-BearBrick"; // Updated venueName assignment
  // render all venues data and setPosts
  useEffect(() => {
    console.log("passed location name:", locationName);
    setPosts([]);
    const querySnapshot = query(
      collection(FIRESTORE_DB, "venues"),
      where("name", "==", venueName),
      orderBy("createdAt", "desc")
    );
    const unsubcribe = onSnapshot(querySnapshot, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New Venue", change.doc.data());
          const venueData = change.doc.data();
          const venueId = change.doc.id; // Get the document ID
          console.log("New Venue ID: ", venueId);
          // console.log("New Venue uid: ", change.id);
          setPosts((prevVenues) => [
            ...prevVenues,
            { venueId: venueId, ...venueData },
          ]);
        }
      });
    });
    return () => unsubcribe();
  }, []);

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      {/* <View style={styles.modalContainer}>
        <VenueItems
          venueData={posts}
          //navigation={navigation}
          manageable={false}
        />
        <Button
          title="Cancel"
          onPress={() => setModalVisible(false)}
          color="#ffa31a"
        />
      </View> */}
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <VenueItems
              venueData={posts}
              //navigation={navigation}
              manageable={false}
            />
            {/* No cancel button needed */}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end", // Align modal to the bottom of the screen
    margin: 0, // Remove default margin
    marginBottom: 40,
  },
  modalContent: {
    backgroundColor: "#808080",
    borderRadius: 10,
    padding: 20,
    width: "90%", // Set the width to 90% of the screen
    height: 90, // Set the height to 90 pixels
    marginBottom: 20, // Add spacing from the bottom of the screen
  },
  textStyle: {
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10, // Add spacing between the buttons
  },
  buttonSpacing: {
    marginTop: 10,
  },
});

export default MapInfoModal;
