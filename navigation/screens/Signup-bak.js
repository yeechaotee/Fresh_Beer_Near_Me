// #6 Email Authentication using Firebase Authentication in React Native App
// https://aboutreact.com/react-native-firebase-authentication/

// Import React and Component
import React, { useState, createRef } from "react";
import {
    SafeAreaView,
    StyleSheet,
    TextInput,
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Keyboard,
    TouchableOpacity,
    ScrollView,
} from "react-native";

// import auth from "@react-native-firebase/auth";
import { FIREBASE_AUTH } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const SignUp = ({ navigation }) => {
    const auth = FIREBASE_AUTH;
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [errortext, setErrortext] = useState("");

    const emailInputRef = createRef();
    const passwordInputRef = createRef();

    const register = async () => {
        setErrortext("");
        if (!userName) return alert("Please fill Name");
        if (!userEmail) return alert("Please fill Email");
        if (!userPassword) return alert("Please fill Address");

        try {
            const response = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
            console.log(response);
            alert('Sign Up successfully! Please check your email.');
        }
        catch (error) {
            console.log(error);
            alert('Sign Up failed: ' + error);
        }
    }

    const handleSubmitButton = async () => {
        setErrortext("");
        if (!userName) return alert("Please fill Name");
        if (!userEmail) return alert("Please fill Email");
        if (!userPassword) return alert("Please fill Address");

        try {
            const { user } = await createUserWithEmailAndPassword(
                auth,
                userEmail,
                userPassword
            )
            console.log(`User ${user.uid} created`)
            await updateProfile(user, {
                displayName: userName,
                photoURL: "https://aboutreact.com/profile.png"
            }).then(() => navigation.goBack());
            console.log("User profile updated");
        }
        catch (error) {
            console.log(error);
            alert('Sign Up failed: ' + error);
        }
        
        // navigation.navigate('Login');

        // .then((user) => {
        //     console.log(
        //         "Registration Successful. Please Login to proceed"
        //     );
        //     console.log(user);
        //     if (user) {
        //         updateProfile(user, {
        //             displayName: userName,
        //             photoURL:
        //                 "https://aboutreact.com/profile.png",
        //         }).then(() => navigation.replace("Login"))
        //             .catch((error) => {
        //                 alert(error);
        //                 console.error(error);
        //             });
        //     }
        // }).catch((error) => {
        //     console.log(error);
        //     if (error.code === "auth/email-already-in-use") {
        //         setErrortext(
        //             "That email address is already in use!"
        //         );
        //     } else {
        //         setErrortext(error.message);
        //     }
        // });
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#eee" }}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    justifyContent: "center",
                    alignContent: "center",
                }}
            >
                <View style={{ alignItems: "center" }}>
                    <Image
                        source={require("../../assets/images/signup.png")}
                        style={{
                            width: "50%",
                            height: 100,
                            resizeMode: "contain",
                            margin: 30,
                        }}
                    />
                </View>
                <KeyboardAvoidingView enabled>
                    <View style={styles.sectionStyle}>
                        <TextInput
                            style={styles.inputStyle}
                            onChangeText={(UserName) =>
                                setUserName(UserName)
                            }
                            underlineColorAndroid="#f000"
                            placeholder="Enter Name"
                            placeholderTextColor="#8b9cb5"
                            autoCapitalize="sentences"
                            returnKeyType="next"
                            onSubmitEditing={() =>
                                emailInputRef.current &&
                                emailInputRef.current.focus()
                            }
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.sectionStyle}>
                        <TextInput
                            style={styles.inputStyle}
                            onChangeText={(UserEmail) =>
                                setUserEmail(UserEmail)
                            }
                            underlineColorAndroid="#f000"
                            placeholder="Enter Email"
                            placeholderTextColor="#8b9cb5"
                            keyboardType="email-address"
                            ref={emailInputRef}
                            returnKeyType="next"
                            onSubmitEditing={() =>
                                passwordInputRef.current &&
                                passwordInputRef.current.focus()
                            }
                            blurOnSubmit={false}
                        />
                    </View>
                    <View style={styles.sectionStyle}>
                        <TextInput
                            style={styles.inputStyle}
                            onChangeText={(UserPassword) =>
                                setUserPassword(UserPassword)
                            }
                            underlineColorAndroid="#f000"
                            placeholder="Enter Password"
                            placeholderTextColor="#8b9cb5"
                            ref={passwordInputRef}
                            returnKeyType="next"
                            secureTextEntry={true}
                            onSubmitEditing={Keyboard.dismiss}
                            blurOnSubmit={false}
                        />
                    </View>
                    {errortext != "" ? (
                        <Text style={styles.errorTextStyle}>
                            {" "}
                            {errortext}{" "}
                        </Text>
                    ) : null}
                    <TouchableOpacity
                        style={styles.buttonStyle}
                        activeOpacity={0.5}
                        onPress={handleSubmitButton}
                    >
                        <Text style={styles.buttonTextStyle}>
                            REGISTER
                        </Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
};
export default SignUp;

const styles = StyleSheet.create({
    sectionStyle: {
        flexDirection: "row",
        height: 40,
        marginTop: 20,
        marginLeft: 35,
        marginRight: 35,
        margin: 10,
    },
    buttonStyle: {
        backgroundColor: "#7DE24E",
        borderWidth: 0,
        color: "#FFFFFF",
        borderColor: "#7DE24E",
        height: 40,
        alignItems: "center",
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 20,
        marginBottom: 20,
    },
    buttonTextStyle: {
        color: "#FFFFFF",
        paddingVertical: 10,
        fontSize: 16,
    },
    inputStyle: {
        flex: 1,
        color: "black",
        paddingLeft: 15,
        paddingRight: 15,
        borderWidth: 1,
        borderRadius: 30,
        borderColor: "#dadae8",
    },
    errorTextStyle: {
        color: "red",
        textAlign: "center",
        fontSize: 14,
    },
});