import React from "react";
import { TextStyle, TouchableOpacity } from "react-native";
import { Button, Text } from "react-native-paper";
import Colors from "../config/Colors";
import AppStyles, { DefaultCursor } from "../styles/AppStyles";

export const ActionLink = ({ onPress, label, style }: { onPress: () => void; label: string; style?: TextStyle }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text style={AppStyles.link}>{label}</Text>
  </TouchableOpacity>
);

// TODO: use the paper button props?
export const DeFiButton = ({ link, loading, disabled, style, ...props }: any) => {
  const isDisabled = loading || disabled;
  return (
    <Button
      loading={loading}
      disabled={isDisabled}
      contentStyle={[props.contentStyle, isDisabled && DefaultCursor]}
      labelStyle={[
        props.labelStyle,
        link && AppStyles.buttonLink,
        props.mode === "contained" && { color: isDisabled ? Colors.Grey : Colors.White },
      ]}
      style={[style, { borderColor: Colors.Grey }]}
      {...props}
    >
      {props.children}
    </Button>
  );
};
