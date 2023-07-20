import { GOOGLE_API_KEY } from "./environments";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Text, StyleSheet } from "react-native";

export default function InputAutoComplete({
  label,
  placeholder,
  onPlaceSelected,
}) {
  return (
    <>
      <Text style={styles.textStyle}>{label}</Text>
      <GooglePlacesAutocomplete
        onPlaceSelected={() => {}}
        styles={{ textInput: styles.input }}
        placeholder={placeholder || ""}
        fetchDetails
        onPress={(data, details = null) => {
          onPlaceSelected(details);
          console.log(data, details);
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: "en",
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontWeight: "bold",
    color: "#292929",
  },

  input: {
    borderColor: "#888",
    borderWidth: 1,
    borderRadius: 8,
  },
});
