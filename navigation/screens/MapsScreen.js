import React, { useEffect, useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

export default function MapsScreen() {
  const [location, setLocation] = useState();

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
      />
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
