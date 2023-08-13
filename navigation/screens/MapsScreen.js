import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Dimensions,
  Button,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";
//import darkModeStyle from "../../components/maps/darkMode.json";
import Constants from "expo-constants";
import InputAutoComplete from "../../components/maps/InputAutoComplete";
import { endAsyncEvent } from "react-native/Libraries/Performance/Systrace";
import GetRideModal from "../../components/maps/GetRide";
import MapInfoModal from "../../components/maps/MapInfo";
import { FIRESTORE_DB } from "../../firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  getDocs,
  limit,
  setDoc,
  doc,
  firestore,
  collectionGroup,
  query,
  where,
} from "firebase/firestore";
import { GOOGLE_API_KEY } from "../../components/maps/environments";
import axios from "axios";
import { useNavigation } from "@react-navigation/native"; // Import the useNavigation hook
import { Searchbar } from "react-native-paper";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

export default function MapsScreen() {
  const navigation = useNavigation();

  //states
  const [venueData, setVenueData] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: 1.3525271913212642,
    latitudeDelta: 0.38941821562666146,
    longitude: 103.85964151471853,
    longitudeDelta: 0.1941436529159546,
  });
  const [destination, setDestination] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapInfoModalVisible, setMapInfoModalVisible] = useState(false);
  const [selectedLocationTitle, setSelectedLocationTitle] = useState("");
  //const [markerPressCount, setMarkerPressCount] = useState(0);
  const [lastPressedMarkerIndex, setLastPressedMarkerIndex] = useState(-1); // Initialize with an invalid index
  const [searchString, setSearchString] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [isCheckmarkVisible, setIsCheckmarkVisible] = useState(false);

  //geocode location to get coordinates
  //Function to geocode an address using the Google Maps Geocoding API
  const geocodeAddress = async (address) => {
    // Check if address is undefined
    if (!address) {
      return { latitude: 0, longitude: 0 }; // Return an appropriate value when geocoding is skipped
    }

    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: address,
            key: GOOGLE_API_KEY,
          },
        }
      );

      // Check if the response has results and the status is "OK"
      if (response.data.results && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        return { latitude: 0, longitude: 0 };
      }
    } catch (error) {
      console.error("Error during geocoding:", error);
      return { latitude: 0, longitude: 0 };
    }
  };

  const getVenueDataFromFirestore = async () => {
    try {
      // Get a reference to the "Venue" collection in Firestore
      const venueCollectionRef = collection(FIRESTORE_DB, "venues");

      // Execute the query and get the collection snapshot
      const querySnapshot = await getDocs(venueCollectionRef);

      // Initialize an array to store Promises for geocoding each venue
      const geocodePromises = [];

      // Initialize an empty array to hold the data
      const venueData = [];

      // Loop through the documents in the collection snapshot and extract the data
      querySnapshot.forEach(async (doc) => {
        // Get the data from each document
        const data = doc.data();

        // Add the data to the venueData array
        venueData.push(data);

        // Add a Promise for geocoding the location to the array
        geocodePromises.push(geocodeAddress(data.location));
      });

      // Wait for all the geocoding Promises to resolve
      const geocodedLocations = await Promise.all(geocodePromises);

      // Update venueData with geocoded coordinates
      venueData.forEach((venue, index) => {
        const geocodedLocation = geocodedLocations[index];
        if (
          geocodedLocation.latitude !== "undefined" &&
          geocodedLocation.longitude !== "undefined"
        ) {
          venue.latitude = geocodedLocation.latitude;
          venue.longitude = geocodedLocation.longitude;
        } else {
          console.log("Geocoding failed for venue:", venue.location);
          venue.latitude = "undefined";
          venue.longitude = "undefined";
        }
      });

      // Update the state with the retrieved venue data
      setVenueData(venueData);

      //debug statements
      console.log("Venue data retrieved from Firestore:", venueData);
      console.log("trying to get specific contents");

      for (let i = 0; i < venueData.length; i++) {
        console.log("entry #", i);
        console.log(
          "Venue data retrieved from Firestore, name: ",
          venueData[i].name
        );
        console.log(
          "Venue data retrieved from Firestore,location: ",
          venueData[i].location
        );
        console.log(
          "Venue data retrieved from Firestore,latitude: ",
          venueData[i].latitude
        );
        console.log(
          "Venue data retrieved from Firestore,longitude: ",
          venueData[i].longitude
        );
        console.log(
          "Venue data retrieved from Firestore, caption: ",
          venueData[i].caption
        );
      }
    } catch (error) {
      console.log("Error getting venue data from Firestore:", error);
    }
  };

  const chekInPress = () => {
    console.log("User Location:", userLocation);
    // Show the checkmark animation
    setIsCheckmarkVisible(true);

    // Hide the checkmark animation after the animation completes
    setTimeout(() => {
      setIsCheckmarkVisible(false);
    }, 4000); // Adjust the duration as needed based on the animation duration
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleOpenMapInfoModal = (title) => {
    setSelectedLocationTitle(title);
    console.log("Selected Location Title:", title);
    setMapInfoModalVisible(true);
  };

  const mapRef = useRef(null);

  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  const onPlaceSelected = (details, flag) => {
    console.log("Selected Place:", details);
    console.log("Flag:", flag);
    if (details && details.geometry && details.geometry.location) {
      const position = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };

      // Perform different actions based on the flag value
      if (flag === "userLocation") {
        // Handle user location
        setUserLocation(position);
      } else if (flag === "destination") {
        // Handle destination location
        setDestination(position);
      } else {
        // Invalid flag value
      }
      moveTo(position);
    } else {
      console.log("No place selected");
    }
  };

  const showLocationsOfInterest = () => {
    return venueData.map((item, index) => {
      const latitude = parseFloat(item.latitude); // Convert latitude to a floating-point number
      const longitude = parseFloat(item.longitude); // Convert longitude to a floating-point number

      if (isNaN(latitude) || isNaN(longitude)) {
        console.error(
          `Invalid latitude or longitude for item at index ${index}:`,
          item
        );
        return null; // Return null if conversion failed
      }

      return (
        <Marker
          key={index}
          pinColor="#ff4500"
          coordinate={{ latitude: item.latitude, longitude: item.longitude }}
          title={item.name}
          description={item.caption}
          onPress={() => {
            if (lastPressedMarkerIndex === index) {
              // Second press on the same marker
              handleOpenMapInfoModal(item.name);
              setLastPressedMarkerIndex(-1); // Reset the marker index
            } else {
              setLastPressedMarkerIndex(index); // Set the current marker index
            }
          }}
        />
      );
    });
  };

  // Promise wrapper for getVenueDataFromFirestore
  const getVenueDataPromise = async () => {
    try {
      await getVenueDataFromFirestore();
    } catch (error) {
      console.log("Error getting venue data from Firestore:", error);
    }
  };

  useEffect(() => {
    console.log("use effect run");
    const fetchDataAndPopulateLocations = async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log("status: " + status);
        if (status !== "granted") {
          console.log("Please grant location permission");
          return;
        }

        console.log("permissions checked");

        // Get current user location
        console.log("trying get location");
        let coords = await Location.getCurrentPositionAsync();
        setUserLocation(coords);
        console.log("location: ", coords);
        console.log("coordinates recorded");

        // Use Promise.all to wait for all getVenueDataFromFirestore calls
        await Promise.all([getVenueDataPromise()]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDataAndPopulateLocations();
  }, []);

  const handleSearchInput = async (text) => {
    setSearchString(text);

    if (text !== "") {
      const q = query(
        collection(FIRESTORE_DB, "venues"),
        where("name", ">=", searchString),
        where("name", "<=", searchString + "\uf8ff"),
        limit(2)
      );
      // console.log("user id is:: " + user.uid);
      const querySnapshot = await getDocs(q);
      setSuggestion(querySnapshot.docs);
    }
  };

  return (
    <View style={styles.viewStyle}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={userLocation}
        //customMapStyle={darkModeStyle}
      >
        {userLocation && (
          <Marker
            draggable
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            onDragEnd={(e) => setUserLocation(e.nativeEvent.coordinate)}
            pinColor="blue"
          />
        )}
        {/* {destination && (
          <Marker
            draggable
            coordinate={destination}
            title="destination"
            description="Your destination"
            onDragEnd={(e) => setDestination(e.nativeEvent.coordinate)}
          />
        )} */}
        {showLocationsOfInterest()}
      </MapView>
      <View style={styles.userLocationContainer}>
        <View>
          <InputAutoComplete
            label="My Location"
            onPlaceSelected={(details) => {
              onPlaceSelected(details, "userLocation");
            }}
          />
        </View>
        {/* <InputAutoComplete
          label="My Destination"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          }}
        /> */}
        <View>
          <Searchbar
            placeholder="Search for venue..."
            ref={(search) => (this.search = search)}
            onChangeText={handleSearchInput}
            value={searchString}
            lightTheme={true}
            round={true}
            containerStyle={{ backgroundColor: "beige" }}
          />
        </View>
        <View>
          {suggestion.length > 0 && searchString !== "" && (
            <View
              style={{
                alignItems: "center",
                zIndex: 15,
                elevation: Platform.OS === "android" ? 50 : 0,
              }}
            >
              {suggestion.map((suggestionVenue, index) => {
                return (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "white",
                      borderColor: "#CECECE",
                      borderWidth: 1,
                      width: "95%",
                      borderRadius: 5,
                    }}
                    onPress={() =>
                      navigation.navigate("VenueDetail", {
                        name: suggestionVenue.data().name,
                        image: suggestionVenue.data().image_url,
                        price: suggestionVenue.data().price,
                        reviews: suggestionVenue.data().reviews,
                        rating: suggestionVenue.data().rating,
                        categories: suggestionVenue.data().categories,
                        caption: suggestionVenue.data().caption,
                        operating_hour: suggestionVenue.data().operating_hour,
                        location: suggestionVenue.data().location,
                        venueId: suggestionVenue.id,
                      })
                    }
                    key={index}
                    activeOpacity={1}
                  >
                    <Text style={{ padding: 10, fontSize: 17 }}>
                      {suggestionVenue.data().name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
        <View
          style={{
            width: "50%",
            alignSelf: "center",
          }}
        >
          <Button title="Take me There" onPress={handleOpenModal} />
          {/* <Button title="Temp button" onPress={handleOpenMapInfoModal} /> */}
        </View>
      </View>
      <View>
        <GetRideModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </View>
      <View>
        <MapInfoModal
          modalVisible={mapInfoModalVisible}
          setModalVisible={setMapInfoModalVisible}
          locationTitle={selectedLocationTitle} // Pass the selected location title to the modal
          navigation={navigation}
        />
      </View>
      <View style={styles.checkIn}>
        <Pressable
          onPress={chekInPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignContent: "center",
            top: 5,
          }}
        >
          <Image
            source={require("../../assets/navIcons/beermap.png")}
            style={{
              width: 40,
              height: 40,
              tintColor: "#292929",
            }}
          />
          <Text style={{ color: "#292929" }}>Check In</Text>
        </Pressable>
      </View>
      {/* Checkmark Animation */}
      {isCheckmarkVisible && (
        <LottieView
          source={require("../../assets/animations/check-mark.json")} // Provide the correct path to your checkmark animation JSON file
          autoPlay
          loop={false}
          style={{
            position: "absolute",
            bottom: 30, // Adjust the position as needed
            right: 30, // Adjust the position as needed
            width: 100,
            height: 100,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  map: {
    width: width,
    height: height,
  },
  userLocationContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "#ffa31a",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    color: "#ffffff",
    top: Constants.statusBarHeight,
    opacity: 0.85,
  },
  checkIn: {
    position: "absolute",
    alignItems: "center",
    alignContent: "center",
    bottom: 10,
    right: 10,
    height: 50,
    width: 120,
    backgroundColor: "#ffa31a",
    borderRadius: 30,
    opacity: 0.85,
  },
});
