import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, RefreshControl, SafeAreaView, StyleSheet, View, Text, Pressable, TouchableOpacity, Button } from 'react-native';

import { ScrollView } from 'react-native';
import VenueItems, { localRestaurants } from '../../components/home/VenueItems';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where, orderBy } from 'firebase/firestore';
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

    const [visiblePosts, setVisiblePosts] = useState(5);  //limit contents to 5
    const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDataFromFirebase();
    }, []);


    const fetchDataFromFirebase = async () => {
        try {

            onAuthStateChanged(FIREBASE_AUTH, async (user) => {
                // console.log('User info ---> ', user);

                // get all venues created by this current logon user
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

                    setPosts([]); // Clear previous posts
                    const subquerySnapshot = query(collection(FIRESTORE_DB, 'venues'), orderBy('createdAt', "desc"));
                    const unsubcribe = onSnapshot(subquerySnapshot, (snapshot) => {
                        const initialPosts = [];
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added" && change.doc.data().owner_uid === user.uid) {
                                console.log("New Venue", change.doc.data());
                                const venueData = change.doc.data();
                                const venueId = change.doc.id; // Get the document ID
                                initialPosts.push({ venueId: venueId, ...venueData });
                                // setPosts((prevVenues) => [...prevVenues, { venueId: venueId, ...venueData }])
                            }
                        });

                        setPosts(initialPosts);
                        setIsLoading(false); //  hide loading 
                        setRefreshing(false); // hide refreshing 
                    });
                    return () => unsubcribe();
                }
                else {
                    setUser(null);
                    setPosts([]);
                }
            })

        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDataFromFirebase();
        setVisiblePosts(5);
        setShowLoadMoreButton(true);
        setRefreshing(false);
    }, []);

    const handleLoadMore = () => {
        const newVisiblePosts = visiblePosts + 5;
        if (newVisiblePosts >= posts.length) {
            setShowLoadMoreButton(false);
        }
        setVisiblePosts(newVisiblePosts);
    };

    // get current user and user role from firebase
    // useEffect(() =>
    //     onAuthStateChanged(FIREBASE_AUTH, async (user) => {
    //         // console.log('User info ---> ', user);
    //         if (user) {
    //             setUser(user);
    //             const q = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", user.uid), limit(1));
    //             // console.log("user id is:: " + user.uid);
    //             const querySnapshot = await getDocs(q);
    //             querySnapshot.forEach((doc) => {
    //                 // doc.data() is never undefined for query doc snapshots
    //                 setQueryRole(doc.data().role);
    //                 // console.log(doc.id, " => ", doc.data());
    //                 console.log(doc.id, " => User Role: ", doc.data().role);
    //             });

    //             setPosts([]);

    //             const subquerySnapshot = query(collection(FIRESTORE_DB, 'venues'), orderBy('createdAt', "desc"));
    //             const unsubcribe = onSnapshot(subquerySnapshot, (snapshot) => {
    //                 snapshot.docChanges().forEach((change) => {
    //                     if (change.type === "added" && change.doc.data().owner_uid === user.uid) {
    //                         console.log("New Venue", change.doc.data());
    //                         const venueData = change.doc.data();
    //                         const venueId = change.doc.id; // Get the document ID
    //                         setPosts((prevVenues) => [...prevVenues, { venueId: venueId, ...venueData }])
    //                     }
    //                 })
    //             })
    //         }
    //         else {
    //             setUser(null);
    //             setPosts([]);
    //         }
    //     })
    //     , []);


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

            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {/* <VenueItems venueData={posts} navigation={navigation} manageable={true} /> */}
                <VenueItems venueData={posts.slice(0, visiblePosts)} navigation={navigation} manageable={true} />

                {showLoadMoreButton && (
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <Button
                            title="Load More"
                            onPress={handleLoadMore}
                            loading={isLoading}
                            disabled={isLoading}
                            buttonStyle={styles.loadMoreButton}
                            titleStyle={styles.loadMoreButtonText}
                        />
                    </View>
                )}
            </ScrollView>

            {/* <ScrollView showsVerticalScrollIndicator={false}>
                <VenueItems venueData={posts} navigation={navigation} manageable={true} />
            </ScrollView> */}
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