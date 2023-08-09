import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LottieView from 'lottie-react-native';

// cityHandler is using destructure way

export default function SearchBar({ cityHandler }) {
    return (
        <View style={{ marginTop: 15, flexDirection: "row" }}>
            {/* query is using YC API Key to enable auto suggestion */}
            <LottieView style={styles.logo} source={require('../../assets/beer-logo.json')}
                autoPlay
                speed={0.5}
            />
            {/* <Image style={styles.logo} source={require('../../assets/fresh-beer-logo.jpg')} /> */}
            <GooglePlacesAutocomplete
                query={{ key: 'AIzaSyAF_ydiFOLLLkBe7bpYvAL7oIuuJYdk-pc' }}
                onPress={(data, details = null) => {
                    console.log(data.description) //to show decription data on console
                    const city = data.description.split(",")[0]; //split the data and retrieve only city
                    cityHandler(city);
                }}
                placeholder='Search'
                styles={{
                    textInput: {
                        backgroundColor: "#eee",
                        borderRadius: 20,
                        fontWeight: '700',
                        marginTop: 7,
                    },
                    textInputContainer: {
                        backgroundColor: "#eee",
                        borderRadius: 50,
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 10,
                    },

                }}

                renderLeftButton={() =>
                    <View style={{ marginLeft: 10 }}>
                        <Ionicons name='location-sharp' size={25} />
                    </View>
                }

                renderRightButton={() =>
                    <View
                        style={{
                            flexDirection: 'row',
                            marginRight: 8,
                            backgroundColor: 'white',
                            padding: 9,
                            borderRadius: 30,
                            alignItems: "center",
                        }}>

                        <AntDesign name='clockcircle' size={11} style={{ marginRight: 4 }} />
                        <Text>Search</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    logo: {
        width: 50,
        alignSelf: 'center',
        marginBottom: 30,
        height: 65,
        resizeMode: 'contain',
    }
})