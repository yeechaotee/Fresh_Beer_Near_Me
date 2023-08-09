import React, { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, SafeAreaView } from 'react-native';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    TouchableOpacity
} from 'react-native';

// import { TailwindProvider } from 'tailwindcss-react-native';
// import { DiscoveryImage } from '../../assets';
// import * as Animatable from "react-native-animatable";
// import HeaderTabs from '../../components/home/HeaderTabs';
// import SearchBar from '../../components/home/SearchBar';
// import Categories from '../../components/home/Categories';
import { ScrollView } from 'react-native';
import VenueItems, { localRestaurants } from '../../components/home/VenueItems';
// import { Divider } from 'react-native-elements/dist/divider/Divider';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Searchbar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import AntDesign from 'react-native-vector-icons/AntDesign';
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
    //const [city, setCity] = useState("Singapore");

       // const [activeTab, setActiveTab] = useState("Delivery");
    const [posts, setPosts] = useState([]);

    const [user, setUser] = useState(null);
    const [queryRole, setQueryRole] = useState(null);

    const [searchString, setSearchString] = useState("");
    const [suggestion, setSuggestion] = useState([]);


    // render all venues data and setPosts
    useEffect(() => {
        setPosts([]);
        const querySnapshot = query(collection(FIRESTORE_DB, 'venues'), orderBy('createdAt', "desc"));
        const unsubcribe = onSnapshot(querySnapshot, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    console.log("New Venue", change.doc.data());
                    const venueData = change.doc.data();
                    const venueId = change.doc.id; // Get the document ID
                    console.log('New Venue ID: ', venueId);
                    // console.log("New Venue uid: ", change.id);
                    setPosts((prevVenues) => [...prevVenues, { venueId: venueId, ...venueData }])
                }
            })
        })
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
                setPosts([]);
            }
        })
        , []);


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

    const handleSearchInput = async (text) => {
        setSearchString(text);

        if (text !== "") {
            const q = query(collection(FIRESTORE_DB, 'venues'), where("name", ">=", searchString), where("name", "<=", searchString + '\uf8ff'), limit(2));
            // console.log("user id is:: " + user.uid);
            const querySnapshot = await getDocs(q);
            setSuggestion(querySnapshot.docs);
            console.log("suggestion length is: " + suggestion.length);
            // querySnapshot.forEach((doc) => {
            //     // doc.data() is never undefined for query doc snapshots
            //     setQueryRole(doc.data().role);
            //     // console.log(doc.id, " => ", doc.data());
            //     console.log(doc.id, " => User Role: ", doc.data().role);
            // });
        }
    };
    
    const getVenueDataFromFirestore = async (userRegion, userBeerProfile, userFavBeer) => {
    try {
        const venueCollectionRef = collection(FIRESTORE_DB, 'venues');
        
        // Create a base query to fetch documents with matching region
        let baseQuery = query(venueCollectionRef, where('region', '==', userRegion));

        // Execute the base query and get the collection snapshot
        const baseQuerySnapshot = await getDocs(baseQuery);

        // Create a query for beerprofile equal to "Crisp"
        const beerProfileQuery = query(venueCollectionRef, where('beerProfile', 'array-contains-any', userBeerProfile));

        // Execute the beerProfileQuery and get the collection snapshot
        const beerProfileQuerySnapshot = await getDocs(beerProfileQuery);

        // Create a query for favorite beers containing any of the user's favorite beers
        const favBeerQuery = query(venueCollectionRef, where('favBeer', 'array-contains-any', userFavBeer));

        // Execute the favBeerQuery and get the collection snapshot
        const favBeerQuerySnapshot = await getDocs(favBeerQuery);

        // Merge the results from different queries
        const combinedQuerySnapshot = mergeQuerySnapshots([
            baseQuerySnapshot,
            beerProfileQuerySnapshot,
            favBeerQuerySnapshot
        ]);

        const venueData = [];
        combinedQuerySnapshot.forEach((doc) => {
            const data = doc.data();
            venueData.push(data);
        });

        console.log('Fetched venue data:', venueData);

        setVenueData(venueData);
    } catch (error) {
        console.log('Error getting venue data from Firestore:', error);
    }
};

// Helper function to merge query snapshots
 const mergeQuerySnapshots = (snapshots) => {
        const mergedDocs = [];
        const mergedDocIds = new Set(); // Keep track of already added document IDs
        
        snapshots.forEach((snapshot) => {
            snapshot.forEach((doc) => {
                const docId = doc.id;
                if (!mergedDocIds.has(docId)) {
                    mergedDocs.push(doc);
                    mergedDocIds.add(docId);
                }
            });
        });
        return mergedDocs;
    };
        
    useEffect(() => {
    //getVenueFromYelp();
    
    getCurrentUserDoc().then((result) => {
    if (result) {
      const { docId, docData } = result;
      console.log('Current user document ID:', docId);
      console.log('Current user document data:', docData);

       // Compare the "region" field from the current user's document with each venue's "region" field in venueData
      const userRegion = docData.region;
      console.log('User in region:', userRegion);

      const userBeerProfile = docData.beerProfile;
      console.log('User beer profile:', userBeerProfile);

      const userFavBeer = docData.favBeer;
      console.log('User fav beer:', userFavBeer);

      getVenueDataFromFirestore(userRegion,userBeerProfile, userFavBeer); // Call the function to fetch data from Firestore
      //setVenueData(venueData);
      // Update the state with the filtered venue data
      //setVenueData(filteredVenueData); 
    }
  });
    }, []);

  
    const getCurrentUserDoc = async () => {
  try {
    
    const userCollectionRef = collection(FIRESTORE_DB, 'users');

    // Get the current user from Firebase Authentication
    const user = FIREBASE_AUTH.currentUser;

    // Check if there is a current user
    if (!user) {
      console.log('No authenticated user.');
      return null;
    }

    console.log('My UserID:', user.uid);

    // Create a query to fetch the documents in the user's collection (should be only one document)
    const q = query(userCollectionRef, where('owner_uid', '==', user.uid));

    // Execute the query and get the query snapshot
    const querySnapshot = await getDocs(q);

    // Check if there is a document in the user's collection
    if (!querySnapshot.empty) {
      // Get the first document from the query snapshot
      const userDoc = querySnapshot.docs[0];
      // Get the docID of the user's document
      const docId = userDoc.id;

      // Get the data from the user's document
      const docData = userDoc.data();

      // Return both the document ID and data as an object
      return { docId, docData };
    } else {
      console.log('User document not found.');
      return null;
    }
  } catch (error) {
    console.log('Error getting current user document ID:', error);
    return null;
  }
};

    return (
        <SafeAreaView style={{ backgroundColor: "#eee", flex: 1 }}>
            <View style={{ backgroundColor: 'white', padding: 5 }}>
                {/* <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}

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

                {/* <SearchBar cityHandler={setCity} /> */}

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

            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                {/* <Categories /> */}

                {/* posts state will filter out only searched result if any and pass it to venueData */}
                <VenueItems venueData={posts} navigation={navigation} manageable={false} />
            </ScrollView>
            {/* <Divider width={1} /> */}

        </SafeAreaView>
    )
}


// DiscoverScreen wrapped up inside navigation.js's NavigationContainer component
// Destructure way
export default function DiscoverScreen({ navigation }) {
    return (
        <Drawer.Navigator initialRouteName="Social Home" screenOptions={{
            headerShown: true,
            drawerActiveBackgroundColor: '#ffa31a',
            drawerActiveTintColor: '#fff',
            drawerInactiveTintColor: '#333',
            drawerLabelStyle: {
                fontSize: 15,
            }
        }}>
            <Drawer.Screen
                name="Discovery Home"
                component={Home}
                options={{
                    headerStyle: {
                        backgroundColor: '#ffa31a',
                    },
                    headerTitleAlign: "center",
                }}
            />
            <Drawer.Screen name="Add New Venue" component={NewPostScreen} options={{
                headerTitleAlign: "center",
                headerStyle: {
                    backgroundColor: '#ffa31a',
                },
                drawerIcon: ({ color }) => {
                    <Ionicons name="md-home" size={12} />
                }
            }} />
            <Drawer.Screen name="Manage Venue" component={ManagePost} options={{
                headerTitleAlign: "center",
                headerStyle: {
                    backgroundColor: '#ffa31a',
                },
                drawerIcon: ({ color }) => {
                    <Ionicons name="setting-outline" size={12} color={color} />
                }
            }} />
        </Drawer.Navigator>
    );

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