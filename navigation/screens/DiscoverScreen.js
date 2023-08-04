import React, { useEffect, useState } from 'react';
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
import { ScrollView } from 'react-native';
import VenueItems, { localRestaurants } from '../../components/home/VenueItems';
import { Divider } from 'react-native-elements/dist/divider/Divider';

const YELP_API_KEY = "S_sQQHygX7Ui-K8lufhHmS0SZ_eH9ICa3CFPWTf1a0PcucfjqtH97x-sPBtpF3m65FB2Hp1UAQyMSw3XLlTHm3WALMQ3l5q3YcCmWnVxK8Cyaah2kiYfivsO0U2uZHYx"


// DiscoverScreen wrapped up inside navigation.js's NavigationContainer component
// Destructure way
export default function DiscoverScreen({ navigation }) {

    // passing data from VenueItems localRestaurant into venueData
    const [venueData, setVenueData] = useState(localRestaurants);
    const [city, setCity] = useState("Singapore");
    const [activeTab, setActiveTab] = useState("Delivery");

    // can just change the location city to what we wanna render
    const getVenueFromYelp = () => {
        const yelpUrl = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${city}`

        // credential of YELP
        const apiOptions = {
            headers: {
                Authorization: `Bearer ${YELP_API_KEY}`,
            }
        };

        // get YELP Api, get json , hold json, set venuedata to all retrieved json data
        return fetch(yelpUrl, apiOptions)
            .then((res) => res.json())
            .then((json) => setVenueData(json.businesses))
            .catch(error => console.error('Error:', error));
        // return fetch(yelpUrl, apiOptions)
        //     .then((res) => res.json())
        //     .then((json) => setVenueData(
        //             json.businesses.filter((business) =>
        //                 business.transactions.includes(activeTab.toLowerCase())
        //             )
        //         )
        //     );
    };

    // useEffect hook looking for city dependencies,
    // when city is update, will always re-fire getVenueFromYelp()
    useEffect(() => {
        getVenueFromYelp();
    }, [city]);
    // useEffect(() => {
    //     getVenueFromYelp();
    // }, [city, activeTab]);


    return (
        <SafeAreaView style={{ backgroundColor: "#eee", flex: 1 }}>
            <View style={{ backgroundColor: 'white', padding: 10 }}>
                {/* <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}
                <SearchBar cityHandler={setCity} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Categories />
                {/* will pass Yelp API data into venueData */}
                <VenueItems venueData={venueData} navigation={navigation} />
            </ScrollView>
            <Divider width={1} />

        </SafeAreaView>
    )
}
