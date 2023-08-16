import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, TextInput } from 'react-native';
import { collection, query, where, getDocs, limit, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase";
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from 'react-native-vector-icons';


const GetNewsFeed = () => {

    const [newsFeedData, setNewsFeedData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null); // To store the selected item for editing
    const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility


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
                            precisecreateTime: doc.data().createTime,
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
        setSelectedItem(item); // Set the selected item for editing
        setIsModalVisible(true); // Open the modal
    };

    const [user, setUser] = useState(null);

    const closeModal = async () => {
    if (selectedItem) {
        try {
            // Update the values in Firebase
            const newsRef = collection(FIRESTORE_DB, 'newsfeed');
            const querySnapshot = await getDocs(query(newsRef, where('creater', '==', selectedItem.creater), where('createTime', '==', selectedItem.precisecreateTime)));

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await updateDoc(docRef, {
                    title: selectedItem.title,
                    // Update other fields as needed
                });
            }
            // Close the modal and clear the selected item
            setIsModalVisible(false);
            setSelectedItem(null);

            // Refresh the news feed after updating
            fetchNewsFeed();

        } catch (error) {
            console.error('Error updating data:', error);
        }
    } else {
        setIsModalVisible(false);
    }
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
                <FontAwesome5 name="edit" size={20} color="black" />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>

);

return (
    <View style={styles.container}>
        {/* FlatList */}
        <FlatList
            data={newsFeedData}
            renderItem={renderNewsFeedItem}
            keyExtractor={(item) => item.id}
        />

        {/* Modal */}
        <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalContainer}>
                {selectedItem && (
                    <View style={styles.modalContent}>
                        {/* Display editable fields */}
                        <TextInput
                            style={styles.input}
                            value={selectedItem.title}
                            onChangeText={(text) =>
                                setSelectedItem((prevItem) => ({ ...prevItem, title: text }))
                            }
                        />
                        {/* ... Other editable fields */}
                        <TouchableOpacity onPress={closeModal}>
                            <Text>Close Modal</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    </View>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    newsFeedItem: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        marginVertical: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default GetNewsFeed;
