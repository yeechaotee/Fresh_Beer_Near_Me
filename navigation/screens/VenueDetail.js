import { View, Text, ScrollView, FlatList, SafeAreaView } from 'react-native'
import React from 'react'
import About from '../../components/VenueDetail/About'
import { Divider } from 'react-native-elements/dist/divider/Divider';
import MenuItems from '../../components/VenueDetail/MenuItems';
import ActionButton from 'react-native-action-button';
import { useNavigation } from '@react-navigation/native';

export default function VenueDetail({ route }) {


  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <About route={route} />
        <Divider width={1.8} style={{ marginVertical: 20 }} />
        <View>
          <MenuItems route={route} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}