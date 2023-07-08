import React, { useEffect, useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";
import darkModeStyle from "./darkMode.json";

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
});
