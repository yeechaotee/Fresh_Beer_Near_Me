import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import EditExistingMenuItemUploader from '../../components/NewPost/EditExistingMenuItemUploader'

export default function EditExistingMenuItemScreen({ navigation, route }) {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../../assets/arrowback.png')}
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Edit Menu Item</Text>

            </View>
            <EditExistingMenuItemUploader navigation={navigation} route={route} />
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
        marginTop: 30,
        marginRight: 120,
    },

    headerText: {
        fontWeight: '700',
        fontSize: 20,
        marginRight: 10,
    }
})