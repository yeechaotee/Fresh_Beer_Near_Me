import { View, Text } from 'react-native'
import React from 'react'
import About from '../../components/VenueDetail/About'
import { Divider } from 'react-native-elements/dist/divider/Divider';
import MenuItems from '../../components/VenueDetail/MenuItems';

export default function VenueDetail({ route }) {
  return (
    <View>
      
      <About route={route} />
      <Divider width={1.8} style={{ marginVertical: 20 }} />
      <MenuItems />
    </View>
  )
}