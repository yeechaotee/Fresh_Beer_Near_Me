import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'

export default function AddNewPost({ navigation }) {
    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                    source={require('../../assets/arrowback.png')}
                    style={{ width: 20, height: 20 }}
                />
            </TouchableOpacity>
            <Text style={styles.headerText}>Register New Venue post</Text>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginRight: 70,
    },

    headerText: {
        fontSize: 20,
        marginRight: 10,
    }
})