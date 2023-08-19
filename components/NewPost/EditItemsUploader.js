import { View, Text, TextInput, Image, Button, TouchableOpacity, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as Yup from 'yup';
import { Formik, formik } from 'formik';
import { Divider } from 'react-native-elements';
import validUrl from 'valid-url'
import { addDoc, collection, onSnapshot, setDoc, doc, collectionGroup, firestore, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import LottieView from 'lottie-react-native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';



const PLACEHOLDER_IMG = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930";

const storage = getStorage();

const EditItemsUploader = ({ navigation, ...props }) => {

    const { venueId } = props.route.params;

    const [image, setImage] = useState(null);
    const [imageUploaded, setImageUploaded] = useState(false);

    // Function to handle form submission
    const handleFormSubmit = async (values, { setSubmitting }) => {
        // If an image is selected, upload it before submitting
        if (image && !imageUploaded) {
            try {
                const imageUrl = await uploadImageToStorage(image);
                values.imageUrl = imageUrl;
                setImageUploaded(true);
            }
            catch (error) {
                console.log('Image upload error:', error);
                setSubmitting(false);
                return;
            }
        } else {
            // No image selected, set imageUrl to an empty string
            values.imageUrl = PLACEHOLDER_IMG;
        }

        // upload data to Firebase
        uploadPostToFirebase(values.title, values.imageUrl, values.description, values.price);
    };

    // Function to handle image selection using expo-image-picker
    const selectImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access the camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setImage(result.assets[0].uri);
            setImageUploaded(false);
        }
    };

    // Function to upload the selected image to Firebase Storage
    const uploadImageToStorage = async (uri) => {
        const imageName = 'menu_item_' + new Date().getTime();
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

        try {
            const response = await fetch(uploadUri);
            const blob = await response.blob();

            // Upload the image to Firebase Storage
            const storageRef = ref(storage, 'menu_items/' + imageName);
            await uploadBytes(storageRef, blob);

            // Get the image URL from Firebase Storage
            const imageUrl = await getDownloadURL(storageRef);
            return imageUrl;
        } catch (error) {
            console.log('Image upload error:', error);
            throw error;
        }
    };


    const [loading, setLoading] = useState(false);

    const uploadPostSchema = Yup.object().shape({
        description: Yup.string().max(2200, 'Description has reached the max characters (2200)'),
        title: Yup.string().required('Food Title is required.').max(255, 'Food title has reached the max characters (255)'),
        price: Yup.string().required('Price is required.'),
    })

    const [thumbnailUrl, setThumbnailUrl] = useState(PLACEHOLDER_IMG);
    const [user, setUser] = useState();
    const { uid } = FIREBASE_AUTH.currentUser;

    const [visible, setVisible] = useState(false);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

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

    // Get user on mount
    useEffect(() => {
        getUser();
    }, []);

    const uploadPostToFirebase = async (title, imageUrl, description, price) => {
        setLoading(true);

        try {
            // Get a reference to the existing venue document
            const venueDocRef = doc(FIRESTORE_DB, 'venues', venueId);

            // Create a new sub-collection "MenuItems" within the existing venue document
            const menuItemCollectionRef = collection(venueDocRef, 'MenuItems');
            await addDoc(menuItemCollectionRef, {
                title: title,
                image: imageUrl,
                description: description,
                price: price,
                owner_email: FIREBASE_AUTH.currentUser.email,
                owner_uid: FIREBASE_AUTH.currentUser.uid,
                createdAt: new Date().toISOString(),
            });

            console.log("new venue added to firebase 'venues' successfully, doc.id ==> " + doc.id);
            setTimeout(() => {
                navigation.goBack();
            }, 2000);

        } catch (error) {
            console.log(error);
            alert('venues add to firebase failed: ' + error.message);
        }

    }



    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} >
                <Formik
                    initialValues={{ description: '', title: '', price: '' }}
                    onSubmit={handleFormSubmit}
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
                                {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
                                {!image && (
                                    <Image
                                        source={{ uri: validUrl.isUri(thumbnailUrl) ? thumbnailUrl : PLACEHOLDER_IMG }}
                                        style={{ width: 100, height: 100 }}
                                    />
                                )}
                                <View style={{ flex: 1, marginLeft: 12 }} >
                                    <TextInput
                                        style={{ fontSize: 20 }}
                                        placeholder='Write a description...'
                                        placeholderTextColor='gray'
                                        multiline={true}
                                        onChangeText={handleChange('description')}
                                        onBlur={handleBlur('description')}
                                        value={values.description}

                                    />
                                </View>

                            </View>
                            <Divider width={0.2} orientation='vertical' />
                            <View style={{ marginBottom: 10 }} >
                                <TextInput
                                    style={{ fontSize: 17 }}
                                    placeholder='Input Food Title'
                                    placeholderTextColor='gray'
                                    multiline={false}
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                    value={values.title}

                                />
                                {errors.title && (
                                    <Text style={{ fontSize: 10, color: 'red' }}>
                                        {errors.title}
                                    </Text>
                                )}
                            </View>
                            <Divider width={0.2} orientation='vertical' />
                            <View style={{ marginBottom: 5 }} >
                                <TextInput
                                    style={{ fontSize: 17 }}
                                    placeholder='Input Price ($xx.xx)'
                                    placeholderTextColor='gray'
                                    multiline={false}
                                    onChangeText={handleChange('price')}
                                    onBlur={handleBlur('price')}
                                    value={values.price}

                                />
                                {errors.price && (
                                    <Text style={{ fontSize: 10, color: 'red' }}>
                                        {errors.price}
                                    </Text>
                                )}
                            </View>

                            <Divider width={0.2} orientation='vertical' />
                            
                            <Button title="Upload Image" onPress={selectImage} />

                            <Pressable titleSize={20}
                                style={styles.button(isValid)}
                                onPress={handleSubmit}
                                disabled={!isValid}>
                                <Text style={styles.buttonText}>Post</Text>
                            </Pressable>

                            {loading ?
                                <LottieView source={require('../../assets/onSuccess.json')}
                                    autoPlay={true}
                                    loop={true}
                                /> :
                                (<></>)}

                        </>
                    )}

                </Formik>
            </KeyboardAvoidingView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center'
    },
    inputField: {
        borderRadius: 4,
        padding: 6,
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        marginBottom: 10,
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff'
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    button: (isValid) => ({
        backgroundColor: isValid ? '#0096F6' : '#9ACAF7',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 42,
        borderRadius: 4,
        marginTop: 20,
        maxWidth: 280, fontWeight: '600', fontSize: 20, borderRadius: 30,
        width: 70, justifyContent: 'center', alignSelf: 'center', textAlign: 'center'
    }),
    buttonText: {
        fontWeight: '600',
        color: '#fff',
        fontSize: 18,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    }
})


export default EditItemsUploader