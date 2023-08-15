import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const EditNewsFeedItemScreen = ({ route, navigation }) => {
    const { item } = route.params; // Get the passed item data
    const [editedItem, setEditedItem] = useState(item); // Initialize the edited item with the passed data

    const handleSave = () => {
        // Implement the logic to save the edited item
        // For example, you could update the Firestore document here
        // After saving, you can navigate back to the previous screen
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text>Edit News Feed Item</Text>
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={editedItem.title}
                onChangeText={(text) => setEditedItem({ ...editedItem, title: text })}
            />
            {/* Add more input fields for other properties */}
            <Button title="Save" onPress={handleSave} />
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        marginVertical: 10,
        width: '100%',
    },
});

export default EditNewsFeedItemScreen;
