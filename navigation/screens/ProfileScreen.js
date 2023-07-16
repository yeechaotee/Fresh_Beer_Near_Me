import React from 'react';
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
import HeaderTabs from '../../components/home/HeaderTabs';
import SearchBar from '../../components/home/SearchBar';
import Categories from '../../components/home/Categories';

export default function ProfileScreen({ navigation }) {

    const onPressHandler = () => {
        // navigation.navigate('Screen_A');
        navigation.goBack();
    }

    return (
        <TailwindProvider>
            <SafeAreaView className="bg-white flex-1 relative">
                {/* First Section */}
                {/* <View style={{ backgroundColor: 'white', padding: 10 }}>
                    <HeaderTabs />
                    <SearchBar />
                    <Categories />
                </View> */}
                

                <View className="flex-row px-6 mt-8 items-center space-x-2">
                    <View className="w-16 h-16 bg-black rounded-full items-center justify-center">
                        <Text className="text-[#00BCC9] text-3xl font-semibold">Go</Text>
                    </View>

                    <Text className="text-[#2A2B4B] text-3xl font-semibold">Beer Discovery</Text>
                </View>

                {/* Second Section */}
                <View className="px-6 mt-8 space-y-3">
                    <Text className="text-[#3C6072] text-[42px]">We are</Text>
                    <Text className="text-[#00BCC9] text-[38px] font-bold">
                        Fresh Beer Near Me
                    </Text>

                    {/* <Text className="text-[#3C6072] text-base">
                        Fresh Beer Near Me
                    </Text> */}
                </View>

                {/* Circle Section */}
                <View className="w-[200px] h-[150px] bg-[#00BCC9] rounded-full absolute bottom-36 -right-36"></View>
                <View className="w-[200px] h-[200px] bg-[#E99265] rounded-full absolute -bottom-28 -left-36"></View>

                {/* Image container */}
                <View className="flex-1 relative items-center justify-center">
                    <Animatable.Image
                        animation="fadeIn"
                        easing="ease-in-out"
                        source={DiscoveryImage}
                        className="w-full h-full object-cover mt-20"
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate("Discover")}
                        className="absolute bottom-10 w-44 h-44 border-l-2 border-r-2 border-t-4 border-[#00BCC9] rounded-full items-center justify-center"
                    >
                        <Animatable.View
                            animation={"pulse"}
                            easing="ease-in-out"
                            iterationCount={"infinite"}
                            className="w-40 h-40 items-center justify-center rounded-full bg-[#00BCC9]"
                        >
                            <Text className="text-gray-50 text-[36px] font-semibold">Discover</Text>
                        </Animatable.View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </TailwindProvider>
    )
}
