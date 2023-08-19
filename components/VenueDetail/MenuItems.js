import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TouchableHighlight, FlatList, TextInput, LogBox } from 'react-native'
import React, { useEffect, useState } from 'react';
import { Divider } from 'react-native-paper';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { SwipeListView } from 'react-native-swipe-list-view';
import ActionButton from 'react-native-action-button';
import EditMenuItemScreen from '../../navigation/screens/EditMenuItemScreen';
import EditExistingMenuItemScreen from '../NewPost/EditExistingMenuItemUploader';
import { useNavigation } from '@react-navigation/native';



export default function MenuItems(props) {

    // temperory workaround for the warning: VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality
    LogBox.ignoreAllLogs(true);

    const { venueId, manageable } = props.route.params;
    const [nestedData, setNestedData] = useState([]);
    const [editedItem, setEditedItem] = useState(null);

    const navigation = useNavigation();


    // retrieve all menuitems based on the selected venue
    useEffect(() => {
        setNestedData([]);
        const subCollectionRef = collection(doc(FIRESTORE_DB, 'venues', venueId), 'MenuItems');
        const unsubscribe = onSnapshot(subCollectionRef, (snapshot) => {
            const newData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setNestedData(newData);
        });
        return () => unsubscribe();
    }, [venueId]);

    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnLeft]}
                onPress={() => {
                    // edit item action here
                    editItem(data.item);
                }}>
                <FontAwesome5 name="edit" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnRight]}
                onPress={() => {
                    // delete item action here
                    deleteItem(data.item);

                }}>
                <FontAwesome5 name="trash" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );

    const editItem = (item) => {
        navigation.navigate('EditExistingMenuItemScreen', { venueId: venueId, itemData: item });
    };


    const deleteItem = async (item) => {
        try {
            if (!item.id) {
                console.error('Error deleting item: Item does not exists.');
                return;
            }
            // remove particular item from nestedData state
            const updatedData = nestedData.filter((d) => d.id !== item.id);
            setNestedData(updatedData);

            // delete item from usestate and update firebase
            const subCollectionRef = collection(FIRESTORE_DB, 'venues', venueId, 'MenuItems');
            onSnapshot(subCollectionRef, (snapshot) => {
                snapshot.forEach((doc) => {
                    if (doc.id === item.id) {
                        deleteDoc(doc.ref);
                    }
                });
            });
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const renderItem = (data, rowMap) => (
        <TouchableOpacity style={styles.rowFrontVisible}>
            <View style={styles.menuItemStyle}>
                <View style={{ width: 250, height: '100%', justifyContent: 'space-evenly' }}>
                    <Text style={styles.titleStyle}>{data.item.title}</Text>
                    <Text>{data.item.description}</Text>
                    <Text>{data.item.price}</Text>
                </View>
                <View>
                    <Image
                        source={{ uri: data.item.image }}
                        style={{
                            width: 100,
                            height: '100%',
                            borderRadius: 8,
                        }}
                    />
                </View>
            </View>
            <Divider width={0.5} orientation="vertical" style={{ marginHorizontal: 20 }} />
        </TouchableOpacity>
    );

    return (
        <>
            {manageable === true ?
                <View>
                    <SwipeListView
                        data={nestedData}
                        renderItem={renderItem}
                        renderHiddenItem={renderHiddenItem}
                        rightOpenValue={-150} // adjust here for provide more space for buttons
                    />
                </View>
                :
                <View style={{ marginLeft: 5 }}>
                    {nestedData.map((food, index) => (
                        <View key={index}>
                            <View style={styles.menuItemStyle}>
                                <FoodInfo food={food} />
                                <FoodImage food={food} />
                            </View>
                            <Divider
                                width={1.0}
                                orientation="vertical"
                                style={{
                                    marginHorizontal: 20
                                }} />
                        </View>
                    ))
                    }
                </View>
            }
        </>

    );
}


const FoodInfo = (props) => (
    <View style={{ width: 240, justifyContent: 'space-evenly' }}>
        <Text style={styles.titleStyle}>{props.food.title}</Text>
        <Text>{props.food.description}</Text>
        <Text>{props.food.price}</Text>
    </View>
)

const FoodImage = (props) => (
    <View>
        <Image
            source={{ uri: props.food.image }}
            style={{
                width: 100,
                height: 100,
                borderRadius: 8,
            }}
        />
    </View>
)

const Settings = (props) => (
    <View>
        <TouchableOpacity
            style={{
                marginLeft: 30,
                top: 30,
                right: -20,
                zIndex: 1,
                position: 'absolute',
                paddingVerticle: 9,
                borderRadius: 20,
            }}>
            <FontAwesome5 name={'cogs'} color={'orange'} size={30} />
        </TouchableOpacity>
    </View>
)


const styles = StyleSheet.create({
    menuItemStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    titleStyle: {
        fontSize: 17,
        fontWeight: "500"
    },
    container: {
        backgroundColor: '#f4f4f4',
        flex: 1,
    },
    backTextWhite: {
        color: '#FFF',
    },
    rowFront: {
        backgroundColor: '#FFF',
        borderRadius: 5,
        height: 60,
        margin: 5,
        marginBottom: 15,
        shadowColor: '#999',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    rowFrontVisible: {
        backgroundColor: '#FFF',
        borderRadius: 5,
        height: 90,
        padding: 8,
        marginBottom: 6,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        margin: 5,
        marginBottom: 15,
        borderRadius: 5,
    },
    backRightBtn: {
        alignItems: 'flex-end',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
        paddingRight: 17,
    },
    backRightBtnLeft: {
        backgroundColor: '#1f65ff',
        right: 75,
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    trash: {
        height: 25,
        width: 25,
        marginRight: 7,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#666',
    },
    details: {
        fontSize: 12,
        color: '#999',
    },
});