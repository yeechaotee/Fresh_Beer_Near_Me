import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Divider } from 'react-native-elements';
import validUrl from 'valid-url';
import { doc, collection, firestore, updateDoc } from 'firebase/firestore';
import LottieView from 'lottie-react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';


const PLACEHOLDER_IMG = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930";

const EditExistingMenuItemUploader = ({ navigation, ...props }) => {
    const { venueId, itemData } = props.route.params;
    const [loading, setLoading] = useState(false);

    const uploadPostSchema = Yup.object().shape({
        imageUrl: Yup.string().url().required('A URL is required'),
        description: Yup.string().max(2200, 'Description has reached the max characters (2200)'),
        title: Yup.string().required('Food Title is required.').max(255, 'Food title has reached the max characters (255)'),
        price: Yup.string().required('Price is required.'),
    });

    const [thumbnailUrl, setThumbnailUrl] = useState(itemData?.image || PLACEHOLDER_IMG);

    const updateMenuItemInFirebase = async (title, imageUrl, description, price) => {
        setLoading(true);

        try {
            // Get a reference to the existing venue document
            const venueDocRef = doc(FIRESTORE_DB, 'venues', venueId);

            // Get a reference to the existing menu item document within the venue
            const menuItemDocRef = doc(venueDocRef, 'MenuItems', itemData.id);

            // Update the existing menu item with new data
            const updatedData = {
                title: title,
                image: imageUrl,
                description: description,
                price: price,
                // Any other fields you want to update
            };

            await updateDoc(menuItemDocRef, updatedData);

            console.log('Menu item updated successfully');
            setTimeout(() => {
                // Navigate back to MenuItems
                // navigation.navigate('VenueDetail', { venueId: venueId, manageable: true });
                navigation.goBack();
            }, 2000);
        } catch (error) {
            console.log(error);
            alert('Failed to update menu item: ' + error.message);
        }
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <Formik
                    initialValues={{
                        description: itemData?.description || '',
                        imageUrl: thumbnailUrl,
                        title: itemData?.title || '',
                        price: itemData?.price || '',
                    }}
                    onSubmit={values => {
                        updateMenuItemInFirebase(values.title, values.imageUrl, values.description, values.price)
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
                                <View style={{ flex: 1, marginLeft: 15 }} >
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
                            <View style={{ marginBottom: 10, marginLeft: 10 }} >
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
                            <View style={{ marginBottom: 5, marginLeft: 10 }} >
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
                            <View style={{ marginBottom: 5, marginLeft: 10 }} >
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

                            <Pressable titleSize={20}
                                style={styles.button(isValid)}
                                onPress={handleSubmit}
                                disabled={!isValid}>
                                <Text style={styles.buttonText}>Post</Text>
                            </Pressable>
                            {/* <Button style={{ maxWidth: 280, borderRadius: 10 }} onPress={handleSubmit} title='Post' disabled={!isValid} /> */}
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


export default EditExistingMenuItemUploader;
