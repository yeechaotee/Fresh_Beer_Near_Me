import { View, Text, Image } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function VenueItem() {
    return (
        <TouchableOpacity activeOpacity={1}
            style={{ marginBottom: 30 }}>
            <View
                style={{
                    marginTop: 10, padding: 15, backgroundColor: "white",
                }}>
                {/* Venue Image */}
                <VenueImage />
                {/* Venue Info */}
                <VenueInfo />
            </View>
        </TouchableOpacity>
    )
}


const VenueImage = () => (
    <>
        <Image
            source={{
                uri: "https://eu-assets.simpleview-europe.com/manchester2016/imageresizer/?image=%2Fdbimgs%2Fpie%20ale.jpg&action=BlogDetailContent"
            }}
            style={{ width: "100%", height: 100 }}
        />
        <TouchableOpacity style={{ position: 'absolute', right: 20, top: 20 }}>
            <MaterialCommunityIcons name='heart-outline' size={25} color="#fff" />
        </TouchableOpacity>
    </>
)

const VenueInfo = () => (
    <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    }} >
        {/* by default View is column base */}
        <View>
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>Fountain Microbrewery & Restaurant</Text>
            <Text style={{ fontSize: 13, color: "gray" }}>30-45 mins </Text>
        </View>
        <View
            style={{
                backgroundColor: '#eee',
                height: 30,
                width: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15,
            }}>
            <Text>4.5</Text>
        </View>
    </View>
)