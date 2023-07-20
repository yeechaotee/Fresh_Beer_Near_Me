import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

export default function BackBtn() {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 16, marginLeft: 10 }}>Back</Text>
        </TouchableOpacity>
    );
}