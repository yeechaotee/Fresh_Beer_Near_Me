import React from "react";
import { Button, Modal, StyleSheet, View, Text, Linking } from "react-native";

const transportApps = {
  //incomplete deeplinking commands
  gojek: {
    name: "Gojek",
    deepLink: "gojek://",
  },
  grab: {
    name: "Grab",
    deepLink: "grab://'",
  },
  cdgZig: {
    name: "CDG Zig",
    deepLink: "comfortdelgro://",
  },
  tada: {
    name: "Tada",
    deepLink: "tada://",
  },
};

const GetRideModal = ({ modalVisible, setModalVisible }) => {
  const handleOpenDefaultTransportApp = async (deepLink) => {
    try {
      await Linking.openURL(deepLink);
      setModalVisible(false);
    } catch (error) {
      console.log("Error occurred while opening the transport app:", error);
    }
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.textStyle}>
            Don't Drink and Drive, take a cab
          </Text>
          <View style={styles.buttonContainer}>
            {Object.values(transportApps).map((app) => (
              <View key={app.name} style={styles.buttonSpacing}>
                <Button
                  title={`Open ${app.name}`}
                  onPress={() => handleOpenDefaultTransportApp(app.deepLink)}
                />
              </View>
            ))}
          </View>
          <Button
            title="Cancel"
            onPress={() => setModalVisible(false)}
            color="#ffa31a"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#808080",
    borderRadius: 10,
    padding: 20,
    width: "80%",
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

export default GetRideModal;

// to improve
// -button style
// -deeplink
