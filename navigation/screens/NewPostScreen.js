import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import AddNewPost from '../../components/NewPost/AddNewPost'
import FormikPostUploader from '../../components/NewPost/FormikPostUploader'

export default function NewPostScreen({ navigation, route }) {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <AddNewPost navigation={navigation} />
            <FormikPostUploader navigation={navigation} route={route} />
        </SafeAreaView>
    )
}