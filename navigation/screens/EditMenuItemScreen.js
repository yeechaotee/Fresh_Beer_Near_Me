import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import EditItemsUploader from '../../components/NewPost/EditItemsUploader'

export default function EditMenuItemScreen({ navigation, route }) {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../../assets/arrowback.png')}
                        style={{ width: 20, height: 20, marginLeft: -100 }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Add New Menu Item</Text>

            </View>
            <EditItemsUploader navigation={navigation} route={route} />
        </SafeAreaView>
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
        alignSelf: 'center',
        marginTop: 30,
    },

    headerText: {
        fontWeight: '700',
        fontSize: 20,
        marginRight: 10,
    }
})