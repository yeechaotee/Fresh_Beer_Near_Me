import React, { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, SafeAreaView } from 'react-native';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    TouchableOpacity
} from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ManagePost from '../../components/NewPost/ManagePost';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();


export default function drawer() {
    return (
        <SafeAreaView style={{ backgroundColor: "#eee", flex: 1 }}>
            <Drawer.Navigator screenOptions={{ headerShown: false, drawerLabelStyle: { marginLeft: -25 } }}>
                <Drawer.Screen name="Manage Venue" component={ManagePost} options={{
                    drawerIcon: ({ color }) => {
                        <Ionicons name="setting-outline" size={12} color={color} />
                    }
                }} />
            </Drawer.Navigator>
        </SafeAreaView>
    )
}