import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TouchableHighlight, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react';
import { Divider } from 'react-native-paper';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { SwipeListView } from 'react-native-swipe-list-view';
import ActionButton from 'react-native-action-button';
import EditMenuItemScreen from '../../navigation/screens/EditMenuItemScreen';
import { useNavigation } from '@react-navigation/native';

// hardcoded for testing purpose only
const foods = [
    {
        title: "Lasagna",
        description: "With butter lettuce, tomato and sauce bechamel",
        price: "$13.50",
        image:
            "https://www.modernhoney.com/wp-content/uploads/2019/08/Classic-Lasagna-14-scaled.jpg",
    },
    {
        title: "Tandoori Chicken",
        description:
            "Amazing Indian dish with tenderloin chicken off the sizzles 🔥",
        price: "$19.20",
        image: "https://i.ytimg.com/vi/BKxGodX9NGg/maxresdefault.jpg",
    },
    {
        title: "Chilaquiles",
        description:
            "Chilaquiles with cheese and sauce. A delicious mexican dish 🇲🇽",
        price: "$14.50",
        image:
            "https://i2.wp.com/chilipeppermadness.com/wp-content/uploads/2020/11/Chilaquales-Recipe-Chilaquiles-Rojos-1.jpg",
    },
    {
        title: "Chicken Caesar Salad",
        description:
            "One can never go wrong with a chicken caesar salad. Healthy option with greens and proteins!",
        price: "$21.50",
        image:
            "https://images.themodernproper.com/billowy-turkey/production/posts/2019/Easy-italian-salad-recipe-10.jpg?w=1200&h=1200&q=82&fm=jpg&fit=crop&fp-x=0.5&fp-y=0.5&dm=1614096227&s=c0f63a30cef3334d97f9ecad14be51da",
    },
    {
        title: "Lasagna",
        description: "With butter lettuce, tomato and sauce bechamel",
        price: "$13.50",
        image:
            "https://thestayathomechef.com/wp-content/uploads/2017/08/Most-Amazing-Lasagna-2-e1574792735811.jpg",
    },
];



export default function MenuItems(props) {

    const { name, image, price, reviews, rating, categories, caption, manageable, operating_hour, location, venueId } = props.route.params;

    const [menuItems, setMenuItems] = useState([]);

    const navigation = useNavigation();

    // get Menu Items based on itemId of venues
    const [nestedData, setNestedData] = useState([]);

    // Read and retrieve Sub-collection MenuItems based on current selected Venue from firebase
    useEffect(() => {
        // console.log("venueId of this venue ===> " + venueId);
        setNestedData([]);
        const parentCollectionRef = doc(FIRESTORE_DB, 'venues', venueId);

        const subCollectionRef = collection(parentCollectionRef, 'MenuItems');

        const unsubcribe = onSnapshot(subCollectionRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                // console.log("Menu Items ===> ", change.doc.data());
                const data = change.doc.data();
                setNestedData((prevData) => [...prevData, { ...data }]);
            });
        })
        return () => unsubcribe();
    }, []);

    const VisibleItem = (props) => {
        const { data } = props;
        return (
            <TouchableHighlight style={styles.rowFrontVisible} >
                <View style={styles.menuItemStyle}>
                    <View style={{ width: 240, justifyContent: 'space-evenly' }}>
                        <Text style={styles.titleStyle}>{data.item.title}</Text>
                        <Text>{data.item.description}</Text>
                        <Text>{data.item.price}</Text>
                    </View>
                    <View>
                        <Image
                            source={{ uri: data.item.image }}
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: 8,
                            }}
                        />
                    </View>
                </View>
                <Divider
                    width={0.5}
                    orientation="vertical"
                    style={{
                        marginHorizontal: 20
                    }} />
            </TouchableHighlight>
        )
    }

    // const closeRow = (rowMap, rowKey) => {
    //     if (rowMap[rowKey]) {
    //         rowMap[rowKey].closeRow();
    //     }
    // };

    // const deleteRow = (rowMap, rowKey) => {
    //     closeRow(rowMap, rowKey);
    //     const newData = [...listData];
    //     const prevIndex = listData.findIndex(item => item.key === rowKey);
    //     newData.splice(prevIndex, 1);
    //     setListData(newData);
    // };

    const renderItem = (data, rowMap) => {
        return (
            <VisibleItem data={data} />
        );
    };

    const renderHiddenItem = (data, rowMap) => {
        // return (
        //     <HiddenItemWithActions
        //         data={data}
        //         rowMap={rowMap}
        //         closeRow={() => closeRow(rowMap, data.item.key)}
        //         deleteRow={() => deleteRow(rowMap, data.item.key)}
        //     />
        // );
    };

    // const [listData, setListData] = useState(
    //     nestedData.map((food, index) => ({
    //         key: `${index}`,
    //         title: food.title,
    //         description: food.description,
    //         price: food.price,
    //         image: food.image,
    //     })),
    // );

    // const [listData, setListData] = useState([]);

    // useEffect(() => {
    //     // This useEffect hook will run whenever nestedData changes
    //     // Update listData based on the new nestedData

    //     const updatedListData = nestedData.map((food, index) => ({
    //         key: `${index}`,
    //         title: food.title,
    //         description: food.description,
    //         price: food.price,
    //         image: food.image,
    //     }));

    //     setListData(updatedListData);
    // }, [nestedData]); // Watch for changes in nestedData

    // console.log(listData);

    const renderMenuItem = ({ item, index }) => (
        <View key={index}>
            <View style={styles.menuItemStyle}>
                <FoodInfo food={item} />
                <FoodImage food={item} />
            </View>
            <Divider
                width={0.5}
                orientation="vertical"
                style={{
                    marginHorizontal: 20
                }}
            />
        </View>
    );

    return (
        <>
            {manageable === true ?
                // <SwipeListView
                //     data={listData}
                //     renderItem={renderItem}
                //     renderHiddenItem={renderHiddenItem} />
                <View>
                    {/* <FlatList
                        data={nestedData}
                        renderItem={renderMenuItem}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                    /> */}
                    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={true} nestedScrollEnabled={true}>
                        {nestedData.map((food, index) => (
                            <View key={index}>
                                <View style={styles.menuItemStyle}>
                                    <FoodInfo food={food} />
                                    <FoodImage food={food} />
                                </View>
                                <Divider
                                    width={0.5}
                                    orientation="vertical"
                                    style={{
                                        marginHorizontal: 20
                                    }} />
                            </View>
                        ))
                        }


                    </ScrollView>
                    {/* <ActionButton
                        buttonColor='orange'
                        style={{ top: 10, position: 'absolute', right: 30, bottom: 30 }}
                        onPress={() => navigation.push('EditMenuItemScreen', {
                            venueId: venueId,
                        })}
                    /> */}

                </View>
                :
                <ScrollView showsVerticalScrollIndicator={false}>
                    {nestedData.map((food, index) => (
                        <View key={index}>
                            <View style={styles.menuItemStyle}>
                                <FoodInfo food={food} />
                                <FoodImage food={food} />
                            </View>
                            <Divider
                                width={0.5}
                                orientation="vertical"
                                style={{
                                    marginHorizontal: 20
                                }} />
                        </View>
                    ))
                    }
                </ScrollView>
            }
        </>
    )
}

// use 1 time {} is because outter is alr an object
// 1st {} is javascript, 2nd {} is object
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
        margin: 14,
    },
    titleStyle: {
        fontSize: 19,
        fontWeight: "600"
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
        height: 60,
        padding: 10,
        marginBottom: 15,
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