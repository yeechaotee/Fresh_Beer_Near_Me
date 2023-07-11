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
import HeaderTabs from '../../components/HeaderTabs';
import SearchBar from '../../components/SearchBar';
import Categories from '../../components/Categories';
import { ScrollView } from 'react-native';
import VenueItem from '../../components/VenueItem';

export default function DiscoverScreen({ navigation }) {

    const onPressHandler = () => {
        // navigation.navigate('Screen_A');
        navigation.goBack();
    }

    return (
        <SafeAreaView style={{ backgroundColor: "#eee", flex: 1 }}>

            <View style={{ backgroundColor: 'white', padding: 10 }}>
                <HeaderTabs />
                <SearchBar />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Categories />
                <VenueItem />
                <VenueItem />
                <VenueItem />
            </ScrollView>

        </SafeAreaView>
    )
}
