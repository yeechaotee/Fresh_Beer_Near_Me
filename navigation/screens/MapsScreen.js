import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Dimensions,
  Button,
  Image,
  Text,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";
//import darkModeStyle from "../../components/maps/darkMode.json";
import Constants from "expo-constants";
import InputAutoComplete from "../../components/maps/InputAutoComplete";
import { endAsyncEvent } from "react-native/Libraries/Performance/Systrace";
import GetRideModal from "../../components/maps/GetRide";

const { width, height } = Dimensions.get("window");

// location markers
let locationsOfInterest = [
  {
    title: "first",
    location: {
      latitude: 1.369778,
      longitude: 103.849437,
    },
    description: "my first marker",
  },
  {
    title: "second",
    location: {
      latitude: 1.316721,
      longitude: 103.882049,
    },
    description: "my second marker",
  },
  {
    title: "third",
    location: {
      latitude: 1.2931,
      longitude: 103.8558,
    },
    description: "my third marker",
  },
  {
    title: "fourth",
    location: {
      latitude: 1.3521,
      longitude: 103.8198,
    },
    description: "my fourth marker",
  },
  {
    title: "fifth",
    location: {
      latitude: 1.3066,
      longitude: 103.8549,
    },
    description: "my fifth marker",
  },
  {
    title: "sixth",
    location: {
      latitude: 1.2903,
      longitude: 103.8523,
    },
    description: "my sixth marker",
  },
];

export default function MapsScreen() {
  //get data from firebase, title, location, description
  const [venueData, setVenueData] = useState([]);
  const getVenueDataFromFirestore = async () => {
    try {
      // Get a reference to the "Venue" collection in Firestore
      const venueCollectionRef = collection(FIRESTORE_DB, "venues");

      // Execute the query and get the collection snapshot
      const querySnapshot = await getDocs(venueCollectionRef);

      // Initialize an empty array to hold the data
      const venueData = [];

      // Loop through the documents in the collection snapshot and extract the data
      querySnapshot.forEach((doc) => {
        // Get the data from each document
        const data = doc.data();

        // Add the data to the venueData array
        venueData.push(data);
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
          "Venue data retrieved from Firestore, caption: ",
          venueData[i].caption
        );
      }
    } catch (error) {
      console.log("Error getting venue data from Firestore:", error);
    }

    for (const venue of venueData) {
      try {
        const { latitude, longitude } = await geocodeAddress(venue.location);
        venue.latitude = latitude;
        venue.longitude = longitude;
        console.log("lat and long retrieved");
      } catch (error) {
        console.error(error.message);
      }
    }

    console.log(venueData); // Updated venueData array with latitude and longitude
    for (let i = 0; i < venueData.length; i++) {
      console.log("entry #", i);
      console.log(
        "Venue data retrieved from Firestore, name: ",
        venueData[i].name
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

    locationsOfInterest = venueData
      .filter(
        (data) =>
          typeof data.latitude !== "undefined" &&
          typeof data.longitude !== "undefined"
      )
      .map((data) => {
        return {
          title: data.name,
          location: {
            latitude: data.latitude,
            longitude: data.longitude,
          },
          description: data.caption,
        };
      });

    console.log("locations of interest");
    console.log(locationsOfInterest);
  };

  //geocode location to get coordinates
  //Function to geocode an address using the Google Maps Geocoding API
  async function geocodeAddress(address) {
    // Check if address is undefined
    if (typeof address === "undefined") {
      return "undefined"; // or any other appropriate value to indicate that geocoding was skipped
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

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        throw new Error("No results found for the address");
      }
    } catch (error) {
      throw new Error(`Error geocoding the address: ${address}`);
    }
  }

  // states
  const chekInPress = () => {
    console.log("User Location:", userLocation);
  };

  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const [userLocation, setUserLocation] = useState({
    latitude: 1.3525271913212642,
    latitudeDelta: 0.38941821562666146,
    longitude: 103.85964151471853,
    longitudeDelta: 0.1941436529159546,
  });

  const [destination, setDestination] = useState(null);

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
    return locationsOfInterest.map((item, index) => {
      return (
        <Marker
          key={index}
          coordinate={item.location}
          title={item.title}
          description={item.description}
        />
      );
    });
  };

  useEffect(() => {
    console.log("use effect run");
    const getPermissions = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log("status: " + status);
      if (status !== "granted") {
        console.log("Please grant location permission");
        return;
      }
      console.log("permissions checked");

      try {
        console.log("trying get location");
        let coords = await Location.getCurrentPositionAsync();
        setUserLocation(coords);
        console.log("location");
        console.log(coords);
        console.log("coordinates recorded");
      } catch (error) {
        console.log(error);
      }
    };
    getPermissions();

    console.log("getting venue data");
    getVenueDataFromFirestore();
    // console.log("updating venue data with coordinates");
    // updateVenueDataWithCoordinates();
  }, []);

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
          />
        )}
        {destination && (
          <Marker
            draggable
            coordinate={destination}
            title="destination"
            description="Your destination"
            onDragEnd={(e) => setDestination(e.nativeEvent.coordinate)}
          />
        )}
        {showLocationsOfInterest()}
      </MapView>
      <View style={styles.userLocationContainer}>
        <InputAutoComplete
          label="My Location"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "userLocation");
          }}
        />
        {/* <InputAutoComplete
          label="My Destination"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          }}
        /> */}
        <View
          style={{
            width: "50%",
            alignSelf: "center",
          }}
        >
          <Button title="Take me There" onPress={handleOpenModal} />
        </View>
      </View>
      <View>
        <GetRideModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
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
