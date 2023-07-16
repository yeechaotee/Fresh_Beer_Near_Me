import { View, Text, Image } from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native';
const items = [
    {
        image: require("../../assets/images/beer.png"),
        text: "Beer",
    },
    {
        image: require("../../assets/images/venue.png"),
        text: "Venue",
    },
    {
        image: require("../../assets/images/soft-drink.png"),
        text: "Soft Drinks",
    },
    {
        image: require("../../assets/images/deals.png"),
        text: "Deals",
    },
    {
        image: require("../../assets/images/fast-food.png"),
        text: "Fast Foods",
    },
    {
        image: require("../../assets/images/coffee.png"),
        text: "Coffee & Tea",
    },
    {
        image: require("../../assets/images/desserts.png"),
        text: "Desserts",
    },
];


const Categories = () => {
    return (
        <View style={{
            marginTop: 5,
            backgroundColor: "#fff",
            paddingVertical: 10,
            paddingLeft: 20,
        }}
        >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {/* cat items loop start here */}
                {/* got items is getting all list data above, each item MUST have unique key= (index) */}
                {items.map((item, index) => (
                    <View key={index} style={{ alignItems: "center", marginRight: 30 }}>
                        <Image
                            source={item.image}
                            style={{
                                width: 50,
                                height: 40,
                                resizeMode: "contain",
                            }}
                        />
                        <Text style={{ fontSize: 13, fontWeight: "900" }}>{item.text}</Text>
                    </View>
                ))}
                {/* cat item loop ends here */}
            </ScrollView>
        </View>
    )
}

export default Categories