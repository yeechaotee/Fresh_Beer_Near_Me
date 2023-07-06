import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { useRouter } from 'expo-router'

import styles from './popularjobs.style';
import { COLORS, SIZES } from '../../../constants';
import PopularJobCard from '../../common/cards/popular/PopularJobCard';

const Popularjobs = () => {
  const router = useRouter();
  const isLoading = false;  //if this is true, will show the loading bar
  const error = false;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}> popular jobs</Text>
        <TouchableOpacity>
          <Text style={styles.headerBtn}>Show all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {isLoading ? (<ActivityIndicator size={'large'} color={COLORS.primary} />)
          : error ? (<Text>Something went wrong</Text>)
            :
            (
              <FlatList 
                data={[1,2,3,4,5,6,7,8,9]}
                renderItem={() => {}}
              />
            )}

      </View>
    </View>
  )

}

export default Popularjobs