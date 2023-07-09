import React, { useEffect, useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";
import darkModeStyle from "./darkMode.json";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_API_KEY } from "../../environments";

const { width, height } = Dimensions.get("window");

mapStyle = [{}];

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
  const [location, setLocation] = useState({
    latitude: 1.3525271913212642,
    latitudeDelta: 0.38941821562666146,
    longitude: 103.85964151471853,
    longitudeDelta: 0.1941436529159546,
  });

  const [userLocation, setUserLocation] = useState(null);

  const onRegionChange = (region) => {
    console.log(region);
    setUserLocation(region);
  };

  const showLocationsOfInterest = () => {
    return locationsOfInterest.map((item, index) => {
      return (
        <Marker
          key={index}
          coordinate={item.location}
          title={item.title}
          description={item.description}
        />
      );
    });
  };

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
        setLocation(coords);
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
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location}
        onRegionChange={onRegionChange}
        customMapStyle={darkModeStyle}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
          />
        )}
        {
          //showLocationsOfInterest()
        }
      </MapView>
      <View style={styles.userLocation}>
        <GooglePlacesAutocomplete
          styles={{ textInput: styles.input }}
          placeholder="Search"
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            console.log(data, details);
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: "en",
          }}
        />
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
  textStyle: {
    flex: 1,
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    paddingTop: 30,
  },
  map: {
    width: width,
    height: height,
  },
  userLocation: {
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
  },
  input: {
    borderColor: "#888",
    borderWidth: 1,
    borderRadius: 8,
  },
});
