import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    KeyboardAvoidingView,
    Image,
    Pressable,
    TouchableOpacity,
    Alert
} from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase';
import { ActivityIndicator } from 'react-native-paper';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { validate, validator } from 'email-validator';
import * as Yup from 'yup';
import { Formik } from 'formik';

const BEER_LOGO = "https://static.vecteezy.com/system/resources/thumbnails/007/306/850/small/beer-glasses-hand-drawn-illustration-cheers-lettering-phrase-cartoon-style-design-for-logo-banner-poster-greeting-cards-web-invitation-to-party-vector.jpg";

export default function Login({ navigation }) {

    const LoginFormSchema = Yup.object().shape({
        email: Yup.string().email().required('An email is required'),
        password: Yup.string().required().min(6, 'Your password has to have at least 8 characters')
    })

    // const [email, setEmail] = useState('');
    // const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const onLogin = async (email, password) => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log("Logon log: ===> " + response);

            // Check if the user's email is verified
            const user = auth.currentUser;
            if (user && !user.emailVerified) {
                alert("Email Verification Required. Please verify your email before logging in.");
                signOut(auth);
            }
        }
        catch (error) {
            console.log(error);
            Alert.alert(
                'Invalid Login',
                error.message + '\n\n ... Would you like to sign up?',
                [
                    {
                        text: 'OK',
                        onPress: () => console.log('OK'),
                        style: "cancel",
                    },
                    {
                        text: 'Sign Up',
                        onPress: () => navigation.push('Signup'),
                    }
                ]
            )
            // alert('Sign in failed: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    }

    // const signIn = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await signInWithEmailAndPassword(auth, email, password);
    //         console.log(response);
    //     }
    //     catch (error) {
    //         console.log(error);
    //         alert('Sign in failed: ' + error);
    //     }
    //     finally {
    //         setLoading(false);
    //     }
    // }

    // const signUp = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await createUserWithEmailAndPassword(auth, email, password);
    //         console.log(response);
    //         alert('Sign Up successfully! Please check your email.');
    //     }
    //     catch (error) {
    //         console.log(error);
    //         alert('Sign Up failed: ' + error);
    //     }
    //     finally {
    //         setLoading(false);
    //     }
    // }

    return (
        <View style={styles.container}>
            {navigation &&
                <TouchableOpacity onPress={() => navigation.goBack()}
                    style={{
                        top: 40,
                        left: 1,
                        zIndex: 1,
                        position: 'absolute',
                        paddingVerticle: 9,
                        borderRadius: 20,
                    }}>
                    <Image
                        source={require('../../assets/arrowback.png')}
                        style={{ width: 20, height: 20 }}
                    />
                    {/* <FontAwesome5 name={'arrow-alt-circle-left'} color={'#fff'} size={30} /> */}
                </TouchableOpacity>}
            <View style={styles.logoContainer}>
                <Image source={{ uri: BEER_LOGO, height: 200, width: 200 }} />
            </View>
            <View>
                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={(values, { resetForm }) => {
                        onLogin(values.email, values.password);
                        resetForm({ values: { email: '', password: '' } })
                    }}
                    validationSchema={LoginFormSchema}
                    validateOnMount={true}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, isValid }) => (
                        <>
                            <KeyboardAvoidingView behavior='padding'>
                                <View style={[styles.inputField, {
                                    borderColor:
                                        values.email.length < 1 || validate(values.email)
                                            ? '#ccc' : 'red',
                                }]}>
                                    <TextInput
                                        placeholder='Email'
                                        autoCapitalize='none'
                                        keyboardType='email-address'
                                        autoFocus={true}
                                        // value={email}
                                        value={values.email}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                    // onChangeText={(text) => setEmail(text)}
                                    ></TextInput>
                                </View>
                                <View style={[styles.inputField, {
                                    borderColor:
                                        1 > values.password.length || values.password.length >= 6
                                            ? '#ccc' : 'red',
                                }]} >
                                    <TextInput
                                        placeholder='Password'
                                        secureTextEntry={true}
                                        autoCapitalize='none'
                                        value={values.password}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                    // value={password}
                                    // onChangeText={(text) => setPassword(text)}
                                    ></TextInput>
                                </View>
                                {loading ?
                                    <ActivityIndicator size="large" color="#0000ff" /> :
                                    (<>
                                        <Pressable titleSize={20}
                                            style={styles.button(isValid)}
                                            onPress={handleSubmit}
                                            disabled={!isValid}
                                        >
                                            <Text style={styles.buttonText} >Log In</Text>
                                        </Pressable>
                                        <View style={styles.signupContainer}>
                                            <Text>Don't have an account? </Text>
                                            <TouchableOpacity onPress={() => navigation.push('Signup')}>
                                                <Text style={{ color: '#6BB0F5' }}>Sign Up</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {/* <Button title='Log in' onPress={signIn} /> */}
                                        {/* <Button title='Create an account' onPress={signUp} /> */}
                                        {/* <Button title='Create an account' onPress={() => navigation.navigate("Signup")} /> */}

                                    </>
                                    )}
                            </KeyboardAvoidingView>
                        </>
                    )}
                </Formik>
            </View>
        </View>
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