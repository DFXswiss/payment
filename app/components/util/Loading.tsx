import React from "react";
import { View, ViewStyle } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Colors from "../../config/Colors";

const Loading = ({ size, style }: { size?: number | "small" | "large"; style?: ViewStyle }) => {
  return (
    <View>
      <ActivityIndicator size={size} color={Colors.Primary} style={style}></ActivityIndicator>
    </View>
  );
};

export default Loading;
