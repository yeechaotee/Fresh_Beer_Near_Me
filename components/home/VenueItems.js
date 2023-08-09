import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export const localRestaurants = [
  {
    name: "Beachside Bar",
    image_url:
      "https://static.onecms.io/wp-content/uploads/sites/9/2020/04/24/ppp-why-wont-anyone-rescue-restaurants-FT-BLOG0420.jpg",
    categories: ["Cafe", "Bar"],
    price: "$$",
    reviews: 1244,
    rating: 4.5,
  },
  {
    name: "Benihana",
    image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
    categories: ["Cafe", "Bar"],
    price: "$$",
    reviews: 1244,
    rating: 3.7,
  },
  {
    name: "India's Grill",
    image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
    categories: ["Indian", "Bar"],
    price: "$$",
    reviews: 700,
    rating: 4.9,
  },
];

export default function VenueItems({ navigation, ...props }) {
  if (props.venueData == null) {
    return (
      <View>
        <Text>No venues found.</Text>
      </View>
    );
  }

  return (
    <>
      {props.venueData.map((venue, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={1}
          style={{ marginBottom: 0 }}
          onPress={() =>
            navigation.navigate("VenueDetail", {
              name: venue.name,
              image: venue.image_url,
              price: venue.price,
              reviews: venue.reviews,
              rating: venue.rating,
              categories: venue.categories,
              caption: venue.caption,
              manageable: props.manageable,
            })
          }
        >
          <View
            style={{ marginTop: 10, padding: 15, backgroundColor: "white" }}
          >
            {/* Venue Image */}
            <VenueImage image={venue.image_url} />
            {/* Venue Info */}
            <VenueInfo
              name={venue.name}
              categories={venue.categories}
              price={venue.price}
              reviews={venue.reviews}
              caption={venue.caption}
              rating={venue.rating}
            />
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}

const VenueImage = (props) => (
  <>
    <Image
      source={{
        uri: props.image,
      }}
      style={{ width: "100%", height: 180 }}
    />
    <TouchableOpacity style={{ position: "absolute", right: 20, top: 20 }}>
      <MaterialCommunityIcons name="heart-outline" size={25} color="#fff" />
    </TouchableOpacity>
  </>
);

const VenueInfo = (props) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
    }}
  >
    {/* by default View is column base */}
    <View>
      <Text style={{ fontSize: 15, fontWeight: "bold" }}>{props.name}</Text>
      <Text style={{ fontSize: 13, color: "gray" }}>{`${props.categories
        .map((cat) => cat)
        .join(" • ")} ${props.price ? " • " + props.price : ""} •💲• ${
        props.rating
      } ⭐ (${props.reviews}+)`}</Text>
      {/* <Text style={{ fontSize: 13, color: "gray" }}>{props.caption}</Text> */}
    </View>
    <View
      style={{
        backgroundColor: "#eee",
        height: 30,
        width: 30,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
      }}
    >
      <Text>{props.rating}</Text>
    </View>
  </View>
);
