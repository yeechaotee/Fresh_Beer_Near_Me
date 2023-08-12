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
    //const [city, setCity] = useState("Singapore");

    // const [activeTab, setActiveTab] = useState("Delivery");
    const [posts, setPosts] = useState([]);

    const [user, setUser] = useState(null);
    const [queryRole, setQueryRole] = useState(null);

    const [searchString, setSearchString] = useState("");
    const [suggestion, setSuggestion] = useState([]);

    const [r, setR] = useState(null);
    const [bp, setBP] = useState(null);
    const [fb, setFB] = useState(null);

    const [loading, setLoading] = useState(true);

    // render all venues data and setPosts
    useEffect(() => {
        setPosts([]);
        const querySnapshot = query(collection(FIRESTORE_DB, 'venues'), orderBy('createdAt', "desc"));
        const unsubcribe = onSnapshot(querySnapshot, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    // console.log("New Venue", change.doc.data());
                    const venueData = change.doc.data();
                    const venueId = change.doc.id; // Get the document ID
                    // console.log('New Venue ID: ', venueId);
                    // console.log("New Venue uid: ", change.id);
                    // Check if initial posts have been set
                    setPosts((prevVenues) => [...prevVenues, { venueId: venueId, ...venueData }]);
                }
            })
        });
        return () => unsubcribe();
    }, [])

    // const sfRef = db.collection('cities').doc('SF');
    // const collections = await sfRef.listCollections();
    // collections.forEach(collection => {
    //     console.log('Found subcollection with id:', collection.id);
    // });

    // get current user and user role from firebase
    useEffect(() =>
        onAuthStateChanged(FIREBASE_AUTH, async (user) => {
            // console.log('User info ---> ', user);
            if (user) {
                setUser(user);
                console.log("User info: => " + user);
                const q = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", user.uid), limit(1));
                // console.log("user id is:: " + user.uid);
                const querySnapshot = await getDocs(q);

                const promises = querySnapshot.docs.map(async (doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    setQueryRole(doc.data().role);
                    // console.log(doc.id, " => ", doc.data());
                    console.log(doc.id, " => User Role: ", doc.data().role,
                    " => User Region: ", doc.data().region,
                    " => User BP: ", doc.data().beerProfile,
                    " => User FB: ", doc.data().favBeer,
                    );
                    
                    setR(doc.data().region);
                    
                    setBP(doc.data().beerProfile);
                    
                    setFB(doc.data().favBeer);
                   
                });
                await Promise.all(promises);
            }
            else {
                setUser(null);
                setPosts([]);
            }
        })
        , []);

    useEffect(() => {
    // This effect runs whenever r, bp, or fb changes
        updateUserPreferences(r, bp, fb);
    }, [r, bp, fb]);

    // render all venues data and setPosts
    // useEffect(() => {
    //     setPosts([]);
    //     const unsubcribe = onSnapshot(collection(FIRESTORE_DB, 'venues'), (snapshot) => {
    //         snapshot.docChanges().forEach((change) => {
    //             if (change.type === "added") {
    //                 console.log("New Venue", change.doc.data());
    //                 setPosts((prevVenues) => [...prevVenues, change.doc.data()])
    //             }
    //         })
    //     })

    //     return () => unsubcribe();
    // }, [])


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
