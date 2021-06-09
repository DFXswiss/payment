import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import colors from "../config/colors";
import AppStyles from "../styles/AppStyles";

const HomeScreen = () => {
  return (
    <View style={[AppStyles.container, styles.container]}>
      <Image
        style={styles.image}
        source={require("../assets/change_logo.png")}
      />
      <Text style={styles.text}>
        <Text style={{ color: colors.primary }}>DEFI</Text>CHANGE
      </Text>
      <Text>Coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

export default HomeScreen;
