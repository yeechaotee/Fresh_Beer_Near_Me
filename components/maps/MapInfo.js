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

const MapInfoModal = ({
  modalVisible,
  setModalVisible,
  locationTitle,
  navigation,
}) => {
  const [posts, setPosts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(modalVisible);
  useEffect(() => {
    setIsModalVisible(modalVisible);
    if (modalVisible) {
      console.log("passed location name:", locationTitle);
      setPosts([]);
      const querySnapshot = query(
        collection(FIRESTORE_DB, "venues"),
        where("name", "==", locationTitle)
      );
      const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            console.log("New Venue", change.doc.data());
            const venueData = change.doc.data();
            const venueId = change.doc.id;
            console.log("New Venue ID: ", venueId);
            setPosts((prevVenues) => [
              ...prevVenues,
              { venueId: venueId, ...venueData },
            ]);
          }
        });
      });
      return () => unsubscribe();
    }
  }, [modalVisible, locationTitle]);

  const closeModal = () => {
    setIsModalVisible(false);
    if (setModalVisible) {
      setModalVisible(false);
    }
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
      onPress={closeModal}
    >
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalContainer}>
            <VenueItems
              onPress={closeModal}
              venueData={posts}
              navigation={navigation}
              manageable={false}
            />
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
