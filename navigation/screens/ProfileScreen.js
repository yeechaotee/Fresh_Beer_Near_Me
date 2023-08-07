
import React, { useState, useEffect, useContext } from 'react';

import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
// import FormButton from '../components/FormButton';
import { AuthContext } from '../AuthProvider/AuthProvider';


import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where } from 'firebase/firestore';
// import PostCard from '../components/PostCard';


const ProfileScreen = ({ navigation, route }) => {
    // const { user, logout } = useContext(AuthContext);
    // const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleted, setDeleted] = useState(false);
    // const [userData, setUserData] = useState(null);



    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

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
                    setUserProfile(doc.data());
                    // console.log(doc.id, " => ", doc.data());
                    console.log(doc.id, " => User Role: ", doc.data().role);
                });
                navigation.addListener("focus", () => setLoading(!loading));
            }
            else {
                setUser(null);
            }
        })
        , [navigation, loading]);


    // console.log("profile page userDATA is :"+userData)

    // const getUser = async () => {
    //     await firestore()
    //         .collection('users')
    //         .doc(user.uid)
    //         .get()
    //         .then((documentSnapshot) => {
    //             if (documentSnapshot.exists) {
    //                 console.log('User Data', documentSnapshot.data());
    //                 setUserData(documentSnapshot.data());
    //             }
    //         })
    // }

    // useEffect(() => {
    //     onAuthStateChanged(FIREBASE_AUTH, (user) => {
    //         setUser(user);
    //     });
    // }, []);

    // useEffect(() => {
    //     getUser();
    //     // fetchPosts();
    //     navigation.addListener("focus", () => setLoading(!loading));
    // }, [navigation, loading]);


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
                showsVerticalScrollIndicator={false}>
                <Image
                    style={styles.userImg}
                    source={{ uri: userProfile ? userProfile.profile_picture || 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg' : 'https://static.thenounproject.com/png/5034901-200.png' }}
                />
                {/* <Text style={styles.userName}>{userData ? userData.fname || 'Test' : 'Test'} {userData ? userData.lname || 'User' : 'User'}</Text> */}
                <Text style={styles.userName}>{userProfile ? userProfile.username || 'Undefine' : 'Undefine'}</Text>
                <Text style={styles.aboutUser}>{userProfile ? userProfile.email || 'Undefine' : 'Undefine'}</Text>
                {/* <Text style={styles.aboutUser}>
                    {userData ? userData.about || 'No details added.' : ''}
                </Text> */}

                <View style={styles.userBtnWrapper}>
                    {(
                        <>
                            <TouchableOpacity
                                style={styles.userBtn}
                                onPress={() => {
                                    navigation.navigate('EditProfile', { userId: user.uid });
                                }}>
                                <Text style={styles.userBtnTxt}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.userBtn} onPress={() => FIREBASE_AUTH.signOut().then(
                                () => { navigation.navigate('GuessLogon') }
                            ).catch(error => setUser({ errorMessage: error.message }))}>
                                <Text style={styles.userBtnTxt}>Logout</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.userInfoWrapper}>
                    <View style={styles.userInfoItem}>
                        {/* <Text style={styles.userInfoTitle}>{posts.length}</Text>
                        <Text style={styles.userInfoSubTitle}>Posts</Text> */}
                    </View>
                    {/* <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoTitle}>10,000</Text>
                        <Text style={styles.userInfoSubTitle}>Followers</Text>
                    </View>
                    <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoTitle}>100</Text>
                        <Text style={styles.userInfoSubTitle}>Following</Text>
                    </View> */}
                </View>

                {/* {posts.map((item) => (
          <PostCard key={item.id} item={item} onDelete={handleDelete} />
        ))} */}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    userImg: {
        height: 150,
        width: 150,
        borderRadius: 75,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },
    aboutUser: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    userBtnWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 10,
    },
    userBtn: {
        borderColor: '#2e64e5',
        borderWidth: 2,
        borderRadius: 3,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 5,
    },
    userBtnTxt: {
        color: '#2e64e5',
    },
    userInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginVertical: 20,
    },
    userInfoItem: {
        justifyContent: 'center',
    },
    userInfoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    userInfoSubTitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

