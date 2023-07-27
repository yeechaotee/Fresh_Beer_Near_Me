import { View, Text, TextInput, Image, Button } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as Yup from 'yup';
import { Formik, formik } from 'formik';
import { Divider } from 'react-native-elements';
import validUrl from 'valid-url'
import { addDoc, collection, onSnapshot, setDoc, doc, collectionGroup, firestore } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { ActivityIndicator } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { Picker } from '@react-native-picker/picker'


const PLACEHOLDER_IMG = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930";

const FormikPostUploader = ({ navigation }) => {

    const [loading, setLoading] = useState(false);
    const [selectedCat, setSelectedCat] = useState("Bar");

    const uploadPostSchema = Yup.object().shape({
        imageUrl: Yup.string().url().required('A URL is required'),
        caption: Yup.string().max(2200, 'Caption has reached the max characters (2200)'),
        resName: Yup.string().required('Restaurant Name is required.').max(255, 'Restaurant name has reached the max characters (255)'),
        priceRange: Yup.string().required('Price Range is required.').max(5, 'Kindly input between 1 to 5 range only.')
    })

    const [thumbnailUrl, setThumbnailUrl] = useState(PLACEHOLDER_IMG);
    const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);
    const [user, setUser] = useState();
    const { uid } = FIREBASE_AUTH.currentUser;


    const getUser = async () => {
        try {
            const documentSnapshot = await firestore()
                .collection('users')
                .doc(uid)
                .get();

            const userData = documentSnapshot.data();
            setUser(userData);
        } catch {
            //do whatever
        }
    };

    const getRandomProfilePicture = async () => {
        const response = await fetch('https://randomuser.me/api')
        const data = await response.json()
        return data.results[0].picture.large
    }

    // Get user on mount
    useEffect(() => {
        getUser();
    }, []);

    const uploadPostToFirebase = async (resName, imageUrl, caption, priceRange, selectedCat) => {
        setLoading(true);

        try {
            // add to 'posts' database firebase
            const doc = await addDoc(collection(FIRESTORE_DB, 'venues'),
                {
                    name: resName,
                    image_url: imageUrl,
                    // owner_uid: FIREBASE_AUTH.currentUser.uid,
                    caption: caption,
                    categories: [selectedCat],
                    rating: 0,
                    price: priceRange,
                    reviews: 0,
                    owner_email: FIREBASE_AUTH.currentUser.email,
                    owner_uid: FIREBASE_AUTH.currentUser.uid,
                    // username: username,
                    profile_picture: await getRandomProfilePicture(),
                    status: "Pending Approval",
                    createdAt: new Date().toISOString(),
                }).then(setTimeout(() => { navigation.goBack() }, 2500))
            console.log("new venue added to firebase 'venues' successfully");
        } catch (error) {
            console.log(error);
            alert('venues add to firebase failed: ' + error.message);
        }
        // finally {
        //     setLoading(false);
        // }

    }

    // const onAnimationFinish = () => {
    //     setLottieFinished(true);
    //     setTimeout(() => {
    //         //Go Back to home page after 4 seconds
    //         navigation.goBack()
    //     }, 4000);
    // }

    return (
        <Formik
            initialValues={{ caption: '', imageUrl: '', resName: '', priceRange: '' }}
            onSubmit={values => {
                uploadPostToFirebase(values.resName, values.imageUrl, values.caption, values.priceRange, selectedCat)
                // console.log(values)
                console.log('Your post was submitted successfully')
                // navigation.goBack()
            }}
            validationSchema={uploadPostSchema}
            validateOnMount={true}
        >

            {({ handleChange, handleBlur, handleSubmit, values, errors, isValid }) => (
                <>
                    <View
                        style={{
                            margin: 20,
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                        }}
                    >
                        <Image
                            source={{ uri: validUrl.isUri(thumbnailUrl) ? thumbnailUrl : PLACEHOLDER_IMG }}
                            style={{ width: 100, height: 100 }}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }} >
                            <TextInput
                                style={{ fontSize: 20 }}
                                placeholder='Write a caption...'
                                placeholderTextColor='gray'
                                multiline={true}
                                onChangeText={handleChange('caption')}
                                onBlur={handleBlur('caption')}
                                value={values.caption}

                            />
                        </View>

                    </View>
                    <Divider width={0.2} orientation='vertical' />
                    <View style={{ marginBottom: 10 }} >
                        <TextInput
                            style={{ fontSize: 17 }}
                            placeholder='Input Restaurant Name'
                            placeholderTextColor='gray'
                            multiline={false}
                            onChangeText={handleChange('resName')}
                            onBlur={handleBlur('resName')}
                            value={values.resName}

                        />
                        {errors.resName && (
                            <Text style={{ fontSize: 10, color: 'red' }}>
                                {errors.resName}
                            </Text>
                        )}
                    </View>
                    <Divider width={0.2} orientation='vertical' />
                    <View style={{ marginBottom: 10 }} >
                        <TextInput
                            style={{ fontSize: 17 }}
                            placeholder='Input Price Range ($ only)'
                            placeholderTextColor='gray'
                            multiline={false}
                            onChangeText={handleChange('priceRange')}
                            onBlur={handleBlur('priceRange')}
                            value={values.priceRange}

                        />
                        {errors.priceRange && (
                            <Text style={{ fontSize: 10, color: 'red' }}>
                                {errors.priceRange}
                            </Text>
                        )}
                    </View>
                    <View style={{
                        height: 40,
                        alignItems: 'flex-start',
                        backgroundColor: '#FAFAFA',
                        marginBottom: 10,
                        borderRadius: 4,
                        borderWidth: 1,
                        maxWidth: 250,
                    }}>
                        <Picker
                            placeholder="Select Categories"
                            style={{ width: '100%', marginVertical: -7, marginLeft: -10}}
                            selectedValue={selectedCat}
                            onValueChange={(itemValue, itemIndex) =>
                                setSelectedCat(itemValue)}
                        >
                            <Picker.Item label="Bar" value="Bar" />
                            <Picker.Item label="Cafe" value="Cafe" />
                            <Picker.Item label="Restaurant" value="Restaurant" />
                        </Picker>
                    </View>

                    <Divider width={0.2} orientation='vertical' />
                    <View style={{ marginBottom: 15 }} >
                        <TextInput
                            onChange={(e) => setThumbnailUrl(e.nativeEvent.text)}
                            style={{ fontSize: 17 }}
                            placeholder='Enter Image Url'
                            placeholderTextColor='gray'
                            onChangeText={handleChange('imageUrl')}
                            onBlur={handleBlur('imageUrl')}
                            value={values.imageUrl}
                        />
                        {errors.imageUrl && (
                            <Text style={{ fontSize: 10, color: 'red' }}>
                                {errors.imageUrl}
                            </Text>
                        )}
                    </View>

                    <Button onPress={handleSubmit} title='Post' disabled={!isValid} />
                    {/* <ActivityIndicator size="large" color="#0000ff" /> : */}
                    {loading ?
                        <LottieView source={require('../../assets/onSuccess.json')}
                            autoPlay={true}
                            loop={true}
                        // onAnimationFinish={onAnimationFinish}
                        /> :
                        (<></>)}

                </>
            )}

        </Formik>
    )
}


export default FormikPostUploader