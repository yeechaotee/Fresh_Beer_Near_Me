import React, { useState } from "react";
import { Image, Button, Modal, StyleSheet, View, Text } from "react-native";
import Constants from "expo-constants";
import DropDownPicker from "react-native-dropdown-picker";

const userName = "put username here dynamically"; // make dynamic later on.

const surveyModal = ({
  modalVisible,
  setModalVisible,
  setSurveyIsDone,
  handleSubmit,
}) => {
  //submit button needs
  const handleModalSubmit = (beerProfileValue, favBeerValue, regionValue) => {
    console.log("submit button pressed");
    // record the values below
    console.log("beer profile: ", beerProfileValue);
    console.log("fav beer: ", favBeerValue);
    console.log("region: ", regionValue);
    setModalVisible(false);
    setSurveyIsDone(true);
    handleSubmit();
    //clear all the values
    setBeerProfileIsOpen(false);
    setBeerProfileValue([]);
    setfavBeerIsOpen(false);
    setfavBeerValue([]);
    setregionIsOpen(false);
    setregionValue([]);
  };

  //skip button needs
  const handleSkip = () => {
    setModalVisible(false);
    setSurveyIsDone(true);
    console.log("skip button pressed");
    handleSubmit();
    //clear all the values
    setBeerProfileIsOpen(false);
    setBeerProfileValue([]);
    setfavBeerIsOpen(false);
    setfavBeerValue([]);
    setregionIsOpen(false);
    setregionValue([]);
  };

  //beer profile needs
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

  //favourite beer needs
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

  //region needs
  const [regionIsOpen, setregionIsOpen] = useState(false);
  const [regionValue, setregionValue] = useState([]);
  const regions = [
    { label: "North", value: "North" },
    { label: "South", value: "South" },
    { label: "East", value: "East" },
    { label: "West", value: "West" },
  ];

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.Header1}>Quick Survey</Text>

        <Image style={styles.image} source={require("../../assets/icon.png")} />

        <Text style={styles.Header2}>Hi {userName}</Text>

        <View style={styles.container}>
          <Text style={styles.message1}>Let's get to know you better.</Text>
        </View>

        <View style={{ padding: 10, zIndex: 3 }}>
          <Text style={styles.Header3}>Whats your beer profile?</Text>
          {/* <Text>beer types</Text> */}

          <DropDownPicker
            items={beerProfiles}
            open={beerProfileIsOpen}
            setOpen={() => {
              setBeerProfileIsOpen(!beerProfileIsOpen),
                setfavBeerIsOpen(false),
                setregionIsOpen(false);
            }}
            value={beerProfileValue}
            setValue={(val) => setBeerProfileValue(val)}
            maxHeight={200}
            autoScroll={true}
            placeholder="Select your beer profile"
            showTickIcon={false}
            disableBorderRadius={false}
            theme="LIGHT"
            multiple={true}
            min={0}
            max={7}
            mode="BADGE"
            badgeColors={"white"}
            badgeDotColors={"#ffa31a"}
            badgeTextStyle={{ color: "black" }}
            containerStyle={{ backgroundColor: "#fafafa" }}
            dropDownContainerStyle={{ backgroundColor: "#fafafa" }}
          />
        </View>

        <View style={{ padding: 10, zIndex: 2 }}>
          <Text style={styles.Header3}>whats your favourite beers?</Text>
          {/* <Text>beer types</Text> */}

          <DropDownPicker
            items={favBeers}
            open={favBeerIsOpen}
            setOpen={() => {
              setfavBeerIsOpen(!favBeerIsOpen),
                setBeerProfileIsOpen(false),
                setregionIsOpen(false);
            }}
            value={favBeerValue}
            setValue={(val) => setfavBeerValue(val)}
            maxHeight={200}
            autoScroll={true}
            placeholder="Select your favourites"
            showTickIcon={false}
            disableBorderRadius={false}
            theme="LIGHT"
            multiple={true}
            min={0}
            max={7}
            mode="BADGE"
            badgeColors={"white"}
            badgeDotColors={"#ffa31a"}
            badgeTextStyle={{ color: "black" }}
            containerStyle={{ backgroundColor: "#fafafa" }}
            dropDownContainerStyle={{ backgroundColor: "#fafafa" }}
          />
        </View>

        <View style={{ padding: 10, zIndex: 1 }}>
          <Text style={styles.Header3}>select your region</Text>
          {/* <Text>drop down region</Text> */}

          <DropDownPicker
            items={regions}
            open={regionIsOpen}
            setOpen={() => {
              setregionIsOpen(!regionIsOpen),
                setBeerProfileIsOpen(false),
                setfavBeerIsOpen(false);
            }}
            value={regionValue}
            setValue={(val) => setregionValue(val)}
            maxHeight={200}
            autoScroll
            placeholder="Select your region"
            showTickIcon={false}
            disableBorderRadius={false}
            theme="LIGHT"
            multiple={false}
            mode="BADGE"
            badgeColors={"white"}
            badgeDotColors={"#ffa31a"}
            badgeTextStyle={{ color: "black" }}
            containerStyle={{ backgroundColor: "#fafafa" }}
            dropDownContainerStyle={{ backgroundColor: "#fafafa" }}
            closeAfterSelecting={true}
            dropDownDirection="BOTTOM"
          />
        </View>

        <Text style={styles.Header3}>any more question to add on??</Text>

        <View style={styles.button}>
          <Button
            title="submit"
            onPress={() => (
              handleModalSubmit(beerProfileValue, favBeerValue, regionValue),
              setSurveyIsDone(true)
            )}
          />
          <Button title="skip" onPress={() => handleSkip()} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  TouchableOpacity: {
    alignSelf: "stretch",
    paddingHorizontal: 20,
  },
  beerColorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    borderColor: "red",
    borderWidth: 5,
    height: 100,
    width: 200,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    flex: 1,
    marginBottom: 25,
    justifyContent: "space-evenly",
    width: "80%",
  },
  question: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    flexDirection: "column",
    top: Constants.statusBarHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  Header1: {
    color: "#000",
    fontSize: 30,
    fontStyle: "normal",
    fontWeight: "700",
  },
  Header2: {
    color: "#000",
    fontSize: 20,
    fontStyle: "normal",
    fontWeight: "700",
  },
  Header3: {
    color: "#000",
    fontSize: 15,
    fontStyle: "normal",
    fontWeight: "500",
    textAlign: "left",
  },
  text1: {
    color: "#000",
    fontSize: 15,
    fontStyle: "normal",
    marginVertical: 20,
  },
  message1: {
    textAlign: "center",
  },
});

export default surveyModal;
