import React, { useCallback, useEffect, useState } from 'react';
import { Image, ImageBackground, RefreshControl, SafeAreaView } from 'react-native';
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
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Searchbar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import Navigator from '../../components/NewPost/drawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ManagePost from '../../components/NewPost/ManagePost';
import { Button } from 'react-native-elements';
import { DrawerActions } from '@react-navigation/native';
import NewPostScreen from './NewPostScreen';


const YELP_API_KEY = "S_sQQHygX7Ui-K8lufhHmS0SZ_eH9ICa3CFPWTf1a0PcucfjqtH97x-sPBtpF3m65FB2Hp1UAQyMSw3XLlTHm3WALMQ3l5q3YcCmWnVxK8Cyaah2kiYfivsO0U2uZHYx"


const Drawer = createDrawerNavigator();


function Home({ navigation }) {
    // passing data from VenueItems localRestaurant into venueData
    const [venueData, setVenueData] = useState(localRestaurants);

    const [posts, setPosts] = useState([]);

    const [visiblePosts, setVisiblePosts] = useState(5);  //limit contents to 5

    const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);

    const [user, setUser] = useState(null);
    const [queryRole, setQueryRole] = useState(null);

    const [searchString, setSearchString] = useState("");
    const [suggestion, setSuggestion] = useState([]);

    const [r, setR] = useState(null);
    const [bp, setBP] = useState(null);
    const [fb, setFB] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDataFromFirebase();
        handleRefresh();
    }, []);

    const fetchDataFromFirebase = async () => {
        try {
            setPosts([]); // Clear previous posts
            const querySnapshot = query(collection(FIRESTORE_DB, 'venues'), where('isActivated', "==", true), orderBy('createdAt', 'desc'));
            const unsubcribe = onSnapshot(querySnapshot, (snapshot) => {
                const initialPosts = [];
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const venueData = change.doc.data();
                        const venueId = change.doc.id;
                        initialPosts.push({ venueId: venueId, ...venueData });
                    }
                });
                setPosts(initialPosts);
                setIsLoading(false); //  hide loading 
                setRefreshing(false); // hide refreshing 
            });
            return () => unsubcribe();
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
    useEffect(() =>
        onAuthStateChanged(FIREBASE_AUTH, async (user) => {
            if (user) {
                setUser(user);
                const q = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", user.uid), limit(1));
                // console.log("user id is:: " + user.uid);
                const querySnapshot = await getDocs(q);

                const promises = querySnapshot.docs.map(async (doc) => {
                    setQueryRole(doc.data().role);

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

    const handleSearchInput = async (text) => {
        setSearchString(text);

        if (text !== "") {
            const q = query(collection(FIRESTORE_DB, 'venues'), where("name", ">=", searchString), where('isActivated', "==", true), where("name", "<=", searchString + '\uf8ff'), limit(2));
            const querySnapshot = await getDocs(q);
            setSuggestion(querySnapshot.docs);
        }
    };

    // ------------------------- Cindy changes from here----------------

    const updateUserPreferences = async (r, bp, fb) => {
        try {
            // Initialize updated preferences
            let matchedRegion = [];
            let matchedBeerProfile = [];
            let matchedFavBeer = [];
            let fullVenue = posts;

            console.log("User Preference Region:", r);
            console.log("User Preference beerprofile:", bp);
            console.log("User Preference favbeer:", fb);

            // Check and update docData preferences
            if (r !== undefined && r !== null) {
                matchedRegion = await getVenueData("region", r, "string");
            }
            if (bp !== undefined && bp !== null) {
                matchedBeerProfile = await getVenueData("beerProfile", bp, "array");
            }
            if (fb !== undefined && fb !== null) {
                matchedFavBeer = await getVenueData("favBeer", fb, "array");
                console.log("fav beer matched:", matchedFavBeer);
            }

            // Combine arrays with matching preference
            const combinedArray = [...matchedRegion, ...matchedBeerProfile, ...matchedFavBeer, ...fullVenue];

            // Count the occurrences of each venueId
            const venueIdCounts = {};
            combinedArray.forEach(item => {
                if (venueIdCounts[item.venueId] === undefined) {
                    venueIdCounts[item.venueId] = 0;
                }
                venueIdCounts[item.venueId]++;
            });

            // Sort the combinedArray based on the occurrence of venueId
            /*
            If the subtraction result is positive, it means that b.venueId occurs more frequently than a.venueId, so b should appear before a in the sorted array.
            If the subtraction result is negative, it means that a.venueId occurs more frequently than b.venueId, so a should appear before b in the sorted array.
            If the subtraction result is zero, it means that both a.venueId and b.venueId occur the same number of times, so their relative order remains unchanged.
            */
            combinedArray.sort((a, b) => venueIdCounts[b.venueId] - venueIdCounts[a.venueId]);

            //This method iterates through the array and keeps only the first occurrence of each venueId.
            const uniqueArray = combinedArray.filter((item, index) => {
                return combinedArray.findIndex(i => i.venueId === item.venueId) === index;
            });
            setPosts(uniqueArray);


        } catch (error) {
            console.log('Error updating user preferences:', error);
        }
    };

    const getVenueData = async (fieldName, fieldValue, fieldtype) => {
        try {
            const venueCollectionRef = collection(FIRESTORE_DB, 'venues');

            // Create a base query to fetch documents with matching region
            let baseQuery = query(venueCollectionRef, where(fieldName, '==', fieldValue));

            // Execute the base query and get the collection snapshot
            const baseQuerySnapshot = await getDocs(baseQuery);

            let querySnapshot;

            if (fieldtype === 'array') {
                // For array fields like beerProfile and favBeer
                querySnapshot = await getDocs(query(venueCollectionRef, where(fieldName, 'array-contains-any', fieldValue), where('isActivated', "==", true)));
            } else {
                // For single value fields like region 
                querySnapshot = await getDocs(query(venueCollectionRef, where(fieldName, '==', fieldValue), where('isActivated', "==", true)));
            }
            const venueData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                venueData.push({ venueId: doc.id, ...data }); // Include the venueId
            });
            return venueData;

        } catch (error) {
            console.log('Error getting venue data from Firestore:', error);
        }
    };

    // ------------------------- Cindy changes To here----------------

    return (
        <SafeAreaView style={{ backgroundColor: "#eee", flex: 1 }}>
            <View style={{ backgroundColor: 'white', padding: 5 }}>

                {user && queryRole == "businessUser" ?
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -10 }}>
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
                    </>}

                <View style={{ flexDirection: 'row' }}>
                    <LottieView style={styles.logo} source={require('../../assets/beer-logo.json')}
                        autoPlay
                        speed={0.5}
                    />
                    <View style={{ width: '85%' }}>
                        <Searchbar
                            placeholder="Search for venue..."
                            ref={search => this.search = search}
                            onChangeText={handleSearchInput}
                            value={searchString}
                            lightTheme={true}
                            round={true}
                            containerStyle={{ backgroundColor: 'beige' }}
                        />
                    </View>

                </View>
                <View>
                    {suggestion.length > 0 && searchString !== ""
                        && <View style={{
                            alignItems: 'center',
                            zIndex: 15,
                            elevation: (Platform.OS === 'android') ? 50 : 0,
                        }}>
                            {
                                suggestion.map((suggestionVenue, index) => {
                                    return (
                                        <TouchableOpacity
                                            style={{ backgroundColor: "white", borderColor: "#CECECE", borderWidth: 1, width: "95%", borderRadius: 5, }}
                                            onPress={() => navigation.navigate("VenueDetail", {
                                                name: suggestionVenue.data().name,
                                                image: suggestionVenue.data().image_url,
                                                price: suggestionVenue.data().price,
                                                reviews: suggestionVenue.data().reviews,
                                                rating: suggestionVenue.data().rating,
                                                categories: suggestionVenue.data().categories,
                                                caption: suggestionVenue.data().caption,
                                                operating_hour: suggestionVenue.data().operating_hour,
                                                location: suggestionVenue.data().location,
                                                venueId: suggestionVenue.id,
                                            })}
                                            key={index}
                                            activeOpacity={1}
                                        >
                                            <Text style={{ padding: 10, fontSize: 17 }} >
                                                {suggestionVenue.data().name}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                    }

                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} >

                <VenueItems venueData={posts.slice(0, visiblePosts)} navigation={navigation} manageable={false} />
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



        </SafeAreaView>
    )
}



const screenConfigs = [
    {
        name: 'Discovery Home',
        component: Home,
        options: {
            headerStyle: {
                backgroundColor: '#ffa31a',
            },
            headerTitleAlign: 'center',
            drawerIcon: ({ color }) => (
                <Ionicons name="md-home" size={17} color={color} />
            ),
        },
    },
    {
        name: 'Add New Venue',
        component: NewPostScreen,
        options: {
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: '#ffa31a',
            },
            drawerIcon: ({ color }) => (
                <Ionicons name="add-circle-outline" size={17} color={color} />
            ),
        },
    },
    {
        name: 'Manage Venue',
        component: ManagePost,
        options: {
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: '#ffa31a',
            },
            drawerIcon: ({ color }) => (
                <Ionicons name="cog-outline" size={17} color={color} />
            ),
        },
    },
];

const GuessscreenConfigs = [
    {
        name: 'Discovery Home',
        component: Home,
        options: {
            headerStyle: {
                backgroundColor: '#ffa31a',
            },
            headerTitleAlign: 'center',
            drawerIcon: ({ color }) => (
                <Ionicons name="md-home" size={17} color={color} />
            ),
        },
    },
];


// DiscoverScreen wrapped up inside navigation.js's NavigationContainer component
// Destructure way
export default function DiscoverScreen({ navigation }) {

    const [user, setUser] = useState(null);
    const [queryRole, setQueryRole] = useState(null);

    // get current user and user role from firebase
    useEffect(() =>
        onAuthStateChanged(FIREBASE_AUTH, async (user) => {
            if (user) {
                setUser(user);
                const q = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", user.uid), limit(1));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    setQueryRole(doc.data().role);
                });
            }
            else {
                setUser(null);
            }
        })
        , []);


    return (
        user && queryRole === "businessUser" ? (
            <Drawer.Navigator initialRouteName="Discovery Home" screenOptions={{
                headerShown: true,
                drawerActiveBackgroundColor: '#ffa31a',
                drawerActiveTintColor: '#fff',
                drawerInactiveTintColor: '#333',
                drawerLabelStyle: {
                    fontSize: 15,
                },
            }}>
                {screenConfigs.map((screenConfig) => (
                    <Drawer.Screen
                        key={screenConfig.name}
                        name={screenConfig.name}
                        component={screenConfig.component}
                        options={screenConfig.options}
                    />
                ))}
            </Drawer.Navigator>
        ) : (
            <Drawer.Navigator initialRouteName="Discovery Home" screenOptions={{
                headerShown: true,
                drawerActiveBackgroundColor: '#ffa31a',
                drawerActiveTintColor: '#fff',
                drawerInactiveTintColor: '#333',
                drawerLabelStyle: {
                    fontSize: 15,
                },
            }}>
                {GuessscreenConfigs.map((screenConfig) => (
                    <Drawer.Screen
                        key={screenConfig.name}
                        name={screenConfig.name}
                        component={screenConfig.component}
                        options={screenConfig.options}
                    />
                ))}
            </Drawer.Navigator>
        )
    );

}

const styles = StyleSheet.create({
    icon: {
        width: 30,
        height: 30,
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    logo: {
        width: 50,
        alignSelf: 'center',
        marginBottom: 30,
        height: 65,
        resizeMode: 'contain',
    },
    loadingIndicator: {
        alignItems: 'center',
        marginTop: 10,
    },
    loadMoreButton: {
        backgroundColor: '#ffa31a',
        paddingHorizontal: 20,
    },
    loadMoreButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
})