import React from "react";
import { StyleSheet, TextStyle, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import AppStyles from "../../styles/AppStyles";
import Loading from "./Loading";

const IconButton = ({
  icon,
  onPress,
  style,
  color,
  isLoading = false,
}: {
  icon: string;
  onPress: () => void;
  style?: TextStyle;
  color: string;
  isLoading?: boolean;
}) => (
  
  <TouchableOpacity onPress={onPress} style={style}>
    {isLoading && (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    )}
    <View style={isLoading && AppStyles.hidden}>
      <Icon name={icon} color={color} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    zIndex: 2,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default IconButton;
