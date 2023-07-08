import * as React from "react";
import { StyleSheet, View, Text } from "react-native";

export default function NotificationsScreen() {
  return (
    <View style={styles.viewStyle}>
      <Text style={styles.textStyle}>Notifications Screen Test</Text>
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
