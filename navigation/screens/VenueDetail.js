import { View, Text } from 'react-native'
import React from 'react'
import About from '../../components/VenueDetail/About'
import { Divider } from 'react-native-elements/dist/divider/Divider';
import MenuItems from '../../components/VenueDetail/MenuItems';
import ActionButton from 'react-native-action-button';
import { useNavigation } from '@react-navigation/native';

export default function VenueDetail({ route }) {

  const { venueId } = route.params;

  const navigation = useNavigation();

  return (
    <View>
      <About route={route} />
      <Divider width={1.8} style={{ marginVertical: 20 }} />
      <MenuItems route={route} />
    </View>
  )
}