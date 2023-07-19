import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const HeaderTabs = (props) => {
    return (
        <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <HeaderButton
                text="Delivery"
                btnColor="black"
                textColor="white"
                activeTab={props.activeTab}
                setActiveTab={props.setActiveTab} />
            <HeaderButton
                text="Pickup"
                btnColor="white"
                extColor="black"
                activeTab={props.activeTab}
                setActiveTab={props.setActiveTab} />
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