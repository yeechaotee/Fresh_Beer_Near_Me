import { View, Text, TextInput, Image, Button, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as Yup from 'yup';
import { Formik, formik } from 'formik';
import { Divider } from 'react-native-elements';
import validUrl from 'valid-url'
import { addDoc, collection, onSnapshot, setDoc, doc, collectionGroup, firestore, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { ActivityIndicator } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { Picker } from '@react-native-picker/picker'
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import TimeRangePicker from 'react-native-range-timepicker';
import SearchBar from '../../components/home/SearchBar';


const PLACEHOLDER_IMG = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930";

const EditItemsUploader = ({ navigation, ...props }) => {

    const { venueId } = props.route.params;

    const [loading, setLoading] = useState(false);
    // const [selectedCat, setSelectedCat] = useState("Bar");

    const uploadPostSchema = Yup.object().shape({
        imageUrl: Yup.string().url().required('A URL is required'),
        description: Yup.string().max(2200, 'Description has reached the max characters (2200)'),
        title: Yup.string().required('Food Title is required.').max(255, 'Food title has reached the max characters (255)'),
        price: Yup.string().required('Price is required.'),
    })

    const [thumbnailUrl, setThumbnailUrl] = useState(PLACEHOLDER_IMG);
    const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);
    const [user, setUser] = useState();
    const { uid } = FIREBASE_AUTH.currentUser;

    const [city, setCity] = useState("Singapore");

    // const [selectedDate, setSelectedDate] = useState(new Date());
    // const [datePickerVisible, setDatePickerVisible] = useState(false);

    // const showDatePicker = () => {
    //     setDatePickerVisible(true);
    // };

    // const hideDatePicker = () => {
    //     setDatePickerVisible(false);
    // };

    // const handleConfirm = (date) => {
    //     setSelectedDate(date);
    //     hideDatePicker();
    // };

    const [visible, setVisible] = useState(false);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    const onSelect = ({ startTime, endTime }) => {
        setStart(startTime.slice(0, -3));
        setEnd(endTime.slice(0, -3));
        setVisible(false);
    };

    const onClose = () => {
        setVisible(false);
    };


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
            initialValues={{ description: '', imageUrl: '', title: '', price: '' }}
            onSubmit={values => {
                uploadPostToFirebase(values.title, values.imageUrl, values.description, values.price)
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
                    {/* <View>
                        <View>
                            <Text style={{ fontSize: 17, fontWeight: '500', marginTop: 10, marginBottom: 10, marginLeft: 5 }}>Operating Hour: {start} - {end}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setVisible(true)}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 10, backgroundColor: 'orange', maxWidth: 280, borderRadius: 10, alignSelf: 'center' }}>
                                CLICK TO PICK TIME RANGE</Text>
                        </TouchableOpacity>
                        <TimeRangePicker
                            visible={visible}
                            onClose={onClose}
                            onSelect={onSelect}

                        />
                    </View> */}

                    {/* <View style={{
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
                            style={{ width: '100%', marginVertical: -7, marginLeft: -10 }}
                            selectedValue={selectedCat}
                            onValueChange={(itemValue, itemIndex) =>
                                setSelectedCat(itemValue)}
                        >
                            <Picker.Item label="Bar" value="Bar" />
                            <Picker.Item label="Cafe" value="Cafe" />
                            <Picker.Item label="Restaurant" value="Restaurant" />
                        </Picker>
                    </View>
                    <View>
                        <Text>Operating Hour:</Text>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 10 }}>
                            {selectedDate ? selectedDate.toLocaleDateString() + ", " +  selectedDate.toLocaleTimeString() : 'No date selected'}
                        </Text>
                        <Button title="Select a date" onPress={showDatePicker} />
                        <DateTimePickerModal
                            date={selectedDate}
                            isVisible={datePickerVisible}
                            mode="time"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                    </View> */}

                    <Divider width={0.2} orientation='vertical' />
                    <View style={{ marginBottom: 5 }} >
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
                    {/* <Pressable titleSize={20}
                        style={styles.button(isValid)}
                        onPress={handleSubmit}
                        disabled={!isValid}
                    >
                        <Text style={styles.buttonText} >Log In</Text>
                    </Pressable> */}

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