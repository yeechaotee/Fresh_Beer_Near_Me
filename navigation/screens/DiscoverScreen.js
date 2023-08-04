import React, { useEffect, useState } from 'react';

import { FlatList, Image, SafeAreaView } from 'react-native';

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
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


const YELP_API_KEY = "S_sQQHygX7Ui-K8lufhHmS0SZ_eH9ICa3CFPWTf1a0PcucfjqtH97x-sPBtpF3m65FB2Hp1UAQyMSw3XLlTHm3WALMQ3l5q3YcCmWnVxK8Cyaah2kiYfivsO0U2uZHYx"


// DiscoverScreen wrapped up inside navigation.js's NavigationContainer component
// Destructure way
export default function DiscoverScreen({ navigation }) {

    // passing data from VenueItems localRestaurant into venueData
    const [venueData, setVenueData] = useState(localRestaurants);
    const [city, setCity] = useState("Singapore");

    // const [activeTab, setActiveTab] = useState("Delivery");
    const [posts, setPosts] = useState([]);

    const [user, setUser] = useState(null);
    const [queryRole, setQueryRole] = useState(null);

    // get current user and user role from firebase
    useEffect(() =>
        onAuthStateChanged(FIREBASE_AUTH, async (user) => {
            // console.log('User info ---> ', user);
            if (user) {
                setUser(user);
                const q = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", user.uid), limit(1));
                // console.log("user id is:: " + user.uid);
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    setQueryRole(doc.data().role);
                    // console.log(doc.id, " => ", doc.data());
                    console.log(doc.id, " => User Role: ", doc.data().role);
                });
            }
            else {
                setUser(null);
            }
        })
        , []);


    // render all venues data and setPosts
    useEffect(() => {
        const unsubcribe = onSnapshot(collection(FIRESTORE_DB, 'venues'), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    console.log("New Venue", change.doc.data());
                    setPosts((prevVenues) => [...prevVenues, change.doc.data()])
                }
            })
        })

        return () => unsubcribe();
    }, [])


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

    };

    // useEffect hook looking for city dependencies,
    // when city is update, will always re-fire getVenueFromYelp()
    useEffect(() => {
        getVenueFromYelp();
    }, [city]);



    return (
        <SafeAreaView style={{ backgroundColor: "#eee", flex: 1 }}>
            <View style={{ backgroundColor: 'white', padding: 10 }}>
                {/* <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}


                {user && queryRole == "businessUser" ?
                    <><TouchableOpacity onPress={() => navigation.push('NewPostScreen')}>
                        <Image
                            source={require('../../assets/postadd.png')}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                    </> :
                    <></>}

                <SearchBar cityHandler={setCity} />
                {/* <FlatList
                    data={posts}
                    keyExtractor={(item, index) => index}
                    renderItem={({ item }) => {
                        if (item.fileType === "image") {
                            return (
                                <Image
                                    source={{ uri: item.url }}
                                    style={{ width: "34%", height: 100 }}
                                />
                            );
                        }


                    }} /> */}

            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Categories />


                {/* will pass Yelp API data into venueData */}
                <VenueItems venueData={posts} navigation={navigation} />

            </ScrollView>
            <Divider width={1} />

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    icon: {
        width: 30,
        height: 30,
        alignSelf: 'flex-end',
        marginTop: 10,
        // resizeMode: 'contain',
    }
})