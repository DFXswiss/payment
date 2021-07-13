import React from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Colors from "../../config/Colors";

const Loading = ({ size }: { size?: "small" | "large" }) => {
  return (
    <View>
      <ActivityIndicator size={size} color={Colors.Primary}></ActivityIndicator>
    </View>
  );
};

export default Loading;
