// SimpleMenu.js
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
 Menu,
 MenuProvider,
 MenuOptions,
 MenuOption,
 MenuTrigger,
} from "react-native-popup-menu";

const SimpleMenu = () => {
 return (
   <MenuProvider style={styles2.container}>
     <Menu>
       <MenuTrigger
         text="Click for Option menu"
         customStyles={{
           triggerWrapper: {
             top: -20,
           },
         }}
       />
       <MenuOptions>
         <MenuOption onSelect={() => alert(`Save`)} text="Save" />
         <MenuOption onSelect={() => alert(`Delete`)} text="Delete" />
       </MenuOptions>
     </Menu>
   </MenuProvider>
 );
};

export default SimpleMenu;

const styles2 = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: "#fff",
   color: "black",
   justifyContent: "center",
   alignItems: "center",
   padding: 30,
   flexDirection: "column",
 },
});