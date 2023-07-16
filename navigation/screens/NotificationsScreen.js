import * as React from "react";
//import { StyleSheet, View, Text } from "react-native";

////////////////////////////////

import { SafeAreaView } from 'react-native';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    TouchableOpacity
} from 'react-native';

import { TailwindProvider } from 'tailwindcss-react-native';
import { DiscoveryImage } from '../../assets';
import * as Animatable from "react-native-animatable";
import TabNotif from '../../components/TabNotif';
//import TabNotif from '../../components/TabNotif';
import SearchBar from '../../components/SearchBar';
import Categories from '../../components/Categories';


///////////////////////////////////////////////


import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
//import ScreenA from './ScreenA';
import ScreenB from './ScreenB';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

/////////////////////////////////////////////////////////

export default function NotificationsScreen(navigation) {

     const onPressHandler = () => {
        // navigation.navigate('Screen_A');
        navigation.goBack();
    }

      return (

        <TailwindProvider>
                <SafeAreaView className="bg-white flex-1 relative">
                    {/* First Section */}
                    {/* <View style={{ backgroundColor: 'white', padding: 10 }}>
                        <TabNotif />
                        <SearchBar />
                        <Categories />
                    </View> */}
                    

                    <View className="flex-row px-6 mt-8 items-center space-x-2">
                        <Text className="text-[#2A2B4B] text-3xl font-semibold">Notification</Text>
                    </View>

                    {/* Second Section */}

                    <View style={{ backgroundColor: 'white', padding: 10 }}>
                        <TabNotif />
                    </View>
                </SafeAreaView>
            </TailwindProvider>

      );
  };
  



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
