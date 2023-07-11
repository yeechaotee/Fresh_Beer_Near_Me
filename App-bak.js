import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Image } from "react-native";

// Screens
import ActivityScreen from "./navigation/screens/ActivityScreen";
import MapsScreen from "./navigation/screens/MapsScreen";
import DiscoverScreen from "./navigation/screens/DiscoverScreen";
import NotificationsScreen from "./navigation/screens/NotificationsScreen";
import ProfileScreen from "./navigation/screens/ProfileScreen";

const iconHeight = 45;
const iconWidth = 45;
const iconColor = "#ffffff";
const iconColorSelected = "#ffa31a";

export default function App() {
  const [screenPage, setScreenPage] = useState("Discover");
  const [activeButton, setActiveButton] = useState("Discover");

  const changePage = (page) => {
    console.log(page + " has been pressed!");
    setScreenPage(page);
    setActiveButton(page);
  };

  let content;
  switch (screenPage) {
    case "Activity":
      content = <ActivityScreen />;
      break;
    case "Maps":
      content = <MapsScreen />;
      break;
    case "Discover":
      content = <DiscoverScreen />;
      break;
    case "Notifications":
      content = <NotificationsScreen />;
      break;
    case "Profile":
      content = <ProfileScreen />;
      break;
    default:
      content = (
        <Text style={{ fontSize: 30, color: "white" }}>
          error: page not found
        </Text>
      );
      break;
  }

  return (
    <View style={styles.container}>
      <View>
        {content}
        <StatusBar style="light" />
      </View>

      <View style={styles.NavContainer}>
        <View style={styles.NavBar}>
          <Pressable
            onPress={() => {
              changePage("Activity");
              setActiveButton("Activity");
            }}
            style={styles.IconBehave}
            android_ripple={{ borderless: true, radius: 50 }}
          >
            <Image
              source={require("./assets/navIcons/goal.png")}
              style={{
                width: iconWidth,
                height: iconHeight,
                tintColor:
                  activeButton === "Activity" ? iconColorSelected : iconColor,
              }}
            />
          </Pressable>

          <Pressable
            onPress={() => {
              changePage("Maps");
              setActiveButton("Maps");
            }}
            style={styles.IconBehave}
            android_ripple={{ borderless: true, radius: 50 }}
          >
            <Image
              source={require("./assets/navIcons/beermap.png")}
              style={{
                width: iconWidth,
                height: iconHeight,
                tintColor:
                  activeButton === "Maps" ? iconColorSelected : iconColor,
              }}
            />
          </Pressable>

          <Pressable
            onPress={() => {
              changePage("Discover");
              setActiveButton("Discover");
            }}
            style={styles.IconBehave}
            android_ripple={{ borderless: true, radius: 50 }}
          >
            <Image
              source={require("./assets/navIcons/discovery.png")}
              style={{
                width: iconWidth,
                height: iconHeight,
                tintColor:
                  activeButton === "Discover" ? iconColorSelected : iconColor,
              }}
            />
          </Pressable>

          <Pressable
            onPress={() => {
              changePage("Notifications");
              setActiveButton("Notifications");
            }}
            style={styles.IconBehave}
            android_ripple={{ borderless: true, radius: 50 }}
          >
            <Image
              source={require("./assets/navIcons/goal.png")}
              style={{
                width: iconWidth,
                height: iconHeight,
                tintColor:
                  activeButton === "Notifications"
                    ? iconColorSelected
                    : iconColor,
              }}
            />
          </Pressable>

          <Pressable
            onPress={() => {
              changePage("Profile");
              setActiveButton("Profile");
            }}
            style={styles.IconBehave}
            android_ripple={{ borderless: true, radius: 50 }}
          >
            <Image
              source={require("./assets/navIcons/profile.png")}
              style={{
                width: iconWidth,
                height: iconHeight,
                tintColor:
                  activeButton === "Profile" ? iconColorSelected : iconColor,
              }}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },

  NavContainer: {
    position: "absolute",
    alignItems: "center",
    bottom: 20,
  },

  NavBar: {
    flexDirection: "row",
    backgroundColor: "#808080",
    width: "98%",
    justifyContent: "space-evenly",
    borderRadius: 40,
  },
  IconBehave: {
    padding: 14,
  },
});
