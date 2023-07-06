import React,{ useState } from "react";
import { View, Text,TouchableOpacity, Image } from 'react-native'

import styles from './screenheader.style'

const ScreenHeaderBtn = ({ iconUrl, dimension }) => {
  const [expanded, setExpanded] = useState(false);

  const onPressHandler = () => {
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity style={styles.btnContainer} onPress={onPressHandler}>
      <Image
        source={iconUrl}
        resizeMode='cover'
        style={styles.btnImg(dimension)}
      />
      {expanded && (
        <View>
          {/* Render additional options here */}
          <Text>options 1...</Text>
          <Text>options 2...</Text>
          
        </View>
      )}
    </TouchableOpacity>
  )
}

export default ScreenHeaderBtn