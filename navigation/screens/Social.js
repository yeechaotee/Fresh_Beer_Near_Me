import React from "react";
import { StyleSheet, View, Text, FlatList, TextInput, SafeAreaView, Button, ScrollView, KeyboardAvoidingView } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const handleHead = ({tintColor}) => <Text style={{color: tintColor}}>H1</Text>

const generateRandomTime = () => {
    const hours = Math.floor(Math.random() * 12); // Random hour (0-11)
    const minutes = Math.floor(Math.random() * 60); // Random minute (0-59)
    const isAM = Math.random() < 0.5; // Randomly choose AM or PM
  
    // Format hours to be in two digits
    const formattedHours = hours.toString().padStart(2, '0');
  
    // Format minutes to be in two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');
  
    // Determine if it's AM or PM
    const period = isAM ? 'AM' : 'PM';
  
    // Return the formatted time
    return `${formattedHours}:${formattedMinutes} ${period}`;
};

function NewsFeed() {
    const activeData = Array.from({ length: 100 }, (item, index) => ({
        id: index + 1,
        name: `Mike ${index + 1}`,
        message: `testmessage kdsfjkdsljfjklsajfdaskjdfklsj${index + 1}`,
        time: generateRandomTime(),
    }));
  return (
    <View style={styles.container}>
        <FlatList
            data={activeData}
            renderItem={({ item }) => (
                <View>
                    <View style={styles.rowHeader}>
                        <View style={styles.rowIcon} />
                        <View style={styles.rowContent}>
                            <Text style={styles.rowHead}>{item.name}</Text>
                            <Text style={styles.rowText}>{item.time}</Text>
                        </View>
                    </View>
                    <Text style={styles.rowMessage}>{item.message}</Text>
                    <View style={{ width: '100%', height: 100, backgroundColor: '#c3c3c3'}}></View>
                    <View style={styles.rowContainer}>
                        <FontAwesome5
                            name={'heart'}
                            size={20}
                            color={'black'}
                        />
                        <FontAwesome5
                            name={'comment'}
                            size={20}
                            color={'black'}
                            style={{ paddingLeft: 10 }}
                        />
                    </View>
                </View>
            )}
            keyExtractor={(item) => item.id.toString()}
        />
    </View>
  );
}

function CreateFeed() {
    const richText = React.useRef();
  return (
    <SafeAreaView>
      <RichToolbar
        editor={richText}
        actions={[ actions.setBold, actions.setItalic, actions.setUnderline, actions.heading1, actions.insertImage ]}
        iconMap={{ [actions.heading1]: handleHead }}
      />
      <ScrollView>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}	style={{ flex: 1, minHeight: 500 }}>
          <Text>Description:</Text>
          <RichEditor
              ref={richText}
              style={{ minHeight: 500 }}
              onChange={ descriptionText => {
                  console.log("descriptionText:", descriptionText);
              }}
          />
        </KeyboardAvoidingView>
        <Button title="Creat Feed" />
      </ScrollView>
    </SafeAreaView>
  );
}

function AddFriends() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <View style={{ alignItems: "center"}}>
        <Text style={{ marginBottom: 20, marginTop: 20, fontWeight: "bold"}}>
          Add Via User Name
        </Text>
      </View>
        <TextInput style={styles.input} value="username"/>
        <View  style={{ marginBottom: 10 }}>
          <Button title="Send friend Request" />
        </View>
        <View style={{alignItems: "center"}}>
          <Text style={{marginTop: 40, fontWeight: "bold"}}>OR</Text>
        </View>
        <View style={{ marginBottom: 10, marginTop: 60}}>
          <Button title="Add Via Your Phone Contact" />
        </View>
        <Button style={{ marginTop: 10 }} title="Nearby Scan" />
    </SafeAreaView>
  );
}

function CreateGroup({ navigation }) {
    const activeData = Array.from({ length: 5 }, (item, index) => ({
        id: index + 1,
        name: `Mike ${index + 1}`,
        message: `testmessage ${index + 1}`,
        time: generateRandomTime(),
    }));
    const [toggleCheckBox, setToggleCheckBox] = React.useState(false)
    return (
        <View style={{ height: 500 }}>
            <FlatList
                data={activeData}
                renderItem={({ item }) => (
                    <View style={styles.rowContainer}>
                        <View style={styles.rowIcon} />
                        <View style={styles.rowContent}>
                            <Text style={styles.rowHead}>{item.name}</Text>
                            <Text style={styles.rowText}>{item.time}</Text>
                        </View>
                        <View>
                            <Text style={styles.rowText}>{item.message}</Text>
                        </View>
                        <View style={{ marginLeft: 10, marginRight: 10, backgroundColor: '#c3c3c3', height: 10, width: 10, borderColor: 'black', borderWidth: 1 }}></View>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
            />
            <Button title="Continue" onPress={() => {
              navigation.navigate('Continue Create Group')
            }}/>
        </View>
    );
}

function ContinueCreateGroup() {
  return (
      <Stack.Navigator>
        <Stack.Screen name="Groups" component={CreateGroup} />
        <Stack.Screen name="Continue Create Group" component={Grouops} />
      </Stack.Navigator>
  )
}

function Grouops() {
  return (
    <View style={{padding: 10}}>
      <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <View style={styles.avatar} />
        <Text style={{ marginTop: 10 }} >Edit</Text>
      </View>
      <Text>Groups Name</Text>
      <TextInput style={styles.input} value="Group Name"/>
      <View style={{ marginTop: 10 }}>
        <Button title="Create Group" />
      </View>
    </View>
  )
}

export default function SocialScreen({ navigation }) {
  return (
    <Drawer.Navigator initialRouteName="Social Home">
      <Drawer.Screen
        name="News Feed"
        component={NewsFeed}
        options={{
          title: "News Feed",
          headerStyle: {
            backgroundColor: '#ffa31a',
          },
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="Create Post"
        component={CreateFeed}
        options={{
          title: "Create Post",
          headerStyle: {
            backgroundColor: '#ffa31a',
          },
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="Add Friends"
        component={AddFriends}
        options={{
          title: "Add Friends",
          headerStyle: {
            backgroundColor: '#ffa31a',
          },
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="Create Group"
        component={ContinueCreateGroup}
        options={{
          title: "Create Group",
          headerStyle: {
            backgroundColor: '#ffa31a',
          },
          headerTitleAlign: "center",
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
    input: {
        width: '90%',
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: '#ffffff',
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',    
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e8e8e8',
    },
    rowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    rowIcon: {
      width: 40,
      height: 40,
      backgroundColor: '#c3c3c3',
      borderRadius: 20,
      marginRight: 12,
    },
    rowContent: {
      flex: 1,
    },
    rowHead: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    rowText: {
      fontSize: 16,
      //fontWeight: 'bold',
      marginBottom: 4,
    },
    rowMessage: {
      fontSize: 16,
      marginBottom: 4,
      marginTop: 8,
      color: '#808080',
    },
    rowTime: {
      fontSize: 14,
      color: '#808080',
    },
    avatar: {
      width: 100,
      height: 100,
      backgroundColor: '#c3c3c3',
      borderRadius: 50,
    },
  });