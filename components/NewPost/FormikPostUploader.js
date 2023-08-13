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
import { Picker } from '@react-native-picker/picker'
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
import TimeRangePicker from 'react-native-range-timepicker';
import SearchBar from '../../components/home/SearchBar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DropDownPicker from 'react-native-dropdown-picker';
import SurveyModal from "../../components/signup/surveyModal";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';


const PLACEHOLDER_IMG = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930";

const storage = getStorage();

const FormikPostUploader = ({ navigation }) => {

    const [loading, setLoading] = useState(false);
    const [selectedCat, setSelectedCat] = useState("Bar");

    const uploadPostSchema = Yup.object().shape({
        // imageUrl: Yup.string().url().required('A URL is required'),
        caption: Yup.string().max(2200, 'Caption has reached the max characters (2200)'),
        resName: Yup.string().required('Restaurant Name is required.').max(255, 'Restaurant name has reached the max characters (255)'),
        priceRange: Yup.string().required('Price Range is required.').max(5, 'Kindly input between 1 to 5 range only.')
    })

    const [thumbnailUrl, setThumbnailUrl] = useState(PLACEHOLDER_IMG);
    const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);
    const [user, setUser] = useState();
    const { uid } = FIREBASE_AUTH.currentUser;

    const [city, setCity] = useState("Singapore");


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
        uploadPostToFirebase(values.resName, values.imageUrl, values.caption, values.priceRange, selectedCat);
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

        // if (!result.cancelled) {
        //     setImage(result.uri);
        // }

        if (!result.canceled && result.assets.length > 0) {
            setImage(result.assets[0].uri);
            setImageUploaded(false);
        }
    };

    // Function to upload the selected image to Firebase Storage
    const uploadImageToStorage = async (uri) => {
        const imageName = 'venue_img_' + new Date().getTime();
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

        try {
            const response = await fetch(uploadUri);
            const blob = await response.blob();

            // Upload the image to Firebase Storage
            const storageRef = ref(storage, 'venues_restaur_images/' + imageName);
            await uploadBytes(storageRef, blob);

            // Get the image URL from Firebase Storage
            const imageUrl = await getDownloadURL(storageRef);
            return imageUrl;
        } catch (error) {
            console.log('Image upload error:', error);
            throw error;
        }
    };


    // Survey part start here

    const [surveyIsDone, setSurveyIsDone] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const handleOpenModal = () => {
        setModalVisible(true);
    };

    const [beerProfile, setBeerProfile] = useState([]);
    const [favBeer, setFavBeer] = useState([]);
    const [region, setRegion] = useState([]);




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
                    // venueId: doc.id,
                    name: resName,
                    image_url: imageUrl,
                    // owner_uid: FIREBASE_AUTH.currentUser.uid,
                    caption: caption,
                    categories: [selectedCat],
                    rating: 0,
                    price: priceRange,
                    reviews: 0,
                    operating_hour: (start && end) ? (start + " - " + end) : "",
                    location: city,
                    owner_email: FIREBASE_AUTH.currentUser.email,
                    owner_uid: FIREBASE_AUTH.currentUser.uid,
                    beerProfile: beerProfile,
                    favBeer: favBeer,
                    region: region,
                    status: "Pending Approval",
                    createdAt: new Date().toISOString(),
                }).then(setTimeout(() => { navigation.push("LoggedOn") }, 2000));

            console.log("new venue added to firebase 'venues' successfully, doc.id ==> " + doc.id);
        } catch (error) {
            console.log(error);
            alert('venues add to firebase failed: ' + error.message);
        }
        // finally {
        //     setLoading(false);
        // }

    }


    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
        >
            <Formik
                initialValues={{ caption: '', resName: '', priceRange: '' }}
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
                        <Divider width={0.2} orientation='vertical' />
                        <View style={{ padding: 10 }}>
                            {/* <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}
                            <SearchBar cityHandler={setCity} />
                        </View>
                        <Divider width={0.2} orientation='vertical' />
                        <View>
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

                        <Divider width={0.2} orientation='vertical' />
                        {/* <View style={{ marginBottom: 1 }} >
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
                        </View> */}


                        {/* <Pressable titleSize={20}
                        style={styles.button(isValid)}
                        onPress={handleSubmit}
                        disabled={!isValid}
                    >
                        <Text style={styles.buttonText} >Log In</Text>
                    </Pressable> */}

                        <Button title="Upload Image" onPress={selectImage} />
                        <Pressable titleSize={20}
                            style={styles.button(isValid)}
                            onPress={surveyIsDone ? handleSubmit : handleOpenModal}
                            disabled={!isValid}>
                            <Text style={styles.buttonText}>Post</Text>
                        </Pressable>
                        <SurveyModal
                            modalVisible={modalVisible}
                            setModalVisible={setModalVisible}
                            setSurveyIsDone={setSurveyIsDone}
                            handleSubmit={handleSubmit}
                            setBeerProfile={setBeerProfile}
                            setFavBeer={setFavBeer}
                            setRegion={setRegion}
                            username={values.resName}
                        />
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
        </KeyboardAwareScrollView>
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
        marginTop: 5,
        marginBottom: 15,
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


export default FormikPostUploader