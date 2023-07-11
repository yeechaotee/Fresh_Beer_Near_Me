import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
} from 'react-native';

export default function Social({ navigation }) {

    const onPressHandler = () => {
        navigation.navigate('Map');
        //navigation.goBack();
    }

    return (
        <View style={styles.body}>
            <Text style={styles.text}>
                Social
            </Text>
            <Pressable
                onPress={onPressHandler}
                style={({ pressed }) => ({ backgroundColor: pressed ? '#ddd' : '#faebd7' })}
            >
                <Text style={styles.text}>
                    Go Back to Map
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 40,
        fontWeight: 'bold',
        margin: 10,
    }
})