import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase";
import EditNewsFeedItemScreen from '../profile/editNewsFeed';
import { useNavigation } from '@react-navigation/native';


const GetNewsFeed = () => {

    const [newsFeedData, setNewsFeedData] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        async function fetchNewsFeed() {
            const feedsRef = collection(FIRESTORE_DB, 'newsfeed');

            const q = query(feedsRef, where('creater', '==', FIREBASE_AUTH.currentUser.email));

            const querySnapshot = await getDocs(q);

            const newsFeedItemsPromises = querySnapshot.docs.map(async (doc) => {
                const data = doc.data();

                if (doc.data().creater) {
                    const userRef = collection(FIRESTORE_DB, "users");

                    const userQuerySnapshot = await getDocs(
                        query(userRef, where("email", "==", doc.data().creater), limit(1))
                    );


                    if (!userQuerySnapshot.empty) {
                        const userDoc = userQuerySnapshot.docs[0];
                        const userData = userDoc.data();
                        const profilePicture = userData.profile_picture;

                        return {
                            id: doc.id,
                            ...doc.data(),
                            createTime: doc.data().createTime.toDate().toDateString(),
                            profile_picture: profilePicture, // Include the user's profile picture
                            userRole: userData.role,
                        };
                    }
                }
                return null; // Return null for cases where data isn't available
            });

            const newsFeedItems = await Promise.all(newsFeedItemsPromises);
            setNewsFeedData(newsFeedItems.filter(feed => feed !== null));
        }

        fetchNewsFeed();
    }, []);

    const handleEditPress = (item) => {
        // Navigate to EditNewsFeedItemScreen.js when "Edit" is pressed
        navigation.navigate('EditNewsFeed', { item });
    };

    const renderNewsFeedItem = ({ item }) => (


        <TouchableOpacity style={styles.newsFeedItem}>
            {/* Render individual news feed item */}

            <View>
                <View style={styles.rowHeader}>
                    <View style={styles.rowIcon} >
                        {
                            //item.avatar ? <Image source={{ uri: item.avatar }} style={{ width: 100, height: 100 }} /> : <></>
                            <Image
                                style={{ width: 50, height: 50, borderRadius: 15, marginTop: -3 }}
                                source={{ uri: item.profile_picture }}
                            />
                        }
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowHead}>{item.creater}</Text>
                        <Text style={styles.rowText}>{item.createTime}</Text>
                    </View>
                </View>
                <View style={styles.rowContent}>
                    {
                        <Text style={{ ...styles.rowText, marginRight: 5 }}>{item.title}</Text>
                    }
                    {
                        item.startDateTime && item.endDatTime ?
                            item.type ? <Text style={{ ...styles.rowText, marginRight: 5 }}>Type: Promotion</Text> : <Text style={styles.rowText}>Type: Event</Text>
                            : <></>
                    }
                    {
                        item.startDateTime ? <Text style={{ ...styles.rowText, marginRight: 5 }}>Start Date: {item.startDateTime}</Text> : <></>
                    }
                    {
                        item.endDatTime ? <Text style={styles.rowText}>End Date: {item.endDatTime}</Text> : <></>
                    }
                    {
                        item.numberOfPeople && item.numberOfPeople !== "" && item.numberOfPeople !== "0" ? <Text style={styles.rowText}>Number of people participating: {item.numberOfPeople}</Text> : <></>
                    }

                </View>
                <Text style={styles.rowMessage}>{item.description.replace(/<\/?[^>]+(>|$)/g, "")}</Text>
                {
                    item.image ? <Image source={{ uri: item.image }} style={{ width: 250, height: 250 }} /> : <></>
                }
                <View style={styles.rowContainer}>
                    <View style={styles.rowContainer}>
                        {
                            !item.userRole ? <>
                                <FontAwesome5
                                    name={'heart'}
                                    size={20}
                                    color={'black'}
                                />
                                <FontAwesome5
                                    name={'comment'}
                                    size={20}
                                    color={'black'}
                                    style={{ paddingLeft: 10 }}
                                />
                            </> : <></>
                        }
                    </View>
                </View>
            </View>
            <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => handleEditPress(item)}>
                    <Text>Edit</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>

    );

    return (
        <View style={styles.container}>
            <FlatList
                data={newsFeedData}
                renderItem={renderNewsFeedItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    newsFeedItem: {
        // Style your news feed item here
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        marginVertical: 5,
    },
});

export default GetNewsFeed;
