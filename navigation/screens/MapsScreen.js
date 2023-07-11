import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Dimensions,
  Button,
  Image,
  Text,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";
import darkModeStyle from "./darkMode.json";
import Constants from "expo-constants";
import InputAutoComplete from "./InputAutoComplete";
import { endAsyncEvent } from "react-native/Libraries/Performance/Systrace";
import GetRideModal from "./GetRide";

const { width, height } = Dimensions.get("window");

// location markers
// let locationsOfInterest = [
//   {
//     title: "first",
//     location: {
//       latitude: 1.369778,
//       longitude: 103.849437,
//     },
//     description: "my first marker",
//   },
//   {
//     title: "second",
//     location: {
//       latitude: 1.316721,
//       longitude: 103.882049,
//     },
//     description: "my second marker",
//   },
// ];

export default function MapsScreen() {
  // states
  const chekInPress = () => {
    console.log("User Location:", userLocation);
  };

  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const [userLocation, setUserLocation] = useState({
    latitude: 1.3525271913212642,
    latitudeDelta: 0.38941821562666146,
    longitude: 103.85964151471853,
    longitudeDelta: 0.1941436529159546,
  });

  const [destination, setDestination] = useState(null);

  const mapRef = useRef(null);

  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  const onPlaceSelected = (details, flag) => {
    console.log("Selected Place:", details);
    console.log("Flag:", flag);
    if (details && details.geometry && details.geometry.location) {
      const position = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };

      // Perform different actions based on the flag value
      if (flag === "userLocation") {
        // Handle user location
        setUserLocation(position);
      } else if (flag === "destination") {
        // Handle destination location
        setDestination(position);
      } else {
        // Invalid flag value
      }
      moveTo(position);
    } else {
      console.log("No place selected");
    }
  };

  // const showLocationsOfInterest = () => {
  //   return locationsOfInterest.map((item, index) => {
  //     return (
  //       <Marker
  //         key={index}
  //         coordinate={item.location}
  //         title={item.title}
  //         description={item.description}
  //       />
  //     );
  //   });
  // };

  useEffect(() => {
    console.log("use effect run");
    const getPermissions = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log("status: " + status);
      if (status !== "granted") {
        console.log("Please grant location permission");
        return;
      }
      console.log("permissions checked");

      try {
        console.log("trying get location");
        let coords = await Location.getCurrentPositionAsync();
        setUserLocation(coords);
        console.log("location");
        console.log(coords);
        console.log("coordinates recorded");
      } catch (error) {
        console.log(error);
      }
    };
    getPermissions();
  }, []);

  return (
    <View style={styles.viewStyle}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={userLocation}
        customMapStyle={darkModeStyle}
      >
        {userLocation && (
          <Marker
            draggable
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            onDragEnd={(e) => setUserLocation(e.nativeEvent.coordinate)}
          />
        )}
        {destination && (
          <Marker
            draggable
            coordinate={destination}
            title="destination"
            description="Your destination"
            onDragEnd={(e) => setDestination(e.nativeEvent.coordinate)}
          />
        )}
        {
          //showLocationsOfInterest()
        }
      </MapView>
      <View style={styles.userLocationContainer}>
        <InputAutoComplete
          label="My Location"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "userLocation");
          }}
        />
        <InputAutoComplete
          label="My Destination"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          }}
        />
        <View
          style={{
            width: "50%",
            alignSelf: "center",
          }}
        >
          <Button title="Take me There" onPress={handleOpenModal} />
        </View>
      </View>
      <View>
        <GetRideModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </View>
      <View style={styles.checkIn}>
        <Pressable
          onPress={chekInPress}
          style={{
            flexDirection: "row",
            backgroundColor: "#ffa31a",
            borderRadius: 30,
            alignContent: "center",
            alignItems: "center",
            width: 10,
          }}
        >
          <Image
            source={require("../../assets/navIcons/goal.png")}
            style={{
              width: 40,
              height: 40,
            }}
          />
          <Text style={{ color: "white" }}>Check In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  map: {
    width: width,
    height: height,
  },
  userLocationContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "#ffa31a",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    color: "#ffffff",
    top: Constants.statusBarHeight,
  },
  checkIn: {
    position: "absolute",
    alignItems: "center",
    bottom: 100,
  },
});

// to improve
// -dynamic location and destination wording on drag end
// -dynamic floating tootltip for pins on dragend. and on creation
