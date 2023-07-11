import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const HeaderTabs = () => {
    const [activeTab, setActiveTab] = useState("Nearby");

    return (
        <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <HeaderButton
                text="Nearby"
                btnColor="black"
                textColor="white"
                activeTab={activeTab}
                setActiveTab={setActiveTab} />
            <HeaderButton
                text="Manual"
                btnColor="white"
                extColor="black"
                activeTab={activeTab}
                setActiveTab={setActiveTab} />
        </View>
    )
}

const HeaderButton = (props) => (

    <TouchableOpacity
        style={{
            backgroundColor: props.activeTab == props.text ? 'black' : 'white',
            paddingVerticle: 6,
            paddingHorizontal: 16,
            borderRadius: 30,

        }}
        onPress={() => props.setActiveTab(props.text)}
    >
        <Text style={{
            color: props.activeTab == props.text ? 'white' : 'black',
            fontSize: 20
        }}> {props.text} </Text>
    </TouchableOpacity>
)

export default HeaderTabs