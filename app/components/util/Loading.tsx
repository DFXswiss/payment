import React from "react";
import { ActivityIndicator, View } from "react-native";
import Colors from "../../config/Colors";

const Loading = ({ size }: { size?: "small" | "large" }) => {
  return (
    <View>
      <ActivityIndicator size={size} color={Colors.Primary}></ActivityIndicator>
    </View>
  );
};

export default Loading;
