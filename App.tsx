import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("./assets/change_logo.png")}
      />
      <Text style={styles.text}>
        <Text style={{ color: "#ff00af" }}>DEFI</Text>CHANGE
      </Text>
      <Text>Coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 30,
  },
  image: {
    marginBottom: "1rem",
    width: 333,
    height: 270,
  },
});
