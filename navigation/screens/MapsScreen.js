import * as React from "react";
import { StyleSheet, View, Text } from "react-native";

export default function MapsScreen() {
  return (
    <View style={styles.viewStyle}>
      <Text style={styles.textStyle}>Maps Screen</Text>
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
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
});
