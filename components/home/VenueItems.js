import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where, arrayRemove, arrayUnion, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase";

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


  const [userProfile, setUserProfile] = useState(null);

  // For favourite heart shape icon hook
  const [isFavorite, setIsFavorite] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const q = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", user.uid), limit(1));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setUserProfile(doc.data());
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleFavorite = async (venueId) => {
    if (userProfile) {
      try {
        // const userDocRef = doc(FIRESTORE_DB, 'users', userProfile.userId);
        const userQuery = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", userProfile.owner_uid), limit(1));
        const userSnapshot = await getDocs(userQuery);
        let userId = null;

        userSnapshot.forEach((doc) => {
          userId = doc.id;
        });

        if (!userId) {
          console.log('User document not found');
          return;
        }

        const userDocRef = doc(FIRESTORE_DB, 'users', userId);

        if (userProfile.favVenues && userProfile.favVenues.includes(venueId)) {

          await updateDoc(userDocRef, {
            favVenues: arrayRemove(venueId),
          });
        }
        else {
          await updateDoc(userDocRef, {
            favVenues: arrayUnion(venueId),
          });
        }
      } catch (error) {
        console.log('Error toggling favorite:', error);
      }
    }
  };


  if (props.venueData == null) {
    return (
      <View >
        <Text >No venues found.</Text>
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
          onPress={() => navigation.navigate("VenueDetail", {
            name: venue.name,
            image: venue.image_url,
            price: venue.price,
            reviews: venue.reviews,
            rating: venue.rating,
            categories: venue.categories,
            caption: venue.caption,
            manageable: props.manageable,
            operating_hour: venue.operating_hour,
            location: venue.location,
            venueId: (venue.venueId ? venue.venueId : ''),
          })
          }>

          <View style={{ marginTop: 10, padding: 15, backgroundColor: "white", }}>
            {/* Venue Image */}
            {/* {console.log("Menu item is"+venue.MenuItems)} */}
            <VenueImage image={venue.image_url} userProfile={userProfile} venueId={venue.venueId} />
            {/* Venue Info */}
            <VenueInfo name={venue.name} categories={venue.categories} price={venue.price} reviews={venue.reviews} caption={venue.caption} rating={venue.rating} />
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}


export const VenueImage = (props) => {

  const [isFavorite, setIsFavorite] = useState(false);


  useEffect(() => {
    if (props.userProfile && props.userProfile.favVenues) {
      setIsFavorite(props.userProfile.favVenues.includes(props.venueId));
    }
  }, [props.userProfile, props.venueId]);

  const toggleFavorite = async () => {
    if (props.userProfile) {
      try {

        const uquery = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", props.userProfile.owner_uid), limit(1));
        const onSnap = await getDocs(uquery);
        let userId = null;

        onSnap.forEach((doc) => {
          userId = doc.id;
        });

        if (!userId) {
          console.log('User document not found');
          return;
        }

        const userDocRef = doc(FIRESTORE_DB, 'users', userId);

        if (props.userProfile.favVenues && props.userProfile.favVenues.includes(props.venueId)) {

          await updateDoc(userDocRef, {
            favVenues: arrayRemove(props.venueId),
          });


        }

        else {
          await updateDoc(userDocRef, {
            favVenues: arrayUnion(props.venueId),
          });
        }

        setIsFavorite(!isFavorite);

      }
      catch (error) {
        console.log('Error toggling favorite:', error);
      }
    }
  };

  return (
    <>
      <Image
        source={{
          uri: props.image,
        }}
        style={{ width: '100%', height: 180 }}
      />

      {props.userProfile && props.userProfile.role === 'user' && (
        <TouchableOpacity
          style={{ position: 'absolute', right: 20, top: 20 }} onPress={toggleFavorite}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={25}
            color={isFavorite ? 'red' : '#fff'}
          />
        </TouchableOpacity>
      )}
    </>
  );
};



export const VenueInfo = (props) => (
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
        .join(" • ")} ${props.price ? " • " + props.price : ""} •💲• ${props.rating
        } ⭐ (${props.reviews}+)`}</Text>

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
