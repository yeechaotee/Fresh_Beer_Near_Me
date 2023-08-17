import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, onSnapshot, getDocs, limit, setDoc, doc, firestore, collectionGroup, query, where, arrayRemove, arrayUnion, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase";


export default function VenueItems({ navigation, ...props }) {

  const [userProfile, setUserProfile] = useState(null);

  // ***FIXES: reusable function within this page: for updating the latest changes everytime user toggling favourite icon or pull up loader!**
  const updateUserProfile = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const q = query(collection(FIRESTORE_DB, 'users'), where("owner_uid", "==", user.uid), limit(1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUserProfile(doc.data());
      });
    }
  };

  // getting current user info and profile details
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
            isActivated: ((venue.isActivated !== undefined || '') ? venue.isActivated : true),
          })
          }>

          <View style={{ marginTop: 10, padding: 15, backgroundColor: "white", }}>

            <VenueImage image={venue.image_url} userProfile={userProfile} venueId={venue.venueId} updateUserProfile={updateUserProfile} />
            <VenueInfo name={venue.name} categories={venue.categories} price={venue.price} reviews={venue.reviews} caption={venue.caption} rating={venue.rating} />

          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}

// converted VenueImage component to resuable component directly for other modules usage
export const VenueImage = (props) => {

  // for tracking whenever user toggle the heart shape icon state hook
  const [isFavorite, setIsFavorite] = useState(false);


  useEffect(() => {
    if (props.userProfile && props.userProfile.favVenues) {
      setIsFavorite(props.userProfile.favVenues.includes(props.venueId));
    }

  }, [props.userProfile, props.venueId]);

  // will trigger onpress component
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

        // if the current clicked favorite venue is alr in the favVenues list on firebase  (remove it)
        if (props.userProfile.favVenues && props.userProfile.favVenues.includes(props.venueId)) {

          await updateDoc(userDocRef, {
            favVenues: arrayRemove(props.venueId),
          });

          console.log("removing favourite from firebase list....");

        }

        // else add into list
        else {
          await updateDoc(userDocRef, {
            favVenues: arrayUnion(props.venueId),
          });

          console.log("adding favourite from firebase list....");
        }

        // ***Fixes for heart favourite not being captured and re-render whenever pull up loader or clicked multiple times on favourite icon!*** 
        const updatedUserQuerySnapshot = await getDocs(uquery);
        updatedUserQuerySnapshot.forEach((doc) => {
          props.updateUserProfile();
        });

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

      {/* ADDED: Only general user able to see favourite heart shape icon for favouriting their venues and update onto firebase 'users' --> 'favVenue' list */}
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
