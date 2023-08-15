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
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase";
import { ActivityIndicator } from "react-native-paper";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { validate, validator } from "email-validator";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  addDoc,
  collection,
  onSnapshot,
  setDoc,
  doc,
  collectionGroup,
  firestore,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import SurveyModal from "../../components/signup/surveyModal";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const BEER_LOGO =
  "https://static.vecteezy.com/system/resources/thumbnails/007/306/850/small/beer-glasses-hand-drawn-illustration-cheers-lettering-phrase-cartoon-style-design-for-logo-banner-poster-greeting-cards-web-invitation-to-party-vector.jpg";

export default function Signup({ navigation }) {
  const UserSignupFormSchema = Yup.object().shape({
    email: Yup.string().email().required("An email is required"),
    username: Yup.string().required().min(2, "Username is required"),
    password: Yup.string()
      .required()
      .min(6, "Your password has to have at least 8 characters"),
  });

  const BizUserSignupFormSchema = Yup.object().shape({
    email: Yup.string().email().required("An email is required"),
    username: Yup.string().required().min(2, "Username is required"),
    password: Yup.string()
      .required()
      .min(6, "Your password has to have at least 8 characters"),
    businessUEN: Yup.string().required(),
  });

  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  // const [selectedValue, setSelectedValue] = useState("user");
  const [selectedRole, setSelectedRole] = useState("user");

  //  this will also add to FIREBASE DB collection 'users' with profile pic
  const onSignup = async (email, password, username, selectedRole, businessUEN) => {
    setLoading(true);
    try {
      const authUser = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // send out email verification for new sign up user after created For email verification process before they can logon to our mobile (security enhancement)
      await sendEmailVerification(authUser.user);

      // Sign out the user after email verification is sent
      await signOut(auth);

      // Show an alert to the user indicating that an email has been sent
      alert("Email verification sent. Please check your inbox.");

      navigation.push("Login");

      // add to 'users' database firebase
      const doc = await addDoc(collection(FIRESTORE_DB, "users"), {
        fname: "",
        lname: "",
        owner_uid: authUser.user.uid,
        username: username,
        role: selectedRole,
        email: authUser.user.email,
        businessUEN: businessUEN,
        profile_picture: await getRandomProfilePicture(),
        createdAt: new Date().toISOString(),
        // adding beer profile preferences
        beerProfile: beerProfile,
        favBeer: favBeer,
        region: region,
      });
      console.log("document saved correctly", doc.id);

    } catch (error) {
      console.log(error);
      alert("Sign up failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // (Test data only) get random user profile from API, look more json data on the link
  const getRandomProfilePicture = async () => {
    // const response = await fetch("https://randomuser.me/api");
    const response = await fetch("https://api.waifu.pics/sfw/waifu");
    const data = await response.json();
    // return data.results[0].picture.large;
    return data.url;
  };

  //modal needs
  const [modalVisible, setModalVisible] = useState(false);
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  //modal survey state
  const [surveyIsDone, setSurveyIsDone] = useState(false);

  //modal return contents
  const [beerProfile, setBeerProfile] = useState([]);
  const [favBeer, setFavBeer] = useState([]);
  const [region, setRegion] = useState([]);

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
          initialValues={{ email: "", password: "", username: "", businessUEN: "" }}
          onSubmit={(values, { resetForm }) => {
            onSignup(
              values.email,
              values.password,
              values.username,
              selectedRole,
              values.businessUEN
            );
            // resetForm({ values: { email: '', password: '', username: '' } });
          }}
          validationSchema={selectedRole === "businessUser" ? BizUserSignupFormSchema : UserSignupFormSchema}
          validateOnMount={true}
        >
          {({ handleChange, handleBlur, handleSubmit, values, isValid }) => (
            <>
              <KeyboardAvoidingView behavior="padding">
                <View
                  style={[
                    styles.inputField,
                    {
                      borderColor:
                        values.email.length < 1 || validate(values.email)
                          ? "#ccc"
                          : "red",
                    },
                  ]}
                >
                  <TextInput
                    placeholder="Email"
                    autoCapitalize="none"
                    placeholderTextColor="#444"
                    keyboardType="email-address"
                    autoFocus={true}
                    // value={email}
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                  // onChangeText={(text) => setEmail(text)}
                  ></TextInput>
                </View>
                <View
                  style={{
                    height: 50,
                    padding: 6,
                    alignItems: "flex-start",
                    backgroundColor: "#FAFAFA",
                    marginBottom: 10,
                  }}
                >
                  <Picker
                    placeholder="select a role"
                    style={{ width: "100%", marginTop: -5, marginLeft: -10 }}
                    selectedValue={selectedRole}
                    onValueChange={(itemValue, itemIndex) =>
                      setSelectedRole(itemValue)
                    }
                  >
                    <Picker.Item label="General User" value="user" />
                    <Picker.Item label="Business User" value="businessUser" />
                  </Picker>
                </View>
                <View
                  style={[
                    styles.inputField,
                    {
                      borderColor:
                        1 > values.username.length ||
                          values.username.length >= 2
                          ? "#ccc"
                          : "red",
                    },
                  ]}
                >
                  <TextInput
                    placeholder="Username"
                    autoCapitalize="none"
                    value={values.username}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                  // value={password}
                  // onChangeText={(text) => setPassword(text)}
                  ></TextInput>
                </View>
                <View
                  style={[
                    styles.inputField,
                    {
                      borderColor:
                        1 > values.password.length ||
                          values.password.length >= 6
                          ? "#ccc"
                          : "red",
                    },
                  ]}
                >
                  <TextInput
                    placeholder="Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                  // value={password}
                  // onChangeText={(text) => setPassword(text)}
                  ></TextInput>
                </View>

                {selectedRole === "businessUser" && (
                  <View
                    style={[
                      styles.inputField,
                      {
                        borderColor: values.businessUEN.length > 0 ? "#ccc" : "red",
                      },
                    ]}
                  >
                    <TextInput
                      placeholder="Business UEN"
                      autoCapitalize="none"
                      value={values.businessUEN}
                      onChangeText={handleChange("businessUEN")}
                      onBlur={handleBlur("businessUEN")}
                    />
                  </View>
                )}


                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <>
                    <Pressable
                      titleSize={20}
                      style={styles.button(isValid)}
                      //onPress={handleSubmit}
                      //onPress={surveyIsDone ? handleSubmit : handleOpenModal}
                      //if business user, no need to do survey
                      onPress={selectedRole === "businessUser" ? handleSubmit : (surveyIsDone ? handleSubmit : handleOpenModal)}
                    >
                      <Text style={styles.buttonText}>Sign Up</Text>
                    </Pressable>
                    <SurveyModal
                      modalVisible={modalVisible}
                      setModalVisible={setModalVisible}
                      setSurveyIsDone={setSurveyIsDone}
                      handleSubmit={handleSubmit}
                      setBeerProfile={setBeerProfile}
                      setFavBeer={setFavBeer}
                      setRegion={setRegion}
                      username={values.username}
                    />
                    <View style={styles.signupContainer}>
                      <Text>Already have an account? </Text>
                      <TouchableOpacity
                        onPress={() => navigation.push("Login")}
                      >
                        <Text style={{ color: "#6BB0F5" }}>Log In</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  inputField: {
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    marginBottom: 10,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  button: (isValid) => ({
    backgroundColor: isValid ? "#0096F6" : "#9ACAF7",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderRadius: 4,
    marginTop: 20,
  }),
  buttonText: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 18,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
});
