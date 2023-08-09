import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const yelpVenueInfo = {
  name: "Farmhouse kitchen Thai Cuisine",
  image:
    "https://www.peninsula.com/-/media/images/bangkok/new/dining/thiptara/pbk-thiptara-3-1074.jpg?mw=987&hash=107E6AA78B323EAA3D17282F3AEC88D5",
  price: "$$",
  reviews: "1500",
  rating: "4.5",
  categories: [
    { title: "Thai" },
    { title: "Comfort Food" },
    { title: "Coffee" },
  ],
};

export default function About(props) {
  //props.route.params is the object contains all these info from route
  const {
    name,
    image,
    price,
    reviews,
    rating,
    categories,
    caption,
    manageable,
  } = props.route.params;

  const formattedCategories = categories.map((cat) => cat).join(" • ");

  const description = `${formattedCategories} ${
    price ? " • " + price : ""
  } •💲• ${rating} ⭐ (${reviews}+)`;

  const navigation = useNavigation();

  return (
    <View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          marginLeft: 10,
          top: 30,
          left: 5,
          zIndex: 1,
          position: "absolute",
          paddingVerticle: 9,
          borderRadius: 20,
          backgroundColor: "black",
        }}
      >
        {/* <Text style={{ fontSize: 17, color: '#fff' }}>◀Back</Text> */}
        <FontAwesome5 name={"arrow-alt-circle-left"} color={"#fff"} size={30} />
      </TouchableOpacity>
      {manageable && (
        <TouchableOpacity
          style={{
            marginLeft: 20,
            top: 30,
            right: 5,
            zIndex: 1,
            position: "absolute",
            paddingVerticle: 9,
            borderRadius: 20,
            backgroundColor: "black",
          }}
        >
          {/* <Text style={{ fontSize: 17, color: '#fff' }}>◀Back</Text> */}
          <FontAwesome5
            name={"arrow-alt-circle-left"}
            color={"#fff"}
            size={30}
          />
        </TouchableOpacity>
      )}
      <VenueImage image={image} />
      <VenueName name={name} />
      <VenueCaption caption={caption} />
      {/* <VenueDescription description={description} /> */}
    </View>
  );
}

const VenueImage = (props) => (
  <Image source={{ uri: props.image }} style={{ width: "100%", height: 180 }} />
);

const VenueName = (props) => (
  <Text
    style={{
      fontSize: 29,
      fontWeight: "600",
      marginTop: 10,
      marginHorizontal: 15,
    }}
  >
    {[props.name]}
  </Text>
);

const VenueCaption = (props) => (
  <Text
    style={{
      fontSize: 15.5,
      fontWeight: "400",
      marginTop: 10,
      marginHorizontal: 15,
    }}
  >
    {[props.caption]}
  </Text>
);

// const VenueDescription = (props) => (
//     <Text
//         style={{
//             fontSize: 15.5,
//             fontWeight: "400",
//             marginTop: 10,
//             marginHorizontal: 15,
//         }}>{[props.description]}</Text>
// )
