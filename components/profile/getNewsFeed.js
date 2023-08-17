import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, TextInput, Button, KeyboardAvoidingView } from 'react-native';
import { collection, query, where, getDocs, limit, updateDoc, orderBy } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase";
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from 'react-native-vector-icons';
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { WebView } from 'react-native-webview';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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

                        console.log("my desc is", doc.data().numberOfPeople);
                        return {
                            id: doc.id,
                            ...doc.data(),
                            createTime: doc.data().createTime.toDate().toDateString(),
                            precisecreateTime: doc.data().createTime,
                            profile_picture: profilePicture, // Include the user's profile picture
                            userRole: userData.role,
                            description: doc.data().description,
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
        // Close the modal and clear the selected item
        setIsModalVisible(false);
        setSelectedItem(null);
    };
    const saveModal = async () => {
        if (selectedItem) {
            try {
                // Update the values in Firebase
                const newsRef = collection(FIRESTORE_DB, 'newsfeed');
                const querySnapshot = await getDocs(query(newsRef, where('creater', '==', selectedItem.creater), where('createTime', '==', selectedItem.precisecreateTime), orderBy("createTime", "desc")));

                if (!querySnapshot.empty) {
                    const docRef = querySnapshot.docs[0].ref;
                    await updateDoc(docRef, {
                        title: selectedItem.title,
                        numberOfPeople: numberOfPeople,
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

    // Mock data for testing
    const mockData = [
        {
            id: '1',
            creater: 'testuser@example.com',
            title: 'Mock Feed 1',
            createTime: new Date().toString(),
            profile_picture: 'mock_profile_picture_url',
            userRole: 'user',
        },
        {
            id: '2',
            creater: 'testuser@example.com',
            title: 'Mock Feed 2',
            createTime: new Date().toString(),
            profile_picture: 'mock_profile_picture_url',
            userRole: 'user',
        },
        // Add more mock data as needed
    ];

    /*
    useEffect(() => {
        // Use the mock data as the initial state
        setNewsFeedData(mockData);
    }, []); // Empty dependency array ensures this effect runs only once on component mount
    */
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
                <Text style={styles.rowMessage}>
                    {item.description?.replace(/<\/?[^>]+(>|$)/g, "") ?? ""}
                </Text>

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


    const [numberOfPeople, setNumberOfPeople] = React.useState(null);


    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null); // New state for selected date

    const showDatePicker = () => {
        console.log('showDatePicker function called');
        setDatePickerVisible(true);
        console.log('isDatePickerVisible:', isDatePickerVisible);
    };

    const handleDateChange = (event, selected) => {
        if (selected) {
            setSelectedDate(selected);
            setDatePickerVisible(false); // Hide the DatePicker
        } else {
            setDatePickerVisible(false); // Hide the DatePicker if the user cancels
        }
    };


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
                            <Text style={styles.title}>Edit</Text>

                            <View style={styles.inputRow}>
                                <Text style={styles.label}>Title:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={selectedItem.title}
                                    onChangeText={(text) =>
                                        setSelectedItem((prevItem) => ({ ...prevItem, title: text }))
                                    }
                                />
                            </View>
                            {isDatePickerVisible && (
                                <DateTimePicker
                                    value={selectedDate || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) {
                                            setSelectedDate(selectedDate); // Set the selected date
                                            setUserData({ ...prevItem, startDateTime: selectedDate.toISOString() });
                                        }
                                        setDatePickerVisible(false); // Hide the date picker
                                    }}
                                />
                            )}
                            {/* Start Date */}
                            <TouchableOpacity onPress={() => showDatePicker}>
                                <View style={styles.inputRow}>
                                    <FontAwesome style={{ marginRight: 10 }} name="calendar" color="#333333" size={20} />
                                    <TextInput
                                        placeholder="start date"
                                        placeholderTextColor="#666666"
                                        editable={false}
                                        value={
                                            selectedDate
                                                ? selectedDate.toDateString()
                                                : selectedItem.startDateTime
                                                    ? new Date(selectedItem.startDateTime).toDateString()
                                                    : ''
                                        }
                                        style={styles.input}
                                    />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.inputRow}>
                                <Text style={styles.label}>No. of people participating:</Text>
                                <TextInput
                                    value={selectedItem.numberOfPeople}
                                    style={styles.input}
                                    placeholder="number"
                                    keyboardType="numeric"
                                    onChangeText={(text) => setNumberOfPeople(text)}
                                />
                            </View>


                            {/* ... Other editable fields */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.buttonLeft} onPress={saveModal}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonRight} onPress={closeModal}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
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
    modalContent: {
        backgroundColor: 'white', // Set the background color to white
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        marginRight: 10,
    },
    buttonContainer: {
        flexDirection: 'row', // Arrange children in a row
        justifyContent: 'space-between', // Space between the two buttons
        marginTop: 20, // Adjust this value as needed
    },
    button: {
        backgroundColor: 'blue', // Customize button styles as needed
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonLeft: {
        backgroundColor: 'blue', // Customize button styles as needed
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'flex-start', // Align button to the far left
    },
    buttonRight: {
        backgroundColor: 'red', // Customize button styles as needed
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'flex-end', // Align button to the far right
    },
    buttonText: {
        color: 'white', // Customize text color as needed
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1, // Add an outline border
        borderColor: 'gray', // Set the border color
        borderRadius: 5, // Optional: Add border radius
        padding: 10, // Optional: Add padding
        fontSize: 16, // Optional: Adjust font size

    },

});

export default GetNewsFeed;
