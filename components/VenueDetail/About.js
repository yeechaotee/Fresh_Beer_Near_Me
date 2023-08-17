import { View, Text, Image, TouchableOpacity, Switch } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { addDoc, collection, onSnapshot, setDoc, doc, collectionGroup, firestore, updateDoc, get } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
// import ActionButton from 'react-native-action-button';

const yelpVenueInfo = {
    name: 'Farmhouse kitchen Thai Cuisine',
    image: 'https://www.peninsula.com/-/media/images/bangkok/new/dining/thiptara/pbk-thiptara-3-1074.jpg?mw=987&hash=107E6AA78B323EAA3D17282F3AEC88D5',
    price: '$$',
    reviews: '1500',
    rating: '4.5',
    categories: [
        { title: 'Thai' },
        { title: 'Comfort Food' },
        { title: 'Coffee' },
    ],
};



export default function About(props) {
    //props.route.params is the object contains all these info from route
    const { name, image, price, reviews, rating, categories, caption, manageable, operating_hour, location, venueId, isActivated } = props.route.params;

    const formattedCategories = categories.map((cat) => cat).join(" • ")

    const description = `${formattedCategories} ${price ? ' • ' + price : ''} •💲• ${rating} ⭐ (${reviews}+)`

    // for activation toggle button
    const [isActivatedState, setIsActivated] = useState(isActivated);

    console.log("isActivated :" + isActivated);
    console.log("isActivatedState :" + isActivatedState);

    // toggle activation handler function
    const toggleActivation = async () => {
        console.log('Toggle pressed');
        try {
            


            const venueDocRef = doc(FIRESTORE_DB, 'venues', venueId);
            const modifiedDate = new Date().toISOString();

            const updatedData = {
                isActivated: !isActivatedState,
                modifiedDate: modifiedDate,
            };

            await updateDoc(venueDocRef, updatedData);

            setIsActivated(!isActivatedState);
            console.log("after isActivatedState" + isActivatedState);

            console.log('Venue activation toggled successfully');
        } catch (error) {
            console.error('Toggle activation error:', error);
        }

    };

    // const toggleActivation = async () => {
    //     try {
    //         const venueDocRef = doc(firestore(), 'venues', venueId);

    //         const venueData = await venueDocRef.get();

    //         // const updatedIsActivated = !venueData.data().isActivated;
    //         const updatedIsActivated = (venueData?.isActivatedState !== undefined || '') ? !venueData.isActivatedState : true;

    //         const modifiedDate = new Date().toISOString();

    //         const updatedData = {
    //             isActivated: updatedIsActivated,
    //             modifiedDate: modifiedDate,
    //         };

    //         await updateDoc(venueDocRef, updatedData);

    //         setIsActivated(updatedIsActivated);

    //         console.log('Venue activation toggled successfully');
    //     } catch (error) {
    //         console.error('Toggle activation error:', error);
    //     }
    // };

    const navigation = useNavigation();

    return (
        <View>
            <TouchableOpacity onPress={() => navigation.goBack()}
                style={{
                    marginLeft: 10,
                    top: 30,
                    left: 5,
                    zIndex: 1,
                    position: 'absolute',
                    paddingVerticle: 9,
                    borderRadius: 20,
                }}>
                {/* <Text style={{ fontSize: 17, color: '#fff' }}>◀Back</Text> */}
                <FontAwesome5 name={'arrow-alt-circle-left'} color={'#fff'} size={30} />
            </TouchableOpacity>
            {manageable &&
                <>
                    {/* Manage current Venue button */}
                    <TouchableOpacity onPress={() => navigation.push('EditVenueScreen', {
                        venueId: venueId,
                        name: name,
                        image: image,
                        price: price,
                        reviews: reviews,
                        rating: rating,
                        categories: categories,
                        caption: caption,
                        operating_hour: operating_hour,
                        location: location,
                        manageable: manageable,
                    })}
                        style={{
                            marginLeft: 20,
                            top: 30,
                            right: 5,
                            zIndex: 1,
                            position: 'absolute',
                            paddingVerticle: 9,
                            borderRadius: 20,
                        }}>
                        <FontAwesome5 name={'cogs'} color={'orange'} size={30} />
                    </TouchableOpacity>

                    {/* Add New Menu Item button */}
                    <TouchableOpacity onPress={() => navigation.push('EditMenuItemScreen', {
                        venueId: venueId,
                    })}
                        style={{
                            marginLeft: 20,
                            top: 70,
                            right: 8,
                            zIndex: 1,
                            position: 'absolute',
                            paddingVerticle: 9,
                            borderRadius: 20,
                        }}>
                        {/* <Text style={{ fontSize: 17, color: '#fff' }}>◀Back</Text> */}
                        <FontAwesome5 name={'plus-circle'} color={'orange'} size={30} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={toggleActivation}
                        style={{
                            marginLeft: 20,
                            top: 110,
                            right: 8,
                            zIndex: 1,
                            position: 'absolute',
                            paddingVertical: 9,
                            borderRadius: 20,
                        }}>
                        <FontAwesome5 name={isActivatedState ? 'toggle-on' : 'toggle-off'} color={'orange'} size={30} />
                    </TouchableOpacity>

                    {/* <View
                        style={{
                            alignItems: 'center',
                            marginTop: 110,
                        }}>
                        <Switch value={isActivated} onValueChange={toggleActivation} />
                    </View> */}

                    {/* <ActionButton
                        buttonColor='orange'
                        style={{
                            marginLeft: 20,
                            top: 20,
                            right: 5,
                            zIndex: 1,
                            position: 'absolute',
                            paddingVerticle: 9,
                            borderRadius: 20,
                        }}
                        onPress={() => navigation.push('EditMenuItemScreen', {
                            venueId: venueId,
                        })} /> */}
                </>
            }

            <VenueImage image={image} />

            <VenueName name={name} />
            <VenueCaption caption={caption} operating_hour={operating_hour} location={location} />

            {/* <VenueDescription description={description} /> */}
        </View>
    );
}

const VenueImage = (props) => (
    <Image source={{ uri: props.image }} style={{ width: "100%", height: 180 }} />
)

const VenueName = (props) => (
    <>
        <Text
            style={{
                fontSize: 29,
                fontWeight: "600",
                marginTop: 10,
                marginHorizontal: 15,
            }}>{[props.name]}</Text>

    </>
)

const VenueCaption = (props) => (
    <>
        <Text
            style={{
                fontSize: 15.5,
                fontWeight: "400",
                marginTop: 10,
                marginHorizontal: 15,
            }}>{[props.caption]}</Text>
        <Text
            style={{
                fontSize: 15,
                fontWeight: "500",
                marginTop: 10,
                marginHorizontal: 15,
            }}>Operating Hour: {[props.operating_hour]}</Text>
        <Text
            style={{
                fontSize: 15,
                fontWeight: "500",
                marginTop: 10,
                marginHorizontal: 15,
            }}>Located at: {[props.location]}</Text>
    </>
)

// const VenueDescription = (props) => (
//     <Text
//         style={{
//             fontSize: 15.5,
//             fontWeight: "400",
//             marginTop: 10,
//             marginHorizontal: 15,
//         }}>{[props.description]}</Text>
// )