import React, { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, SafeAreaView } from 'react-native';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    TouchableOpacity
} from 'react-native';

import { ScrollView } from 'react-native';
import VenueItems, { localRestaurants } from '../../components/home/VenueItems';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Searchbar } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { DrawerActions } from '@react-navigation/native';

export default function ManagePost({ navigation }) {

    const [posts, setPosts] = useState([]);

    const [user, setUser] = useState(null);
    const [queryRole, setQueryRole] = useState(null);

    const [searchString, setSearchString] = useState("");
    const [suggestion, setSuggestion] = useState([]);

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

                setPosts([]);
                const unsubcribe = onSnapshot(collection(FIRESTORE_DB, 'venues'), (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added" && change.doc.data().owner_uid === user.uid) {
                            console.log("New Venue", change.doc.data());
                            setPosts((prevVenues) => [...prevVenues, change.doc.data()])
                        }
                    })
                })
            }
            else {
                setUser(null);
                setPosts([]);
            }
        })
        , []);


    // render all venues data and setPosts
    // useEffect(() => {
    //     setPosts([]);
    //     const unsubcribe = onSnapshot(collection(FIRESTORE_DB, 'venues'), (snapshot) => {
    //         snapshot.docChanges().forEach((change) => {
    //             if (change.type === "added" && change.doc.data().owner_uid === user.uid) {
    //                 console.log("New Venue", change.doc.data());
    //                 setPosts((prevVenues) => [...prevVenues, change.doc.data()])
    //             }
    //         })
    //     })

    //     return () => unsubcribe();
    // }, [])

    // can just change the location city to what we wanna render
    // const getVenueFromYelp = () => {
    //     const yelpUrl = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${city}`

    //     // credential of YELP
    //     const apiOptions = {
    //         headers: {
    //             Authorization: `Bearer ${YELP_API_KEY}`,
    //         }
    //     };

    //     // get YELP Api, get json , hold json, set venuedata to all retrieved json data
    //     return fetch(yelpUrl, apiOptions)
    //         .then((res) => res.json())
    //         .then((json) => setVenueData(json.businesses))
    //         .catch(error => console.error('Error:', error));
    // };

    return (
        <SafeAreaView style={{ backgroundColor: "#eee", flex: 1 }}>
            <View style={{ backgroundColor: 'white' }}>
                {/* <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}

                {/* {user && queryRole == "businessUser" ?
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={() => navigation.push('NewPostScreen')}>
                            <Image
                                source={require('../../assets/posticon.png')}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                            <ImageBackground
                                source={require('../../assets/hamburgMenu.png')}
                                style={styles.icon}
                                imageStyle={{ borderRadius: 20 }}
                            />
                        </TouchableOpacity>

                    </View> :
                    <>
                    </>} */}

                {/* <SearchBar cityHandler={setCity} /> */}

                <View style={{ flexDirection: 'row' }}>
                    <LottieView style={styles.logo} source={require('../../assets/beer-logo.json')}
                        autoPlay
                        speed={0.5}
                    />

                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* <Categories /> */}

                {/* posts state will filter out only searched result if any and pass it to venueData */}
                <VenueItems venueData={posts} navigation={navigation} manageable={true} />
            </ScrollView>
            {/* <Divider width={1} /> */}

        </SafeAreaView>
    )

    // return (
    //     <View>
    //         <Text>ManagePost</Text>
    //     </View>
    // )
}


const styles = StyleSheet.create({
    icon: {
        width: 30,
        height: 30,
        alignSelf: 'flex-end',
        marginTop: 10,
        // resizeMode: 'contain',
    },
    logo: {
        width: 50,
        alignSelf: 'center',
        marginBottom: 30,
        height: 65,
        resizeMode: 'contain',
    }
})