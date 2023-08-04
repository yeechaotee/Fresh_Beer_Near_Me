import React, { useEffect, useState } from 'react';
import { Button, FlatList, SafeAreaView } from 'react-native';
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
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { addDoc, collection, collectionGroup, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { TextInput } from 'react-native-paper';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {

    const [user, setUser] = useState(User);

    const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);

    const currUser = FIREBASE_AUTH.currentUser;

    if (currUser) {
        console.log('User email: ', currUser.email);
    }



    // const docRef = doc(FIRESTORE_DB, "users");
    // const docSnap = getDoc(docRef);

    // if (docSnap.exists()) {
    //     console.log("Document data:", docSnap.data());
    // } else {
    //     // docSnap.data() will be undefined in this case
    //     console.log("No such document!");
    // }

    // const getUsername = () => {
    //     const myuser = FIREBASE_AUTH.currentUser
    //     const unsubscribe = FIRESTORE_DB.collection('users')
    //         .where('owner_uid', '==', myuser.uid).limit(1).onSnapshot(
    //             snapshot => snapshot.docs.map(doc => {
    //                 setCurrentLoggedInUser({
    //                     username: doc.data().username,
    //                     profilePicture: doc.data().profile_picture,
    //                 })
    //             })
    //         )
    //     return unsubscribe;
    // }

    // useEffect(() => {
    //     getUsername() //get username of current loggon user
    // }, [])


    // useEffect(() => {
    //     const myuser = FIREBASE_AUTH.currentUser;
    //     const profileRef = collection(FIRESTORE_DB, 'users')
    //         .where('owner_uid', '==', myuser.uid).limit(1);  // get from DB profiles

    //     const unsubscribe = onSnapshot(profileRef, {
    //         next: (snapshot) => {
    //             console.log('UPDATED on Firebase users[] ');
    //             const profiles = [];
    //             snapshot.docs.forEach(doc => {
    //                 setCurrentLoggedInUser({
    //                     username: doc.data().username,
    //                     profilePicture: doc.data().profile_picture,
    //                 })
    //             });
    //             setProfiles(profiles);
    //         }
    //     });

    //     return () => unsubscribe();
    // }, []);

    useEffect(() => {
        onAuthStateChanged(FIREBASE_AUTH, (user) => {
            setUser(user);
        });
    }, []);

    const [profiles, setProfiles] = useState([]);
    const [profile, setProfile] = useState('');

    // -------Get current user username------
    // useEffect(() => {
    //     const profileRef = collection(FIRESTORE_DB, 'users');  // get from DB profiles

    //     const subscriber = onSnapshot(profileRef, {
    //         next: (snapshot) => {
    //             console.log('UPDATED on Firebase users[] ');
    //             const profiles = [];
    //             snapshot.docs.forEach(doc => {
    //                 console.log(doc.data());
    //                 profiles.push({
    //                     id: doc.id,
    //                     ...doc.data()
    //                 })
    //             });
    //             setProfiles(profiles);
    //         }
    //     });

    //     return () => subscriber();
    // }, []);


    // This is how to get all items under 'users' FIREBASE collection
    useEffect(() => {
        const profileRef = collectionGroup(FIRESTORE_DB, 'users');  // get from DB profiles
        const counter = 1;
        const subscriber = onSnapshot(profileRef, {
            next: (snapshot) => {
                console.log('UPDATED on Firebase users[] ');
                const profiles = [];
                snapshot.docs.forEach(doc => {
                    console.log(doc.data());
                    profiles.push({
                        id: doc.id,
                        ...doc.data()
                    })
                });
                setProfiles(profiles);
            }
        });

        return () => subscriber();
    }, []);

    const addToFirebase = async () => {
        console.log('ADD TO Firebase');

        const doc = await addDoc(collection(FIRESTORE_DB, 'profiles'),
            {
                title: profile,
                role: 'Admin',
            })

        // console.log('ProfileScreen.js -- ADD TO Firebase, doc: ', doc);
        // reset state
        setProfile('');
    }

    counter = 0;
    const renderProfile = ({ item }) => {
        counter++;
        return <Text>{counter}. User Email: {item.email}, username: {item.username}, profile_picture: {item.profile_picture}</Text>;
    };

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <TextInput style={styles.input} placeholder='Add to Firebase' onChangeText={(text) => setProfile(text)} value={profile} />
                <Button onPress={addToFirebase} title="Add to FIREBASE" />

            </View>
            <View style={{ width: 100, alignSelf: 'center', marginLeft: 20 }} >
                <Button onPress={() => FIREBASE_AUTH.signOut().then(
                    () => { navigation.navigate('GuessLogon') }
                ).catch(error => setUser({ errorMessage: error.message }))} title="Log Out" />
            </View>
            {profiles.length > 0 && (
                <View>
                    <FlatList nestedScrollEnabled
                        data={profiles}
                        renderItem={renderProfile}
                        keyExtractor={(profile) => profile.id} />
                </View>
            )}
            {/* <View>
                { profiles.map(profile => (
                    <Text key={profile.id}>{profile.title}</Text>
                ))}
            </View> */}


            <View style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                top: 400
            }}>
                <Text>
                    {/* Current Logon user: {user.displayName} */}
                    {console.log("User is: " + user)}
                </Text>

            </View>

        </View>



        // <TailwindProvider>
        //     <SafeAreaView className="bg-white flex-1 relative">
        //         {/* First Section */}
        //         {/* <View style={{ backgroundColor: 'white', padding: 10 }}>
        //             <HeaderTabs />
        //             <SearchBar />
        //             <Categories />
        //         </View> */}



        //         <View className="flex-row px-6 mt-8 items-center space-x-2">
        //             <View className="w-16 h-16 bg-black rounded-full items-center justify-center">
        //                 <Text className="text-[#00BCC9] text-3xl font-semibold">Go</Text>
        //             </View>

        //             <Text className="text-[#2A2B4B] text-3xl font-semibold">Beer Discovery</Text>
        //         </View>

        //         {/* Second Section */}
        //         <View className="px-6 mt-8 space-y-3">
        //             <Text className="text-[#3C6072] text-[42px]">We are</Text>
        //             <Text className="text-[#00BCC9] text-[38px] font-bold">
        //                 Fresh Beer Near Me
        //             </Text>

        //             {/* <Text className="text-[#3C6072] text-base">
        //                 Fresh Beer Near Me
        //             </Text> */}
        //         </View>



        //         {/* Circle Section */}
        //         <View className="w-[200px] h-[150px] bg-[#00BCC9] rounded-full absolute bottom-36 -right-36"></View>
        //         <View className="w-[200px] h-[200px] bg-[#E99265] rounded-full absolute -bottom-28 -left-36"></View>

        //         {/* Image container */}
        //         <View className="flex-1 relative items-center justify-center">
        //             <Animatable.Image
        //                 animation="fadeIn"
        //                 easing="ease-in-out"
        //                 source={DiscoveryImage}
        //                 className="w-full h-full object-cover mt-20"
        //             />

        //             <TouchableOpacity
        //                 onPress={() => FIREBASE_AUTH.signOut()}
        //                 className="absolute bottom-10 w-44 h-44 border-l-2 border-r-2 border-t-4 border-[#00BCC9] rounded-full items-center justify-center"
        //             >
        //                 <Animatable.View
        //                     animation={"pulse"}
        //                     easing="ease-in-out"
        //                     iterationCount={"infinite"}
        //                     className="w-40 h-40 items-center justify-center rounded-full bg-[#00BCC9]"
        //                 >
        //                     <Text className="text-gray-30 text-[20px] font-semibold">Log Out</Text>
        //                 </Animatable.View>
        //             </TouchableOpacity>
        //         </View>
        //     </SafeAreaView>
        // </TailwindProvider>
    )
}


const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 50,
    },
    form: {
        marginVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    }
})
