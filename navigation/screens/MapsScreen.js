import React, { useEffect, useState } from "react";
import {
  PermissionsAndroid,
  StyleSheet,
  View,
  Text,
  Dimensions,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: 1.290475,
  longitude: 103.852036,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

export default function MapsScreen() {
  const [currentPosition, setCurrentPosition] = useState(INITIAL_POSITION);

  return (
    <View style={styles.viewStyle}>
      <Text style={styles.textStyle}>Maps Screen</Text>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={currentPosition}
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
    height: "90%",
    paddingBottom: 0,
  },
});
